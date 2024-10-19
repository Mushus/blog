import { Duration, PhysicalName, Stack, StackProps } from "aws-cdk-lib";
import {
  AllowedMethods,
  type BehaviorOptions,
  CachePolicy,
  Distribution,
  experimental,
  LambdaEdgeEventType,
  OriginAccessIdentity,
  OriginRequestCookieBehavior,
  OriginRequestHeaderBehavior,
  OriginRequestPolicy,
  OriginRequestQueryStringBehavior,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import {
  FunctionUrlOrigin,
  S3Origin,
} from "aws-cdk-lib/aws-cloudfront-origins";
import { AttributeType, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Code, FunctionUrlAuthType, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import type { Construct } from "constructs";
import * as path from "node:path";
import type { BlogCertStack } from "./BlogCertStack";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface Props extends StackProps {
  certStack: BlogCertStack;
}

export class BlogStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'BlogQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    /** 動的なアセットを格納するバケット */
    const dynamicAsset = new Bucket(this, "DynamicAsset", {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
    });

    /** 画像のリクエストをルーティングするLambda */
    const imageViewerRequest = new experimental.EdgeFunction(
      this,
      "ImageViewerRequest",
      {
        runtime: Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: Code.fromCustomCommand("dist/image/viewer-request", [
          "npm",
          "run",
          "build:image-viewer-request",
        ]),
      }
    );

    /** レスポンス画像を変換するLambda */
    const imageOriginResponse = new experimental.EdgeFunction(
      this,
      "ImageOriginResponse",
      {
        runtime: Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: Code.fromDockerBuild("assets/image/origin-response", {}),
        timeout: Duration.seconds(30),
      }
    );
    dynamicAsset.grantReadWrite(imageOriginResponse);

    const usersTable = new TableV2(this, "Users", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      globalSecondaryIndexes: [
        {
          indexName: "Username",
          partitionKey: { name: "username", type: AttributeType.STRING },
        },
      ],
    });

    const postsTable = new TableV2(this, "Posts", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      sortKey: { name: "createdAt", type: AttributeType.STRING },
      globalSecondaryIndexes: [
        {
          indexName: "all",
          partitionKey: { name: "all", type: AttributeType.STRING },
          sortKey: { name: "createdAt", type: AttributeType.STRING },
        },
        {
          indexName: "published",
          partitionKey: { name: "published", type: AttributeType.STRING },
          sortKey: { name: "createdAt", type: AttributeType.STRING },
        },
      ],
    });

    const sessionsTable = new TableV2(this, "Sessions", {
      partitionKey: { name: "token", type: AttributeType.STRING },
    });

    const imagesTable = new TableV2(this, "Images", {
      partitionKey: { name: "key", type: AttributeType.STRING },
    });

    const assets = new Bucket(this, "Assets", {});

    const fn = new NodejsFunction(this, "WebApp", {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "../", "assets/web/dist/index.js"),
      environment: {
        USERS_TABLE_NAME: usersTable.tableName,
        POSTS_TABLE_NAME: postsTable.tableName,
        SESSIONS_TABLE_NAME: sessionsTable.tableName,
        IMAGES_TABLE_NAME: imagesTable.tableName,
        IMAGES_BUCKET_NAME: dynamicAsset.bucketName,
        IMAGES_OBJECT_PREFIX: "image/original",
      },
      timeout: Duration.seconds(30),
    });
    usersTable.grantReadWriteData(fn);
    postsTable.grantReadWriteData(fn);
    sessionsTable.grantReadWriteData(fn);
    imagesTable.grantReadWriteData(fn);

    const fnUrl = fn.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    const dynamicAssetOAI = new OriginAccessIdentity(this, "DynamicAssetOAI");
    dynamicAsset.grantRead(dynamicAssetOAI);
    const imageOrigin = new S3Origin(dynamicAsset, {
      originAccessIdentity: dynamicAssetOAI,
    });
    const imageBehavior: BehaviorOptions = {
      origin: imageOrigin,
      viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
      cachePolicy: CachePolicy.CACHING_OPTIMIZED,
      allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
      edgeLambdas: [
        {
          functionVersion: imageViewerRequest.currentVersion,
          eventType: LambdaEdgeEventType.VIEWER_REQUEST,
          includeBody: false,
        },
        {
          functionVersion: imageOriginResponse.currentVersion,
          eventType: LambdaEdgeEventType.ORIGIN_RESPONSE,
        },
      ],
    };

    const assetsOAI = new OriginAccessIdentity(this, "AssetsOAI");
    assets.grantRead(assetsOAI);
    const assetOrigin = new S3Origin(assets, {
      originAccessIdentity: assetsOAI,
    });
    const staticBehavior: BehaviorOptions = {
      origin: assetOrigin,
      viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
      cachePolicy: CachePolicy.CACHING_OPTIMIZED,
      allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
    };

    const originRequestPolicy = new OriginRequestPolicy(
      this,
      "OriginRequestPolicy",
      {
        queryStringBehavior: OriginRequestQueryStringBehavior.all(),
        cookieBehavior: OriginRequestCookieBehavior.all(),
        headerBehavior: OriginRequestHeaderBehavior.denyList("Host"),
      }
    );

    const distribution = new Distribution(this, "Distribution", {
      domainNames: [props.certStack.domainName],
      certificate: props.certStack.certificate,
      defaultBehavior: {
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        origin: new FunctionUrlOrigin(fnUrl),
        cachePolicy: CachePolicy.CACHING_DISABLED,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        originRequestPolicy: originRequestPolicy,
        responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
      },
      additionalBehaviors: {
        "robots.txt": staticBehavior,
        "/favicon.ico": staticBehavior,
        "/static/*": staticBehavior,
        "/.vite/*": staticBehavior,
        "/image/*": imageBehavior,
      },
    });

    new ARecord(this, "ARecord", {
      zone: props.certStack.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      recordName: "blog",
    });

    new BucketDeployment(this, "AssetsDeployment", {
      sources: [
        Source.asset(path.join(__dirname, "../", "assets/web/dist"), {
          exclude: ["index.js"],
        }),
      ],
      destinationBucket: assets,
      distribution,
      distributionPaths: ["/*"],
    });
  }
}

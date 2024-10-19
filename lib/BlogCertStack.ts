import * as cdk from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone, type IHostedZone } from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class BlogCertStack extends cdk.Stack {
  public readonly hostedZone: IHostedZone;
  public readonly certificate: Certificate;
  public readonly domainName: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = "blog.mushus.net";

    const hostedZone = HostedZone.fromLookup(this, "HostedZone", {
      domainName: "mushus.net",
    });

    const certificate = new Certificate(this, "Cert", {
      domainName: domainName,
      validation: CertificateValidation.fromDns(hostedZone),
    });

    this.hostedZone = hostedZone;
    this.certificate = certificate;
    this.domainName = domainName;
  }
}

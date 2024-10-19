import {
  DeleteCommand,
  QueryCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "./client";
import { Temporal } from "temporal-polyfill";
import type { Image } from "../image";

type DynamoKey = Pick<Image, "key">;
type DynamoImage = Omit<Image, "createdAt"> & {
  createdAt: string;
};

const TableName = process.env.IMAGES_TABLE_NAME ?? "";

export async function saveImage({
  key,
  createdAt,
  ownerId,
}: Image): Promise<void> {
  const command = new PutCommand({
    TableName,
    Item: {
      key,
      createdAt: createdAt.toString(),
      ownerId,
    } satisfies DynamoImage,
  });

  await docClient.send(command);
}

export async function findImage(
  imageId: string,
  ownerId: string
): Promise<Image | undefined> {
  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: "#id = :id and #ownerId = :ownerId",
    ExpressionAttributeNames: {
      "#id": "id",
      "#ownerId": "ownerId",
    },
    ExpressionAttributeValues: {
      ":id": imageId,
      ":ownerId": ownerId,
    },
  });
  const res = await docClient.send(command);
  if ((res.Count ?? 0) === 0) {
    return undefined;
  }
  const item = res.Items?.[0] as DynamoImage;

  return createImage(item);
}

export async function listImages(): Promise<Image[]> {
  const query = new ScanCommand({
    TableName,
    Limit: 20,
  });

  const res = await docClient.send(query);
  if (res.Items === undefined) {
    return [];
  }
  const items = res.Items as unknown[] as DynamoImage[];
  return items.map(createImage);
}

function createImage(item: DynamoImage): Image {
  console.log(item);
  return {
    ...item,
    createdAt: Temporal.Instant.from(item.createdAt),
  };
}

export async function deleteImage(key: string): Promise<void> {
  const command = new DeleteCommand({
    TableName,
    Key: {
      key,
    } satisfies DynamoKey,
  });
  await docClient.send(command);
}

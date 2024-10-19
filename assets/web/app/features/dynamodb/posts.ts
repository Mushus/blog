import {
  DeleteCommand,
  QueryCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Post } from "../post";
import { docClient } from "./client";
import { Temporal } from "temporal-polyfill";

type DynamoKey = Pick<Post, "id">;
type DynamoPost = Omit<Post, "published" | "createdAt" | "updatedAt"> & {
  // NOTE: ソートするためにはQueryが必要で、そのためには必ずPartition Keyになるため常に同じ値が入ったプロパティが必要
  all: "#";
  published: "true" | "false";
  createdAt: string;
  updatedAt: string;
};

const TableName = process.env.POSTS_TABLE_NAME ?? "";

export async function savePost(post: Post): Promise<void> {
  const command = new PutCommand({
    TableName,
    Item: {
      all: "#",
      ...post,
      published: post.published ? "true" : "false",
      createdAt: post.createdAt.toString(),
      updatedAt: post.updatedAt.toString(),
    } satisfies DynamoPost,
  });

  await docClient.send(command);
}

export async function findPost(postId: string): Promise<Post | undefined> {
  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: "#id = :id",
    ExpressionAttributeNames: {
      "#id": "id",
    },
    ExpressionAttributeValues: {
      ":id": postId,
    },
  });
  const res = await docClient.send(command);
  if ((res.Count ?? 0) === 0) return undefined;

  const item = res.Items?.[0] as DynamoPost;

  return createPost(item);
}

export async function findPublishedPost(
  postId: string
): Promise<Post | undefined> {
  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: "#id = :id",
    FilterExpression: "#published = :published",
    ExpressionAttributeNames: {
      "#id": "id",
      "#published": "published",
    },
    ExpressionAttributeValues: {
      ":id": postId,
      ":published": "true",
    },
  });
  const res = await docClient.send(command);
  if ((res.Count ?? 0) === 0) return undefined;

  const item = res.Items?.[0] as DynamoPost;

  return createPost(item);
}

export async function listAllPosts(): Promise<Post[]> {
  const query = new QueryCommand({
    TableName,
    IndexName: "all",
    KeyConditionExpression: "#all = :all",
    ExpressionAttributeNames: {
      "#all": "all",
    },
    ExpressionAttributeValues: {
      ":all": "#",
    },
    Limit: 20,
    ScanIndexForward: false,
  });

  const res = await docClient.send(query);
  if (res.Items === undefined) return [];

  const items = res.Items as unknown[] as DynamoPost[];
  return items.map(createPost);
}

export async function listPublishedPosts(): Promise<Post[]> {
  const query = new QueryCommand({
    TableName,
    IndexName: "published",
    KeyConditionExpression: "#published = :published",
    ExpressionAttributeNames: {
      "#published": "published",
    },
    ExpressionAttributeValues: {
      ":published": "true",
    },
    Limit: 20,
    ScanIndexForward: false,
  });

  const res = await docClient.send(query);
  if (res.Items === undefined) return [];

  const items = res.Items as unknown[] as DynamoPost[];
  return items.map(createPost);
}

function createPost(item: DynamoPost): Post {
  return {
    ...item,
    published: item.published === "true",
    createdAt: Temporal.Instant.from(item.createdAt),
    updatedAt: Temporal.Instant.from(item.updatedAt),
  };
}

export async function deletePost(postId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName,
    Key: {
      id: postId,
    } satisfies DynamoKey,
  });
  await docClient.send(command);
}

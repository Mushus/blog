import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./client";
import type { User } from "../user";

type DynamoKey = Pick<User, "id">;
type DynamoUser = User;

const TableName = process.env.USERS_TABLE_NAME ?? "";
const UsernameIndex = "Username";

export async function saveUser(user: User) {
  const command = new PutCommand({
    TableName,
    Item: user satisfies DynamoUser,
  });

  await docClient.send(command);
}

export async function findUser(id: string): Promise<User | undefined> {
  const command = new GetCommand({
    TableName,
    Key: {
      id,
    } satisfies DynamoKey,
  });
  const res = await docClient.send(command);
  if (res.Item === undefined) {
    return undefined;
  }
  const item = res.Item as DynamoUser;

  return item;
}

export async function findUserByUsername(
  username: string
): Promise<User | undefined> {
  const command = new QueryCommand({
    TableName,
    IndexName: UsernameIndex,
    KeyConditionExpression: "#username = :username",
    ExpressionAttributeNames: {
      "#username": "username",
    },
    ExpressionAttributeValues: {
      ":username": username,
    },
  });
  const res = await docClient.send(command);
  if ((res.Count ?? 0) === 0) {
    return undefined;
  }
  const item = res.Items?.[0] as DynamoUser;
  return item;
}

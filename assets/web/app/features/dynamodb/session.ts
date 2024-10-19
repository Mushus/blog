import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./client";
import type { Session } from "../auth";

type DynamoKey = Pick<DynamoSession, "token">;
type DynamoSession = Session;

const TableName = process.env.SESSIONS_TABLE_NAME ?? "";

export async function findSession(token: string): Promise<Session | undefined> {
  const command = new GetCommand({
    TableName,
    Key: {
      token,
    } satisfies DynamoKey,
  });
  const res = await docClient.send(command);
  if (res.Item === undefined) {
    return undefined;
  }

  const item = res.Item as DynamoSession;
  return item;
}

export async function deleteSession(token: string): Promise<void> {
  const command = new DeleteCommand({
    TableName,
    Key: {
      token,
    } satisfies DynamoKey,
  });
  await docClient.send(command);
}

export async function saveSession(token: Session): Promise<void> {
  const command = new PutCommand({
    TableName,
    Item: token satisfies DynamoSession,
  });
  await docClient.send(command);
}

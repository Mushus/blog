import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { deleteSession, findSession, saveSession } from "./dynamodb/session";
import * as crypto from "node:crypto";
import { Route } from "./route";

const tokenCookieKey = "token";
const sessionKey = Symbol("session");

export type Session = {
  token: string;
  userId: string;
};

type SessionEnv = {
  Variables: {
    [sessionKey]: Session | undefined;
  };
};

/** クッキーからトークンを取得する */
function getTokenCookie(c: Context) {
  return getCookie(c, tokenCookieKey);
}

/** クッキーにトークンを設定する */
function setTokenCookie(c: Context, token: string) {
  setCookie(c, tokenCookieKey, token, { httpOnly: true, secure: true });
}

/** クッキーからトークンを削除する */
function deleteTokenCookie(c: Context) {
  deleteCookie(c, tokenCookieKey);
}

/** セッション情報をcontextから取得する */
function getSessionEnv(c: Context<SessionEnv>): Session | undefined {
  return c.get(sessionKey);
}

/** セッション情報をcontextに設定する */
function setSessionEnv(c: Context<SessionEnv>, session: Session | undefined) {
  c.set(sessionKey, session);
}

/** ログアウト処理 */
export async function logout(c: Context) {
  const session = getSessionEnv(c);
  if (session === undefined) {
    return;
  }

  deleteTokenCookie(c);
  setSessionEnv(c, undefined);
  await deleteSession(session.token);
}

/** ユーザーとしてログイン */
export async function loginAs(c: Context, userId: string): Promise<Session> {
  const token = crypto.randomBytes(32).toString("base64");
  const session = {
    token: token,
    userId: userId,
  };
  setTokenCookie(c, token);
  setSessionEnv(c, session);
  await saveSession(session);
  return session;
}

/** セッション情報を取得する */
export function getSession(c: Context): Session | undefined {
  return getSessionEnv(c);
}

/**
 * セッション情報を取得する
 * セッション情報がない場合はエラーを返す
 */
export function mustGetSession(c: Context): Session {
  const session = getSessionEnv(c);
  if (session === undefined) {
    throw new Error("session not found");
  }
  return session;
}

/** セッションミドルウェア */
export const session = createMiddleware(async (c, next) => {
  const token = await getTokenCookie(c);
  if (token === undefined || token === "") {
    await next();
    return;
  }

  const session = await findSession(token);
  if (session === undefined) {
    // 間違ったトークンが設定されているので削除
    deleteTokenCookie(c);
    await next();
    return;
  }

  setSessionEnv(c, session);
  await next();
  return;
});

/** 認証必須ミドルウェア */
export const auth = createMiddleware(async (c, next) => {
  const session = getSessionEnv(c);
  if (session === undefined) {
    return c.redirect(Route.login);
  }
  await next();
  return;
});

import { randomUUID } from "node:crypto";
import {
  findUserByUsername as findUserByUsernameInDynamo,
  findUser as findUserInDynamo,
  saveUser,
} from "./dynamodb/user";
import bcrypt from "bcryptjs";

export type CreatedUser = Omit<User, "id">;
export type UpdatedUser = Omit<User, "password"> & {
  password?: string | undefined;
};

export type User = {
  id: string;
  displayName: string;
  username: string;
  password: string;
  image: string;
};

export type SecureUser = Omit<User, "password">;

const userRegister = Boolean(process.env.USER_REGISTER);

function toSecureUser(user: User): SecureUser;
function toSecureUser(user: User | undefined): SecureUser | undefined;
function toSecureUser(user: User | undefined): SecureUser | undefined {
  if (!user) return undefined;
  const { password, ...secureUser } = user;
  return secureUser;
}

const saltRounds = 10;

function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function createUser({
  password,
  ...created
}: CreatedUser): Promise<SecureUser | undefined> {
  if (!userRegister) return undefined;
  const id = randomUUID();
  const passwordHash = await hashPassword(password);
  const user = { id, ...created, password: passwordHash };
  await saveUser(user);
  return toSecureUser(user);
}

export async function updateUser(info: UpdatedUser): Promise<SecureUser> {
  const user = await findUserInDynamo(info.id);
  if (!user) throw new Error("user not found");

  const updated: User = {
    ...info,
    password: info.password ? await hashPassword(info.password) : user.password,
  };

  await saveUser(updated);
  return toSecureUser(updated);
}

export async function authUser(
  username: string,
  password: string
): Promise<SecureUser | undefined> {
  const user = await findUserByUsernameInDynamo(username);
  if (user === undefined) {
    return undefined;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return undefined;
  }

  return toSecureUser(user);
}

export async function findUser(id: string) {
  const user = await findUserInDynamo(id);
  return toSecureUser(user);
}

export async function findUserByUsername(username: string) {
  const user = await findUserByUsernameInDynamo(username);
  return toSecureUser(user);
}

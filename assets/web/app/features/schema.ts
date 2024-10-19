import * as v from "valibot";

export const LoginSchema = v.object({
  username: v.string(),
  password: v.string(),
});

export const PostFormSchema = v.object({
  title: v.string(),
  content: v.string(),
  published: v.optional(v.literal("on")),
});

export const UserRegisterSchema = v.object({
  username: v.string(),
  password: v.string(),
  displayName: v.string(),
  image: v.string(),
});

export const UserEditFormSchema = v.object({
  username: v.string(),
  password: v.optional(v.string()),
  displayName: v.string(),
  image: v.string(),
});

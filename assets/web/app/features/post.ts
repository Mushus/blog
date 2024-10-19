// import { ulid } from "ulid";
import {
  savePost,
  deletePost,
  findPost,
  findPublishedPost,
  listAllPosts,
  listPublishedPosts,
} from "./dynamodb/posts";
import type { Temporal } from "temporal-polyfill";
import { ulid } from "ulid";

export {
  deletePost,
  findPost,
  findPublishedPost,
  listAllPosts,
  listPublishedPosts,
};

export type CreatedPost = Omit<Post, "id" | "createdAt" | "updatedAt">;
export type UpdatedPost = Omit<Post, "createdAt" | "updatedAt">;
export type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: Temporal.Instant;
  updatedAt: Temporal.Instant;
  ownerId: string;
  published: boolean;
};

export async function createPost(
  created: CreatedPost,
  creatingTime: Temporal.Instant
): Promise<Post> {
  const id = ulid();

  const post: Post = {
    id,
    ...created,
    createdAt: creatingTime,
    updatedAt: creatingTime,
  };
  await savePost(post);

  return post;
}

export async function updatePost(
  updated: UpdatedPost,
  creatingTime: Temporal.Instant
): Promise<Post> {
  const post = await findPost(updated.id);
  if (post?.ownerId !== updated.ownerId) {
    throw new Error("Permission denied");
  }

  await savePost({ ...post, ...updated, updatedAt: creatingTime });
  return post;
}

import { createRoute } from "honox/factory";
import { auth, mustGetSession } from "@/features/auth";
import EmptyMessage from "@/features/component/EmptyMessage";
import PostOverview from "@/features/component/PostOverview";
import { adminRender } from "@/features/hono";
import { listAllPosts } from "@/features/post";
import { Route } from "@/features/route";

export const GET = createRoute(auth, async (c) => {
  const session = mustGetSession(c);

  const posts = await listAllPosts();

  return adminRender(
    c,
    <>
      {posts.map((post) => (
        <PostOverview key={post.id} {...post} href={Route.editPost(post.id)} />
      ))}
      {posts.length === 0 && <EmptyMessage>Post not found.</EmptyMessage>}
    </>,
    { session, title: "Home" }
  );
});

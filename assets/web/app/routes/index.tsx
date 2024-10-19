import BlogContent from "@/features/component/BlogContent";
import EmptyMessage from "@/features/component/EmptyMessage";
import ShowUser from "@/features/component/page/ShowUser";
import PostOverview from "@/features/component/PostOverview";
import { notFound, render } from "@/features/hono";
import { getImage } from "@/features/image";
import { findPublishedPost, listPublishedPosts } from "@/features/post";
import { Route } from "@/features/route";
import { findUser } from "@/features/user";
import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { createRoute } from "honox/factory";
import * as v from "valibot";

export const GET = createRoute(async (c) => {});

const app = new Hono();

app.get("/", async (c) => {
  const posts = await listPublishedPosts();

  c.header(
    "Cache-Control",
    "public, max-age=60 stale-while-revalidate=2592000 stale-if-error"
  );
  return render(
    c,
    <>
      {posts.map((post) => (
        <PostOverview key={post.id} {...post} href={Route.post(post.id)} />
      ))}
      {posts.length === 0 && <EmptyMessage>Post not found.</EmptyMessage>}
    </>,
    { title: "Home" }
  );
});

app.get(
  "/users/:userId",
  vValidator("param", v.object({ userId: v.string() })),
  async (c) => {
    const { userId } = c.req.valid("param");

    c.header(
      "Cache-Control",
      "public, max-age=60 stale-while-revalidate=2592000 stale-if-error"
    );
    const user = await findUser(userId);
    if (!user) return notFound(c);

    return render(c, <ShowUser {...user} />, {
      title: user.username,
    });
  }
);

app.get(
  "/posts/:postId",
  vValidator("param", v.object({ postId: v.string() })),
  async (c) => {
    const { postId } = c.req.valid("param");

    c.header(
      "Cache-Control",
      "public, max-age=60 stale-while-revalidate=2592000 stale-if-error"
    );
    const post = await findPublishedPost(postId);
    if (!post) return notFound(c);

    const user = await findUser(post.ownerId);
    if (user === undefined) return notFound(c);

    return render(c, <BlogContent post={post} user={user} />, {
      title: post.title,
    });
  }
);

app.get(
  "/image/:key",
  vValidator("param", v.object({ key: v.string() })),
  async (c) => {
    const { key } = c.req.valid("param");

    const image = await getImage(key);

    c.header("Content-Type", image.mimeType);
    return c.body(image.body.transformToWebStream(), 200);
  }
);

export default app;

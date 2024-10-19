import { auth, mustGetSession } from "@/features/auth";
import BlogContent from "@/features/component/BlogContent";
import { Article } from "@/features/component/content/content";
import ContentEditor from "@/features/component/content/ContentEditor";
import BottomField from "@/features/component/input/BottomField";
import Button from "@/features/component/input/Button";
import { adminRender, notFound4Admin } from "@/features/hono";
import { findPost, updatePost } from "@/features/post";
import { Route } from "@/features/route";
import { PostFormSchema } from "@/features/schema";
import { findUser } from "@/features/user";
import { vValidator } from "@hono/valibot-validator";
import { createRoute } from "honox/factory";
import { Temporal } from "temporal-polyfill";
import * as v from "valibot";

export const ParamSchema = v.object({
  postId: v.string(),
});

export const GET = createRoute(
  auth,
  vValidator("param", ParamSchema),
  async (c) => {
    const session = mustGetSession(c);
    const { postId } = c.req.valid("param");

    const post = await findPost(postId);
    if (!post) {
      return notFound4Admin(c, session);
    }

    const user = await findUser(post.ownerId);
    if (!user) {
      return notFound4Admin(c, session);
    }

    const isMyPost = post.ownerId === session.userId;
    if (isMyPost) {
      return adminRender(
        c,
        <Article>
          <form method="post" action={Route.editPost(post.id)}>
            <ContentEditor {...post} />
            <BottomField>
              <Button type="submit">Update</Button>
            </BottomField>
          </form>
        </Article>,
        {
          session,
          title: "Edit Post",
        }
      );
    }

    return adminRender(c, <BlogContent post={post} user={user} />, {
      title: post.title,
      session,
    });
  }
);

export const POST = createRoute(
  auth,
  vValidator("param", ParamSchema),
  vValidator("form", PostFormSchema),
  async (c) => {
    const { postId } = c.req.valid("param");
    const form = await c.req.valid("form");

    const session = mustGetSession(c);

    await updatePost(
      {
        id: postId,
        ...form,
        ownerId: session.userId,
        published: form.published === "on",
      },
      Temporal.Now.instant()
    );

    return c.redirect(Route.editPost(postId));
  }
);

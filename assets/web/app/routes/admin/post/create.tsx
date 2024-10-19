import { auth, mustGetSession } from "@/features/auth";
import { Article } from "@/features/component/content/content";
import ContentEditor from "@/features/component/content/ContentEditor";
import BottomField from "@/features/component/input/BottomField";
import Button from "@/features/component/input/Button";
import { adminRender } from "@/features/hono";
import { createPost } from "@/features/post";
import { Route } from "@/features/route";
import { PostFormSchema } from "@/features/schema";
import { vValidator } from "@hono/valibot-validator";
import { createRoute } from "honox/factory";
import { Temporal } from "temporal-polyfill";

export const GET = createRoute(auth, async (c) => {
  const session = mustGetSession(c);

  const post = {
    title: "",
    content: "",
    published: false,
  };

  return adminRender(
    c,
    <Article>
      <form method="post" action={Route.createPost}>
        <ContentEditor {...post} />
        <BottomField>
          <Button type="submit">Post</Button>
        </BottomField>
      </form>
    </Article>,
    {
      session,
      title: "Create Post",
    }
  );
});

export const POST = createRoute(
  auth,
  vValidator("form", PostFormSchema),
  async (c) => {
    const form = await c.req.valid("form");
    const { title, content, published } = form;

    const session = mustGetSession(c);

    const ownerId = session.userId;

    const post = await createPost(
      { title, content, ownerId, published: published === "on" },
      Temporal.Now.instant()
    );

    return c.redirect(Route.editPost(post.id));
  }
);

import { auth, mustGetSession } from "@/features/auth";
import UserEditor from "@/features/component/UserEditor";
import BottomField from "@/features/component/input/BottomField";
import Button from "@/features/component/input/Button";
import ShowUser from "@/features/component/page/ShowUser";
import { adminRender, notFound4Admin } from "@/features/hono";
import { Route } from "@/features/route";
import { UserEditFormSchema } from "@/features/schema";
import { findUser, updateUser } from "@/features/user";
import { vValidator } from "@hono/valibot-validator";
import { createRoute } from "honox/factory";
import * as v from "valibot";

const ParamSchema = v.object({
  userId: v.string(),
});

export const GET = createRoute(
  auth,
  vValidator("param", ParamSchema),
  async (c) => {
    const { userId } = c.req.valid("param");
    const session = mustGetSession(c);

    const user = await findUser(userId);
    if (!user) {
      c.status(404);
      return notFound4Admin(c, session);
    }

    const isMe = user.id === session.userId;
    if (isMe) {
      return adminRender(
        c,
        <form method="post" action={Route.editUser(userId)}>
          <UserEditor {...user} />
          <BottomField>
            <Button type="submit">Update</Button>
          </BottomField>
        </form>,
        { session, title: user.username }
      );
    }

    return adminRender(c, <ShowUser {...user} />, {
      session,
      title: user.username,
    });
  }
);

export const POST = createRoute(
  auth,
  vValidator("param", ParamSchema),
  vValidator("form", UserEditFormSchema),
  async (c) => {
    const { userId } = c.req.valid("param");
    const user = c.req.valid("form");

    await updateUser({ ...user, id: userId });
    return c.redirect(Route.editUser(userId));
  }
);

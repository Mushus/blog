import { vValidator } from "@hono/valibot-validator";
import { createRoute } from "honox/factory";
import { getSession, loginAs } from "@/features/auth";
import Login from "@/features/component/Login";
import { render } from "@/features/hono";
import { LoginSchema } from "@/features/schema";
import { authUser } from "@/features/user";
import { Route } from "@/features/route";

export const GET = createRoute(async (c) => {
  const session = await getSession(c);
  if (session) {
    return c.redirect(Route.admin);
  }
  return render(c, <Login />, { title: "Login" });
});

export const POST = createRoute(vValidator("form", LoginSchema), async (c) => {
  const { username, password } = await c.req.valid("form");

  const user = await authUser(username, password);
  if (user) {
    await loginAs(c, user.id);
    return c.redirect(Route.admin);
  }

  const error = "Invalid user or password";
  return render(c, <Login username={username} error={error} />, {
    title: "Login",
  });
});

import { createRoute } from "honox/factory";
import { auth, logout } from "@/features/auth";
import { Route } from "@/features/route";

export const POST = createRoute(auth, async (c) => {
  await logout(c);
  return c.redirect(Route.login);
});

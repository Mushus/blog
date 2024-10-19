import { createRoute } from "honox/factory";
import { secureHeaders } from "hono/secure-headers";
import { session } from "@/features/auth";
import { createMiddleware } from "hono/factory";
import { Temporal } from "temporal-polyfill";

const errorLogger = createMiddleware(async (c, next) => {
  await next();
  if (c.error) {
    console.error("[Error]", c.error);
  }
});

export default createRoute(secureHeaders(), errorLogger, session);

console.log(Temporal.Now.instant().toString());

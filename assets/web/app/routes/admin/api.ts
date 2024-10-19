import { auth, mustGetSession } from "@/features/auth";
import { listImages, saveImage } from "@/features/image";
import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { Temporal } from "temporal-polyfill";
import * as v from "valibot";

const app = new Hono();

app.use(async (c, next) => {
  console.log(c.req.url);
  await next();
});

const SaveImageSchema = v.object({
  file: v.file(),
});

const routes = app
  .get("/images", async (c) => {
    const images = await listImages();
    return c.json(images);
  })
  .post("/images", auth, vValidator("form", SaveImageSchema), async (c) => {
    const { file } = await c.req.valid("form");
    const session = mustGetSession(c);
    const key = await saveImage({
      body: file,
      ownerId: session.userId,
      createdAt: Temporal.Now.instant(),
    });
    return c.json({ key });
  })
  .get("/", async (c) => {
    return c.json({ message: "Hello, World!" });
  });

export type API = typeof routes;

export default app;

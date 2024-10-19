import { auth, mustGetSession } from "@/features/auth";
import { Article } from "@/features/component/content/content";
import BottomField from "@/features/component/input/BottomField";
import Button from "@/features/component/input/Button";
import { adminRender } from "@/features/hono";
import { listImages, saveImage } from "@/features/image";
import { Route } from "@/features/route";
import ImageUploader from "@/islands/ImageUploader";
import { createRoute } from "honox/factory";
import { Temporal } from "temporal-polyfill";
import uri from "uri-tag";

export const GET = createRoute(auth, async (c) => {
  const session = mustGetSession(c);

  const post = {
    title: "",
    content: "",
  };

  const images = await listImages();

  return adminRender(
    c,
    <Article>
      <form method="post" action={Route.uploadImage}>
        <ImageUploader />
        <BottomField>
          <Button type="submit">Post</Button>
        </BottomField>
      </form>
      <div>
        {images.map(({ key }) => (
          <div>
            <img
              src={`/image/${key}?d=100x100`}
              width="100"
              height="100"
              style="object-fit: cover;"
            />
          </div>
        ))}
      </div>
    </Article>,
    {
      session,
      title: "Create Post",
    }
  );
});

export const POST = createRoute(auth, async (c) => {
  const session = mustGetSession(c);

  const body = await c.req.parseBody();
  const file = body["file"];
  if (!file || !(file instanceof File)) {
    c.status(400);
    return c.text("Invalid file");
  }

  const imageId = await saveImage({
    body: file,
    ownerId: session.userId,
    createdAt: Temporal.Now.instant(),
  });

  return c.json({ image: uri`/image/${imageId}` });
});

import { css } from "hono/css";
import Heading from "./Heading";
import type { SecureUser } from "../user";
import type { Post } from "../post";
import DateTime from "./DateTime";
import { Temporal } from "temporal-polyfill";
import type { Session } from "../auth";
import { Article } from "./content/content";
import { Route } from "../route";
import Image from "./Image";
import { marked } from "marked";

const attachmentCss = css`
  display: flex;
  margin-bottom: 24px;
  gap: 4px 24px;
  flex-wrap: wrap;
`;

const date = css`
  font-size: 0.7rem;
  line-height: 1.5;
  flex: 0 0 auto;
`;

const contentCss = css`
  line-height: 1.5;
  margin-bottom: 48px;
`;

const userCss = css``;

const userLink = css`
  width: fit-content;
  display: flex;
  gap: 8px;
  align-items: end;
`;

const imageCss = css`
  border-radius: 50%;
`;

const userName = css``;

export type Props = {
  post: Post;
  user: SecureUser;
  session?: Session | undefined;
};

export default async function BlogContent({ post, user, session }: Props) {
  const edited = Temporal.Instant.compare(post.createdAt, post.updatedAt) !== 0;
  const isMyPost = session?.userId === post.ownerId;

  const content = await marked(post.content, { breaks: true });

  return (
    <Article>
      {isMyPost && (
        <div>
          <a href={Route.editPost(post.id)}>edit</a>
        </div>
      )}
      <Heading level={2}>{post.title}</Heading>
      <div className={attachmentCss}>
        <div className={date}>
          Published: <DateTime>{post.createdAt}</DateTime>
        </div>
        {edited && (
          <div className={date}>
            Modified: <DateTime>{post.updatedAt}</DateTime>
          </div>
        )}
      </div>
      <main
        className={contentCss}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <div className={userCss}>
        <a className={userLink} href={Route.user(user.id)}>
          <Image className={imageCss} k={user.image} x={64} y={64} />
          <div className={userName}>{user.displayName}</div>
        </a>
      </div>
    </Article>
  );
}

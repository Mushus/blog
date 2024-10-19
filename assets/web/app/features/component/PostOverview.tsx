import { css } from "hono/css";
import Heading from "./Heading";

const link = css`
  display: block;
  text-decoration: none;
  color: black;
  margin-bottom: 72px;
`;

const heading = css`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const contentCss = css`
  overflow: hidden;
  line-height: 1.5;
  max-height: 3lh;
  line-clamp: 3;
`;

export type Props = {
  key?: string;
  title: string;
  content: string;
  href: string;
};

export default function PostOverview({ title, content, href }: Props) {
  return (
    <a className={link} href={href}>
      <article>
        <Heading className={heading} level={3}>
          {title}
        </Heading>
        <main className={contentCss}>{content.slice(0, 1000)}</main>
      </article>
    </a>
  );
}

import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

export type Props = PropsWithChildren<unknown>;

const content = css`
  margin-left: auto;
  margin-right: auto;
  padding: 32px;
  width: auto;
  max-width: 720px;
`;

export default function Content({ children }: Props) {
  return <div className={content}>{children}</div>;
}

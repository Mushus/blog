import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

export type Props = PropsWithChildren<unknown>;

const emptyMessage = css`
  text-align: center;
`;

export default function EmptyMessage({ children }: Props) {
  return <div className={emptyMessage}>{children}</div>;
}

import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

const bottomField = css`
  margin-top: 48px;
`;

type Props = PropsWithChildren;

export default function BottomField({ children }: Props) {
  return <div className={bottomField}>{children}</div>;
}

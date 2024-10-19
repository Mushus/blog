import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren;

const inputField = css`
  margin-bottom: 20px;
`;

export default function InputField({ children }: Props) {
  return <div className={inputField}>{children}</div>;
}

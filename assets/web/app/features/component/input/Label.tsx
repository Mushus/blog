import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

const label = css`
  display: block;
  margin-bottom: 8px;
`;

type Props = PropsWithChildren<{
  for: string;
}>;

export default function Label({ for: htmlFor, children }: Props) {
  return (
    <label className={label} for={htmlFor}>
      {children}
    </label>
  );
}

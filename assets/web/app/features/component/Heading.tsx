import { css, cx } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

const heading = css`
  margin-top: 8px;
  margin-bottom: 20px;
`;

const levels = {
  1: css`
    font-size: 1.625rem;
  `,
  2: css`
    font-size: 1.5rem;
  `,
  3: css`
    font-size: 1.375rem;
  `,
  4: css`
    font-size: 1.25rem;
  `,
  5: css`
    font-size: 1.125rem;
  `,
  6: css`
    font-size: 1rem;
  `,
};

type Props = PropsWithChildren<{
  className?: Promise<string> | undefined;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}>;

export default function Heading({ className, level, children }: Props) {
  const Component = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <Component className={cx(className, heading, levels[level])}>
      {children}
    </Component>
  );
}

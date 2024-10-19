import type { PropsWithChildren } from "hono/jsx";

type ArticleProps = PropsWithChildren;
export function Article({ children }: ArticleProps) {
  return <article>{children}</article>;
}

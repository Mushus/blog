import type { PropsWithChildren } from "hono/jsx";
import { button } from "./css";

type Props = PropsWithChildren<{
  href: string;
}>;

export default function ButtonLink({ href, children }: Props) {
  return (
    <a className={button} href={href}>
      {children}
    </a>
  );
}

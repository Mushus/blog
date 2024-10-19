import { Route } from "@/features/route";
import { css } from "hono/css";
import { PropsWithChildren } from "hono/jsx";

const header = css`
  padding: 32px;
  display: flex;
`;

type ContainerProps = PropsWithChildren;

export function Container({ children }: ContainerProps) {
  return <header className={header}>{children}</header>;
}

const siteTitle = css`
  font-size: 24px;

  > a {
    text-decoration: none;
  }
`;

type SiteTitleProps = PropsWithChildren<{
  href: string;
}>;

export function SiteTitle({ href, children }: SiteTitleProps) {
  return (
    <h1 className={siteTitle}>
      <a href={href}>{children}</a>
    </h1>
  );
}

const nav = css`
  margin-left: auto;
`;

const linkList = css`
  display: flex;
  gap: 16px;
  list-style-type: none;
  padding: 0;
  margin: 0;
  height: 100%;
  align-items: center;
`;

type NavigationProps = PropsWithChildren;

export function Navigation({ children }: NavigationProps) {
  return (
    <nav className={nav}>
      <ul className={linkList}>{children}</ul>
    </nav>
  );
}

type LinkProps = PropsWithChildren<{
  href: string;
}>;

export function Link({ children, href }: LinkProps) {
  return (
    <li>
      <a href={href}>{children}</a>
    </li>
  );
}

type ActionLinkProps = PropsWithChildren<{
  method?: "get" | "post";
  action: string;
}>;

const linkButton = css`
  border: none;
  background: none;
  font-size: 16px;
  text-decoration: underline;
  cursor: pointer;
`;

export function ActionLink({
  children,
  method = "post",
  action,
}: ActionLinkProps) {
  return (
    <li>
      <form method={method} action={action}>
        <button type="submit" className={linkButton}>
          {children}
        </button>
      </form>
    </li>
  );
}

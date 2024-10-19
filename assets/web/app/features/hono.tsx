import type { Context } from "hono";
import Header from "@/features/component/header/Header";
import { AppName } from "./const";
import type { Session } from "./auth";
import Content from "./component/Content";
import EmptyMessage from "./component/EmptyMessage";
import AdminHeader from "./component/header/AdminHeader";
import BreadCrumb, { BreadCrumbItem } from "./component/BreadCrumb";

type RenderProps = {
  title?: string | undefined;
  breadCrumb?: BreadCrumbItem[] | undefined;
};

export function render(
  c: Context,
  jsx: string | Promise<string>,
  { title, breadCrumb }: RenderProps
) {
  return c.render(
    <>
      <Header appName={AppName} />
      {breadCrumb && <BreadCrumb items={breadCrumb} />}
      <Content>{jsx}</Content>
    </>,
    { title: title ? `${AppName} - ${title}` : AppName }
  );
}

type AdminRenderProps = {
  session: Session;
  title?: string | undefined;
};
export function adminRender(
  c: Context,
  jsx: string | Promise<string>,
  { session, title }: AdminRenderProps
) {
  return c.render(
    <>
      <AdminHeader appName={AppName} session={session} />
      <Content>{jsx}</Content>
    </>,
    { title: title ? `${AppName} - ${title}` : AppName }
  );
}

export function notFound(c: Context) {
  c.status(404);
  return render(c, <EmptyMessage>Not Found</EmptyMessage>, {
    title: "Not Found",
  });
}

export function notFound4Admin(c: Context, session: Session) {
  c.status(404);
  return adminRender(c, <EmptyMessage>Not Found</EmptyMessage>, {
    session,
    title: "Not Found",
  });
}

import type { Session } from "@/features/auth";
import { Route } from "@/features/route";
import {
  ActionLink,
  Container,
  Link,
  Navigation,
  SiteTitle,
} from "./component";

export type Props = {
  appName: string;
  session: Session;
};

export default function AdminHeader({ session, appName }: Props) {
  return (
    <Container>
      <SiteTitle href={Route.admin}>{appName}</SiteTitle>
      <Navigation>
        <Link href={Route.createPost}>Write</Link>
        <Link href={Route.listImage}>Image</Link>
        <Link href={Route.editUser(session.userId)}>User</Link>
        <ActionLink action={Route.logout}>Logout</ActionLink>
      </Navigation>
    </Container>
  );
}

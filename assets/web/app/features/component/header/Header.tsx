import { Route } from "@/features/route";
import { Container, SiteTitle } from "./component";

export type Props = {
  appName: string;
};

export default function Header({ appName }: Props) {
  return (
    <Container>
      <SiteTitle href={Route.home}>{appName}</SiteTitle>
    </Container>
  );
}

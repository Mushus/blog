import { css } from "hono/css";
import { Route } from "../route";

const headerClass = css``;

export default function Navigation() {
  return (
    <nav class={headerClass}>
      <ul>
        <li>
          <a href={Route.home}>top</a>
        </li>
      </ul>
    </nav>
  );
}

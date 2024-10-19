import { css } from "hono/css";
import InputField from "./input/InputField";
import Label from "./input/Label";
import TextInput from "./input/TextInput";
import PasswordInput from "./input/PasswordInput";
import BottomField from "./input/BottomField";
import Button from "./input/Button";
import Heading from "./Heading";
import { Route } from "../route";

type Props = {
  username?: string;
  password?: string;
  error?: string;
};

const title = css`
  font-size: 24px;
  margin-bottom: 24px;
`;

export default function Login({ username = "", password = "", error }: Props) {
  return (
    <>
      <Heading level={2}>Login</Heading>
      <form method="post" action={Route.login}>
        {error && <div>{error}</div>}
        <InputField>
          <Label for="username">User</Label>
          <TextInput name="username" id="username" value={username} />
        </InputField>
        <InputField>
          <Label for="password">Password</Label>
          <PasswordInput name="password" id="password" value={password} />
        </InputField>
        <BottomField>
          <Button type="submit">Login</Button>
        </BottomField>
      </form>
    </>
  );
}

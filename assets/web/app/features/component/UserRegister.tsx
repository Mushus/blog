import Heading from "./Heading";
import UserEditor, { type Props as UserEditorProps } from "./UserEditor";
import BottomField from "./input/BottomField";
import Button from "./input/Button";

type Props = UserEditorProps;

export default function Login(props: Props) {
  return (
    <>
      <Heading level={2}>User Registration</Heading>
      <form method="post" action="/user/register">
        <UserEditor {...props} />
        <BottomField>
          <Button type="submit">Register</Button>
        </BottomField>
      </form>
    </>
  );
}

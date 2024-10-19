import ImageSelect from "@/islands/ImageSelect";
import InputField from "./input/InputField";
import Label from "./input/Label";
import PasswordInput from "./input/PasswordInput";
import TextInput from "./input/TextInput";

export type Props = {
  readonly?: boolean | undefined;
  error?: string | undefined;
  username?: string | undefined;
  password?: string | undefined;
  displayName?: string | undefined;
  image?: string | undefined;
};

export default function UserEditor({
  readonly = false,
  username = "",
  password = "",
  displayName = "",
  image = "",
  error,
}: Props) {
  return (
    <>
      {error && <div>{error}</div>}
      <InputField>
        <Label for="username">Username</Label>
        <TextInput
          name="username"
          id="username"
          value={username}
          readonly={readonly}
        />
      </InputField>
      <InputField>
        <Label for="image">Image</Label>
        <ImageSelect name="image" value={image} />
      </InputField>
      <InputField>
        <Label for="password">Password</Label>
        <PasswordInput
          name="password"
          id="password"
          value={password}
          readonly={readonly}
        />
      </InputField>
      <InputField>
        <Label for="displayName">display name</Label>
        <TextInput
          name="displayName"
          id="displayName"
          value={displayName}
          readonly={readonly}
        />
      </InputField>
    </>
  );
}

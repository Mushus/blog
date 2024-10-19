import { input } from "./css";

type Props = {
  name: string;
  id: string;
  value: string;
  readonly?: boolean | undefined;
};

export default function PasswordInput({
  name,
  id,
  value,
  readonly = false,
}: Props) {
  return (
    <input
      className={input}
      type="password"
      name={name}
      id={id}
      value={value}
      readonly={readonly}
    />
  );
}

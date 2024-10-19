import { input } from "./css";

type Props = {
  name: string;
  id: string;
  value: string;
  readonly?: boolean | undefined;
};

export default function TextInput({
  name,
  id,
  value,
  readonly = false,
}: Props) {
  return (
    <input
      className={input}
      type="text"
      name={name}
      id={id}
      value={value}
      readonly={readonly}
    />
  );
}

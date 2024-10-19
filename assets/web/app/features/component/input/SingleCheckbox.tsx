import { PropsWithChildren, useId } from "hono/jsx";
import { css } from "hono/css";

type Props = PropsWithChildren<{
  name: string;
  value: boolean;
  readonly?: boolean | undefined;
}>;

const label = css`
  display: flex;
  margin-bottom: 8px;
  gap: 8px;
  width: fit-content;
`;
const input = css`
  display: block;
  accent-color: #000;
`;

export default function SingleCheckbox({
  name,
  value,
  readonly = false,
  children,
}: Props) {
  const id = useId();
  return (
    <label className={label} for={id}>
      <input
        className={input}
        type="checkbox"
        name={name}
        id={id}
        checked={value}
        readonly={readonly}
        value="on"
      />
      {children}
    </label>
  );
}

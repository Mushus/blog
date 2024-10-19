import { useEditable } from "./EditableContext";

type Props = {
  children?: string | undefined;
};

export default function EditableText({ children }: Props) {
  const editable = useEditable();
  return editable ? (
    <input value={children} />
  ) : (
    <SimpleText>{children}</SimpleText>
  );
}

function SimpleText(children: Props) {
  return <div>{children}</div>;
}

function Editable(children: Props) {
  return <input value={children} />;
}

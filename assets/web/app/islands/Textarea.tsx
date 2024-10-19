import autosize from "autosize";
import { css } from "hono/css";
import { useEffect, useRef } from "hono/jsx";

export const input = css`
  display: block;
  box-sizing: border-box;
  width: 100%;
  font-size: 20px;
  border: 1px solid black;
  border-radius: 8px;
  padding: 8px 12px;
`;

type Props = {
  name: string;
  id: string;
  value: string;
};

export default function Textarea({ name, id, value }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  return (
    <textarea className={input} name={name} id={id} ref={textareaRef}>
      {value}
    </textarea>
  );
}

import ImageSelectDialog from "@/features/component/dialog/ImageSelectDialog";
import Image from "@/features/component/Image";
import Button from "@/features/component/input/Button";
import { css } from "hono/css";
import { useState } from "hono/jsx";

type Props = {
  name?: string;
  value?: string;
};

const border = css`
  border: 1px solid black;
  border-radius: 9px;
  padding: 16px;
`;

const image = css`
  margin-bottom: 16px;
`;

export default function ImageSelect({ value, ...props }: Props) {
  const [key, setKey] = useState<string>(value ?? "");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div class={border}>
      <ImageSelectDialog
        defaultValue={value}
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        onSelect={(k) => setKey(k)}
      />
      {key && <Image className={image} k={key} x={100} y={100} />}
      <Button type="button" variant="secondary" onClick={() => setIsOpen(true)}>
        Select Image
      </Button>
      <input type="hidden" value={key} {...props} />
    </div>
  );
}

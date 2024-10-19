import { useEffect, useState } from "hono/jsx";
import Dialog from "@/features/component/dialog/Dialog";
import client from "@/features/rpc";
import Image from "@/features/component/Image";
import { css, cx } from "hono/css";
import Button from "@/features/component/input/Button";
import FileSelectButton from "../input/FileSelectButton";

type Props = {
  isOpen: boolean;
  defaultValue?: string | undefined;
  close: () => void;
  onSelect: (key: string) => void;
};

const dialogHeader = css`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
`;

const content = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;

  @media screen and (max-width: 600px) {
    width: calc(100px * 2 + 8px * 1);
  }

  @media screen and (min-width: 600px) {
    width: calc(100px * 4 + 8px * 3);
  }

  @media screen and (min-width: 800px) {
    width: calc(100px * 6 + 8px * 5);
  }

  @media screen and (min-width: 1000px) {
    width: calc(100px * 8 + 8px * 7);
  }
`;

const listItem = css`
  list-style: none;
  border: 2px solid transparent;
  margin: -2px;
`;

const selectedListItem = css`
  border: 2px solid black;
`;

const dialogFooter = css`
  display: flex;
  padding: 0 16px 16px;
  justify-content: flex-end;
  gap: 8px;
`;

const button = css`
  max-width: 200px;
`;

async function requestImages(setImages: (images: string[]) => void) {
  const res = await client.images.$get();
  const images = await res.json();
  setImages(images.map((i) => i.key));
}

export default function ImageSelectDialog({
  defaultValue,
  isOpen,
  close,
  onSelect,
}: Props) {
  const [images, setImages] = useState<string[]>([]);

  const [select, setSelect] = useState<string | undefined>(defaultValue);
  useEffect(() => {
    setSelect(defaultValue);
  }, [defaultValue]);

  const handleCancel = () => {
    close();
  };

  const handleOK = () => {
    if (select) onSelect(select);
    close();
  };

  const handleUpload = async (file: File) => {
    const res = await client.images.$post({ form: { file } });
    requestImages(setImages);
  };

  useEffect(() => {
    if (!isOpen) return;

    requestImages(setImages);
  }, [isOpen]);

  return (
    <Dialog isOpen={isOpen} close={close}>
      <div className={dialogHeader}>
        <FileSelectButton
          className={button}
          variant="secondary"
          onSelect={handleUpload}
        >
          Upload
        </FileSelectButton>
      </div>
      <ul className={content}>
        {images.map((k) => (
          <li
            className={cx(listItem, k === select && selectedListItem)}
            key={k}
          >
            <Image
              k={k}
              x={100}
              y={100}
              onClick={() => setSelect((img) => (img === k ? undefined : k))}
            />
          </li>
        ))}
      </ul>
      <div className={dialogFooter}>
        <Button
          className={button}
          onClick={handleCancel}
          variant="secondary"
          type="button"
        >
          Cancel
        </Button>
        <Button className={button} onClick={handleOK} type="button">
          Select
        </Button>
      </div>
    </Dialog>
  );
}

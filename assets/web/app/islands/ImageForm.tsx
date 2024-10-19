import { useCallback, useState } from "hono/jsx";

type Props = {
  value: string;
};

export default function ImageUploader(props: Props) {
  const [image, setImage] = useState<string>(props.value);

  const handleChange = useCallback(async (e: Event) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    const inputElem = e.target;
    if (!inputElem.files) return;
    const files = Array.from(inputElem.files);
    if (files.length === 0) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(files[0]);
  }, []);

  return (
    <div>
      {image && <img src={image} />}
      <input type="file" onChange={handleChange} />
    </div>
  );
}

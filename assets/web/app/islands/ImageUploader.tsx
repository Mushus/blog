import { Route } from "@/features/route";
import { useCallback, useState } from "hono/jsx";

type Props = {
  value?: string | undefined;
};

export default function ImageUploader(props: Props) {
  const [image, setImage] = useState<string | undefined>(props.value);

  const handleChange = useCallback(async (e: Event) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    const inputElem = e.target;
    if (!inputElem.files) return;
    const files = Array.from(inputElem.files);
    if (files.length === 0) return;
    const fd = new FormData();
    fd.append("file", files[0]);
    const res = await fetch(Route.uploadImage, { method: "POST", body: fd });
    console.log(await res.json());

    inputElem.value = "";
  }, []);

  return (
    <div>
      {image && <img src={image} />}
      <input type="file" onChange={handleChange} />
    </div>
  );
}

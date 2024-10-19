import InputField from "@/features/component/input/InputField";
import Label from "@/features/component/input/Label";
import TextInput from "@/features/component/input/TextInput";
import Textarea from "@/islands/Textarea";
import SingleCheckbox from "../input/SingleCheckbox";

type Props = {
  title: string;
  content: string;
  published: boolean;
};

export default function ContentEditor({ title, content, published }: Props) {
  return (
    <>
      <InputField>
        <Label for="title">Title</Label>
        <TextInput name="title" id="title" value={title} />
      </InputField>
      <InputField>
        <Label for="content">Content</Label>
        <Textarea name="content" id="content" value={content} />
      </InputField>
      <InputField>
        <SingleCheckbox name="published" value={published}>
          公開する
        </SingleCheckbox>
      </InputField>
    </>
  );
}

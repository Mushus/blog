import Textarea from "../../islands/Textarea";
import BottomField from "./input/BottomField";
import Button from "./input/Button";
import InputField from "./input/InputField";
import Label from "./input/Label";
import TextInput from "./input/TextInput";

export type Props = {
  id?: string | undefined;
  title: string;
  content: string;
};

export default function BlogContentEditor({ id, title, content }: Props) {
  const isNewPost = !id;
  return (
    <article>
      <form
        method="post"
        action={isNewPost ? "/post/create" : `/posts/${id}/edit`}
      >
        <InputField>
          <Label for="title">Title</Label>
          <TextInput name="title" id="title" value={title} />
        </InputField>
        <InputField>
          <Label for="content">Content</Label>
          <Textarea name="content" id="content" value={content} />
        </InputField>
        <BottomField>
          <Button type="submit">{isNewPost ? "Post" : "Update"}</Button>
        </BottomField>
      </form>
    </article>
  );
}

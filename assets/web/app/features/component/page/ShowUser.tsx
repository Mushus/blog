import { css } from "hono/css";
import Image from "../Image";

const user = css`
  display: flex;
  gap: 16px;
  align-items: end;
`;

const imageCss = css`
  border-radius: 50%;
`;

const displayNameStyle = css`
  font-size: 24px;
`;

export type Props = {
  image: string;
  displayName: string;
};

export default function ShowUser({ image, displayName }: Props) {
  return (
    <div className={user}>
      <Image className={imageCss} k={image} x={100} y={100} />
      <div className={displayNameStyle}>{displayName}</div>
    </div>
  );
}

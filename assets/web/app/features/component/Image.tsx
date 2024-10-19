import { css, cx } from "hono/css";

type Props =
  | {
      className?: string | Promise<string> | undefined;
      k: string;
      onClick?: () => void;
    } & ({ x: 64; y: 64 } | { x: 100; y: 100 });

const img = css`
  object-fit: cover;
  display: block;
`;

export default function Image({ className, k, x, y, ...props }: Props) {
  return (
    <img
      className={cx(className, img)}
      src={`/image/${k}`}
      width={x}
      height={y}
      {...props}
    />
  );
}

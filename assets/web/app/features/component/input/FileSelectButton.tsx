import { useRef, type PropsWithChildren } from "hono/jsx";
import { button, primaryButton, secondaryButton } from "./css";
import { css, cx } from "hono/css";

type Props = PropsWithChildren<{
  className?: string | Promise<string> | undefined;
  variant?: "primary" | "secondary";
  onSelect?: (file: File) => void;
}>;

const fileSelectButton = css`
  position: relative;
`;

const fileInput = css`
  display: block;
  opacity: 0;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const variants = {
  primary: primaryButton,
  secondary: secondaryButton,
};

export default function FileSelectButton({
  className,
  variant = "primary",
  onSelect,
  children,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && onSelect) {
      onSelect(file);
    }
    target.value = "";
  };

  return (
    <div className={cx(className, fileSelectButton, button, variants[variant])}>
      {children}
      <input
        className={fileInput}
        type="file"
        ref={ref}
        onChange={handleChange}
      />
    </div>
  );
}

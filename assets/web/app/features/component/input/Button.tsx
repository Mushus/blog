import type { PropsWithChildren } from "hono/jsx";
import { button, primaryButton, secondaryButton } from "./css";
import { cx } from "hono/css";

type Props = PropsWithChildren<{
  className?: string | Promise<string> | undefined;
  type: "submit" | "button";
  variant?: "primary" | "secondary";
  onClick?: () => void;
}>;

const variants = {
  primary: primaryButton,
  secondary: secondaryButton,
};

export default function Button({
  className,
  type,
  variant = "primary",
  onClick,
  children,
}: Props) {
  return (
    <button
      className={cx(className, button, variants[variant])}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

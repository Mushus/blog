import { css } from "hono/css";
import { PropsWithChildren, useEffect, useRef } from "hono/jsx";

type Props = PropsWithChildren<{
  isOpen: boolean;
  close: () => void;
}>;

const dialogStyle = css`
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);

  &::backdrop {
    background-color: #000;
    opacity: 0.2;
  }
`;

const header = css`
  display: flex;
  justify-content: flex-end;
`;

const closeButton = css`
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 0;
  width: 32px;
  height: 32px;
`;

export default function Dialog({ isOpen, close, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);

  const handleClick = (e: MouseEvent) => {
    console.log("close", e.target, ref.current);
    if (e.target === ref.current) close();
  };

  return (
    <dialog className={dialogStyle} ref={ref} onClick={handleClick}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className={header}>
          <button className={closeButton} onClick={close} type="button">
            ×
          </button>
        </div>
        <div>{children}</div>
      </div>
    </dialog>
  );
}

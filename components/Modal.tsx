import { Button } from "./Button";
import clsx from "clsx";
import { IoClose } from "react-icons/io5";

export const Modal = ({
  show,
  title,
  children,
  confirmText,
  onConfirm,
  onClose,
  loading,
}: {
  show: boolean;
  title: string | string[];
  children: (string | JSX.Element) | (string | JSX.Element)[];
  confirmText?: string;
  onConfirm?: () => void;
  onClose: () => void;
  loading?: boolean;
}) => {
  return (
    <div
      className={clsx(
        "relative z-[1000] transition-opacity duration-500",
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black bg-opacity-75"
          onClick={onClose}
        ></div>
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            className="relative transform overflow-hidden border-[1px] border-line text-left transition-all w-full sm:my-8 sm:max-w-lg"
            style={{
              background:
                "radial-gradient(100% 100% at 100% 100%, #1a1d0e 0%, #000 100%)",
            }}
          >
            <div className="flex justify-between p-4 sm:p-6 border-b-[1px] border-line">
              <h3
                className="text-base font-semibold leading-6"
                id="modal-title"
              >
                {title}
              </h3>
              <div className="cursor-pointer" onClick={onClose}>
                <IoClose size={24} />
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-left w-full">
                <div className="w-full whitspace-pre whitespace-pre-wrap">
                  {children}
                </div>
              </div>
            </div>
            {!!confirmText && onConfirm && (
              <div className="border-t-[1px] border-line px-4 py-4 sm:flex sm:flex-row sm:px-6 gap-2">
                <Button onClick={onConfirm} loading={loading}>
                  {confirmText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

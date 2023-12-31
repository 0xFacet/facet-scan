/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/ZlYFYIhl9zA
 */
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogDescription,
  DialogContent,
  Dialog,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  children: React.ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  confirmText,
  onConfirm,
  onCancel,
  loading,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-4 w-11/12 max-w-xl mx-auto bg-white dark:bg-black rounded-lg shadow-lg"
        style={{
          background:
            "radial-gradient(100% 100% at 100% 100%, #1a1d0e 0%, #000 100%)",
        }}
      >
        <DialogHeader className="text-xl font-semibold">{title}</DialogHeader>
        <DialogDescription className="text-zinc-500 dark:text-zinc-400">
          {children}
        </DialogDescription>
        <div className="flex justify-end mt-4 gap-2">
          <Button onClick={onCancel} variant="ghost">
            Close
          </Button>
          {!!onConfirm && (
            <Button variant="default" onClick={onConfirm} disabled={loading}>
              {confirmText ?? "Confirm"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

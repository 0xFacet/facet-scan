export const ToastContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed z-[2000] flex flex-col gap-4 bottom-0 right-0 m-6 max-w-sm">
      {children}
    </div>
  );
};

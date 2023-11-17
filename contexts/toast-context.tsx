import Toast from "@/components/ui/toast";
import React, { createContext, useContext, useState, ReactNode } from "react";

type ToastContextType = {
  showToast: (toast: Omit<ToastData, "id">) => void;
};

type ToastData = {
  id: number;
  message: string;
  type: "success" | "error";
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([
    { message: "test", type: "success", id: 123 },
    { message: "hi", type: "success", id: 122 },
  ]);

  const showToast = (toast: Omit<ToastData, "id">) => {
    const id = new Date().getTime();
    setToasts([...toasts, { ...toast, id }]);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {/* <div className="relative w-[100vw] h-[100vh]">
        <div className="fixed flex flex-col gap-4 bottom-0 m-6 max-w-sm ">
          {toasts.map((toast) => (
            <div key={toast.id}>
              <Toast message={toast.message} type={toast.type} />
            </div>
          ))}
        </div>
      </div> */}
      {children}
    </ToastContext.Provider>
  );
};

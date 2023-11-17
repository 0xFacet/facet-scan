"use client";

import { PlaceholderToast } from "@/components/PlaceholderToast";
import { ToastContainer } from "@/components/ToastContainers";
import Toast from "@/components/ui/toast";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
} from "react";

type ToastContextType = {
  showToast: (toast: Omit<ToastData, "id" | "timeoutId">) => void;
};

type ToastData = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
  timeoutId?: NodeJS.Timeout;
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
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [heights, setHeights] = useState<{ [key: number]: number }>({});
  const [distances, setDistances] = useState<{ [key: number]: number }>({});
  const toastsRef = useRef<ToastData[]>([]);

  const showToast = (toast: Omit<ToastData, "id" | "timeoutId">) => {
    const id = new Date().getTime();
    const timeoutId = setTimeout(() => {
      removeToast(id);
    }, 10_000);

    setToasts((prevToasts) => [...prevToasts, { ...toast, id, timeoutId }]);
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) =>
      prevToasts.filter((toast) => {
        if (toast.id === id) {
          clearTimeout(toast.timeoutId);
        }
        return toast.id !== id;
      })
    );
  };

  const handleHeightChange = useCallback((id: number, height: number) => {
    setHeights((prevHeights) => ({ ...prevHeights, [id]: height }));
  }, []);

  const handleDistanceChange = useCallback((id: number, distance: number) => {
    setDistances((prevDistances) => ({ ...prevDistances, [id]: distance }));
  }, []);

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  useEffect(() => {
    return () => {
      toastsRef.current.forEach((toast) => {
        if (toast.timeoutId) {
          clearTimeout(toast.timeoutId);
        }
      });
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer>
        {toasts.map((toast, index) => (
          <div key={toast.id}>
            <Toast
              id={toast.id}
              message={toast.message}
              type={toast.type}
              distance={distances[toast.id] || 0}
              onHeightChange={handleHeightChange}
            />
            <PlaceholderToast
              id={toast.id}
              index={index}
              height={heights[toast.id] || 0}
              onDistanceChange={handleDistanceChange}
            />
          </div>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

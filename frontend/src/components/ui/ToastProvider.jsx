import { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  ToastProvider as KildenToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastClose,
} from "@kilden/designsystem";

const ToastContext = createContext(null);

const VARIANT = {
  success: "default",
  error: "danger",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, { type = "success", duration = 3000 } = {}) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      <KildenToastProvider>
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={VARIANT[toast.type] ?? "default"}
            duration={toast.duration}
            onOpenChange={(open) => !open && dismiss(toast.id)}
          >
            <ToastTitle>{toast.message}</ToastTitle>
            <ToastClose aria-label="Dismiss" />
          </Toast>
        ))}
        <ToastViewport />
      </KildenToastProvider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

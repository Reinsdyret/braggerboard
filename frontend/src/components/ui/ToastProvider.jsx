import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle, AlertCircle, XClose } from "@untitledui/icons";
import { cx } from "../../utils/cx.js";

const ToastContext = createContext(null);

const ICONS = {
  success: { Icon: CheckCircle, className: "text-green-500" },
  error: { Icon: AlertCircle, className: "text-red-500" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, { type = "success", duration = 3000 } = {}) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6">
        {toasts.map((toast) => {
          const { Icon, className } = ICONS[toast.type] ?? ICONS.success;
          return (
            <div
              key={toast.id}
              className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-popover)] dark:border-gray-700 dark:bg-gray-800"
            >
              <Icon size={20} className={cx("mt-0.5 shrink-0", className)} />
              <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded-md p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                aria-label="Dismiss"
              >
                <XClose size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

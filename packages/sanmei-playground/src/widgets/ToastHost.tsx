import { useEffect, useRef, useState } from "react";

type Toast = {
  id: number;
  message: string;
};

type ToastListener = (toast: Toast) => void;

const listeners = new Set<ToastListener>();
let nextId = 1;

export function pushToast(message: string) {
  const toast: Toast = { id: nextId++, message };
  for (const l of listeners) l(toast);
}

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, number>());

  useEffect(() => {
    const listener: ToastListener = (t) => {
      setToasts((prev) => [...prev, t]);
      const timer = window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
        timers.current.delete(t.id);
      }, 5000);
      timers.current.set(t.id, timer);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      for (const [, timer] of timers.current.entries()) window.clearTimeout(timer);
      timers.current.clear();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="w-[22rem] rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {t.message}
        </div>
      ))}
    </div>
  );
}


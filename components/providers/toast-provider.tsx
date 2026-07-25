"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

type ToastContextValue = { toast: (message: string) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Array<{ id: number; text: string }>>([]);
  const toast = useCallback((text: string) => {
    const id = Date.now();
    setMessages((current) => [...current, { id, text }]);
    window.setTimeout(() => setMessages((current) => current.filter((item) => item.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className="flex max-w-sm items-center gap-3 rounded-lg bg-forest px-4 py-3 text-sm text-white shadow-xl">
            <CheckCircle2 className="h-4 w-4 text-gold" />
            <span className="flex-1">{message.text}</span>
            <button aria-label="Dismiss notification" onClick={() => setMessages((items) => items.filter((item) => item.id !== message.id))}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider");
  return value;
}


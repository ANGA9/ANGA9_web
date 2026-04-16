"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface LoginSheetContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const LoginSheetContext = createContext<LoginSheetContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function LoginSheetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <LoginSheetContext.Provider value={{ isOpen, open, close }}>
      {children}
    </LoginSheetContext.Provider>
  );
}

export const useLoginSheet = () => useContext(LoginSheetContext);

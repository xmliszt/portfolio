"use client";

import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useState,
} from "react";

type FloatingNavigationContextType = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const FloatingNavigationContext = createContext<FloatingNavigationContextType>({
  isOpen: false,
  setIsOpen: () => {},
});

export function FloatingNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FloatingNavigationContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </FloatingNavigationContext.Provider>
  );
}

export function useFloatingNavigation() {
  return useContext(FloatingNavigationContext);
}

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ModalProviderProps {
  children: React.ReactNode;
}

export type ModalValue = {
  id?: string;
};

type ModalContextType = {
  value: ModalValue;
  isOpen: boolean;
  openModal: (
    modal: React.ReactNode,
    fetchValue?: () => Promise<ModalValue>
  ) => void;
  closeModal: () => void;
};

export const ModalContext = createContext<ModalContextType>({
  value: {},
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

export default function ModalProvider({ children }: ModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<ModalValue>({});
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const openModal = useCallback(async (
    modal: React.ReactNode,
    fetchValue?: () => Promise<ModalValue>
  ) => {
    if (modal) {
      if (fetchValue) {
        const newValue = await fetchValue();
        setValue(newValue || {});
      }
      setModalContent(modal);
      setIsOpen(true);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalContent(null);
  }, []);

  return (
    <ModalContext.Provider value={{ value, openModal, closeModal, isOpen }}>
      {children}
      {isOpen && modalContent}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within the modal provider");
  }
  return context;
};
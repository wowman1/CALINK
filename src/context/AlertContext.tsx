"use client";
import { createContext, useContext, useState } from "react";
import AlertModal from "@/components/shared/AlertModal";

const AlertContext = createContext<any>(null);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "alert" as "alert" | "confirm",
  });

  const showAlert = (
    title: string,
    message: string,
    type: "alert" | "confirm" = "alert",
  ) => {
    setConfig({ isOpen: true, title, message, type });
  };

  const closeAlert = () => setConfig((prev) => ({ ...prev, isOpen: false }));
  const onConfirm = () => {};

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertModal {...config} onClose={closeAlert} onConfirm={onConfirm} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);

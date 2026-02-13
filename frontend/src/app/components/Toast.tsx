import React from "react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  let color = "bg-blue-500";
  if (type === "success") color = "bg-green-500";
  else if (type === "error") color = "bg-red-500";

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded text-white shadow-lg ${color}`}>
      {message}
      {onClose && (
        <button className="ml-4 text-white" onClick={onClose}>&times;</button>
      )}
    </div>
  );
};

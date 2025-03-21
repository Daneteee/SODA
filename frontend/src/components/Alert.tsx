import React from "react";

interface AlertProps {
  type?: "success" | "warning" | "error";
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type = "success", message, onClose }) => {
  const alertClass = {
    success: "alert alert-success",
    warning: "alert alert-warning",
    error: "alert alert-error",
  }[type];

  return (
    <div role="alert" className={`${alertClass} flex justify-between items-center mb-4`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
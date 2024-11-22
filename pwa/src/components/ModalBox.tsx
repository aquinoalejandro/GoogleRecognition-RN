// components/ModalBox.tsx
import { ReactNode } from "react";

interface ModalProps {
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function ModalBox({ onClose, title, children }: ModalProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-70">
      <div className="bg-white rounded-md overflow-hidden max-w-md w-full mx-4">
        <nav className="bg-black text-white flex justify-between px-4 py-2">
          <span className="text-lg">{title}</span>
          <button
            className="bg-red-300 bg-opacity-50 py-1 px-2 hover:bg-red-500 hover:bg-opacity-70 transition-all rounded-full text-sm"
            onClick={onClose}
          >
            &#10005;
          </button>
        </nav>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

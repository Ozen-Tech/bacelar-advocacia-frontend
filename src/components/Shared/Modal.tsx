// src/components/Shared/Modal.tsx
import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-lg bg-bacelar-gray-dark p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
      >
        <div className="flex items-center justify-between pb-4 border-b border-bacelar-gray-light/20">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="text-bacelar-gray-light transition hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
}
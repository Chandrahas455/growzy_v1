import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Kinetic Dialog Container */}
      <div
        className={`relative w-full ${maxWidth} bg-[#09090B] border-2 border-[#3F3F46] shadow-none z-10 overflow-hidden my-8 font-sans bg-noise`}
      >
        {/* Kinetic Header */}
        <div className="px-6 py-5 border-b-2 border-[#3F3F46] flex items-center justify-between bg-[#18181B]">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter font-display text-[#FAFAFA]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#09090B] hover:bg-[#DFE104] hover:text-black border-2 border-[#3F3F46] font-mono text-xs font-bold uppercase transition-colors text-[#FAFAFA] flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            <span>CLOSE</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6 text-[#FAFAFA] font-sans">
          {children}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus the modal
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={clsx(
          'relative bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 rounded-2xl shadow-modal border-2 border-primary-400/50 p-6 w-full',
          sizeStyles[size],
          'animate-slide-up'
        )}
        style={{
          boxShadow: '0 25px 50px -12px rgba(14, 165, 233, 0.3), 0 0 0 1px rgba(168, 85, 247, 0.2)'
        }}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4">
          <h2 id="modal-title" className="text-3xl font-bold bg-gradient-to-r from-primary-300 via-accent-300 to-primary-400 bg-clip-text text-transparent drop-shadow-lg">
            {title}
          </h2>
          {description && (
            <p id="modal-description" className="mt-2 text-base text-white/90 font-medium">
              {description}
            </p>
          )}
        </div>
        
        {/* Content */}
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto text-neutral-200">
          {children}
        </div>
      </div>
    </div>
  );
};


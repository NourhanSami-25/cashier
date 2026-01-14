import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  // Close dialog on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-destructive',
      iconBg: 'bg-destructive/10',
      confirmBtn: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    },
    warning: {
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
    info: {
      icon: 'text-primary',
      iconBg: 'bg-primary/10',
      confirmBtn: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    },
  };

  const styles = variantStyles[variant];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
          onClick={(e) => e.stopPropagation()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          {/* Header */}
          <div className="p-6 flex items-start gap-4">
            <div className={`p-3 rounded-full ${styles.iconBg} flex-shrink-0`}>
              <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="confirm-dialog-title" className="text-xl font-bold text-foreground mb-2">
                {title}
              </h2>
              <p id="confirm-dialog-description" className="text-muted-foreground whitespace-pre-line">
                {message}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 bg-secondary/30 border-t border-border flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-medium transition-all hover:scale-105 active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 ${styles.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

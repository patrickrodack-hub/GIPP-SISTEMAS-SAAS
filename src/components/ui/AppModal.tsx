import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { DS } from '../../styles/designSystem';

export interface AppModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    className?: string;
}

export const AppModal: React.FC<AppModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'lg',
    className = ''
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    let maxWidthClass = 'max-w-lg';
    if (maxWidth === 'sm') maxWidthClass = 'max-w-sm';
    if (maxWidth === 'md') maxWidthClass = 'max-w-md';
    if (maxWidth === 'xl') maxWidthClass = 'max-w-xl';
    if (maxWidth === '2xl') maxWidthClass = 'max-w-2xl';
    if (maxWidth === '3xl') maxWidthClass = 'max-w-3xl';
    if (maxWidth === '4xl') maxWidthClass = 'max-w-4xl';

    return (
        <div className={DS.modal.backdrop} onClick={onClose} role="dialog" aria-modal="true">
            <div
                className={`${DS.modal.container} ${maxWidthClass} ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className={DS.modal.header}>
                        <div className={DS.modal.title}>{title}</div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
                <div className={DS.modal.body}>{children}</div>
                {footer && <div className={DS.modal.footer}>{footer}</div>}
            </div>
        </div>
    );
};

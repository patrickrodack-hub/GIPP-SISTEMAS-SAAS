import React from 'react';
import { Trash2, CheckCircle, Info } from 'lucide-react';
import { Button } from '../utils/sharedHelpers';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'primary' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onCancel, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  variant = "danger" 
}) => { 
  if (!isOpen) return null; 
  return ( 
    <div className="fixed inset-0 bg-slate-900/60 z-[10000] flex items-center justify-center p-4 animate-entrance backdrop-blur-md no-print"> 
      <div className="bg-white/90 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white/50 ring-1 ring-white/20 relative"> 
        <div className="p-10 flex flex-col items-center text-center gap-6 relative z-10">
          <div className={`p-5 rounded-full shadow-lg ${variant === 'danger' ? 'bg-rose-100 text-rose-600' : variant === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
            {variant === 'danger' ? <Trash2 size={40}/> : variant === 'success' ? <CheckCircle size={40}/> : <Info size={40}/>}
          </div>
          <div>
            <h3 className="font-extrabold text-2xl text-slate-800 mb-3 tracking-tight">{title}</h3>
            <p className="text-slate-500 text-base leading-relaxed font-medium">{message}</p>
          </div>
        </div> 
        <div className="p-8 bg-white/60 backdrop-blur-md flex flex-col sm:flex-row gap-4 border-t border-white/50">
          <Button variant="ghost" onClick={(e) => { e.stopPropagation(); if (onCancel) onCancel(); onClose(); }} className="flex-1 border border-slate-200 bg-white hover:bg-slate-50">{cancelText}</Button>
          <Button variant={variant as any} onClick={(e) => { e.stopPropagation(); if (onConfirm) onConfirm(); onClose(); }} className="flex-1">{confirmText}</Button>
        </div> 
      </div> 
    </div> 
  ); 
};

export default ConfirmModal;

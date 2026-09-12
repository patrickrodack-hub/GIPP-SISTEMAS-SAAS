import React from 'react';
import { ChevronDown } from 'lucide-react';

export const getTodayDate = (): string => { 
    const date = new Date(); 
    const year = date.getFullYear(); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0'); 
    return `${year}-${month}-${day}`; 
};

export const formatDateLocal = (dateString: any): string => { 
    if (!dateString) return '---'; 
    try { 
        if (typeof dateString !== 'string') return '---'; 
        const [year, month, day] = dateString.split('-'); 
        if (!year || !month || !day) return dateString;
        return `${day}/${month}/${year}`; 
    } catch(e) { 
        return String(dateString); 
    } 
};

export const isValidCPF = (cpf: string): boolean => {
    if (!cpf) return false;
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCPF.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCPF.charAt(10))) return false;
    return true;
};

export const formatCPF = (v: string): string => {
    if (!v) return '';
    const clean = v.replace(/\D/g, '');
    if (clean.length <= 3) return clean;
    if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
    if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
};

export const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
            legacyCopy(text);
        });
    } else {
        legacyCopy(text);
    }
};

function legacyCopy(text: string) {
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    } catch {}
}

export const resizeImageAndCompress = (dataUrl: string, maxWidth = 400, maxHeight = 400, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
        if (!dataUrl || typeof window === 'undefined') {
            resolve(dataUrl);
            return;
        }
        if (!dataUrl.startsWith("data:")) {
            resolve(dataUrl);
            return;
        }

        let processedDataUrl = dataUrl;
        if (dataUrl.startsWith("data:application/octet-stream")) {
            processedDataUrl = dataUrl.replace("data:application/octet-stream", "data:image/jpeg");
        }

        const img = new window.Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                const ratio = Math.min(maxWidth / width, maxHeight / height);
                if (ratio < 1) {
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(processedDataUrl);
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                const result = canvas.toDataURL('image/jpeg', quality);
                if (result.length > 100000 && quality > 0.3) {
                    resizeImageAndCompress(processedDataUrl, maxWidth, maxHeight, quality - 0.25).then(resolve);
                } else {
                    resolve(result);
                }
            } catch {
                resolve(processedDataUrl);
            }
        };

        img.onerror = () => resolve(processedDataUrl);
        img.src = processedDataUrl;
    });
};

export const playMenuSound = () => {
    try {
        if (typeof window === 'undefined') return;
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        }
    } catch {}
};

export const playNotificationSound = () => {
    try {
        if (typeof window === 'undefined') return;
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.1);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(now + 0.3);
        }
    } catch {}
};

export const Button = ({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'md',
    className = '', 
    disabled,
    ...props 
}: { 
    children: React.ReactNode; 
    onClick?: (e: any) => void; 
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline'; 
    size?: 'sm' | 'md' | 'lg';
    className?: string; 
    disabled?: boolean;
    [x: string]: any; 
}) => { 
    const sizeClasses = {
        sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
        md: "px-4 py-2.5 text-sm rounded-xl gap-2",
        lg: "px-5 py-3 text-base rounded-xl gap-2.5 font-extrabold"
    };

    const variantClasses = { 
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow border border-indigo-600/30 active:scale-[0.98]", 
        secondary: "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 active:scale-[0.98]", 
        danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow border border-rose-600/30 active:scale-[0.98]", 
        success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow border border-emerald-600/30 active:scale-[0.98]", 
        warning: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow border border-amber-600/30 active:scale-[0.98]",
        ghost: "bg-transparent text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent active:scale-[0.98]",
        outline: "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 active:scale-[0.98]"
    }; 

    return (
        <button 
            className={`inline-flex items-center justify-center font-bold transition-all duration-150 select-none whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`} 
            onClick={onClick} 
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    ); 
};

export const FormInput = ({ 
    label, 
    value, 
    onChange, 
    type = "text", 
    required = false, 
    className = "", 
    placeholder = "", 
    preserveCase = false, 
    error = "",
    helperText = "",
    ...props 
}: { 
    label?: any; 
    value: any; 
    onChange: any; 
    type?: string; 
    required?: boolean; 
    className?: string; 
    placeholder?: string; 
    preserveCase?: boolean; 
    error?: string;
    helperText?: string;
    [key: string]: any; 
}) => {
    const safeVal = (typeof value === 'object' && value !== null) ? (value.value || value.label || '') : (value || '');
    return ( 
        <div className={`mb-4 group ${className}`}>
            {label && (
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-0.5 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400">
                    {label} {required && <span className="text-rose-500 font-bold">*</span>}
                </label>
            )}
            <input 
                type={type} 
                className={`w-full bg-slate-50 dark:bg-slate-800/80 border ${error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:ring-indigo-500/20'} rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${!preserveCase && type !== 'password' && type !== 'email' ? 'uppercase' : 'normal-case'}`} 
                value={safeVal} 
                onChange={e => {
                    let val = e.target.value;
                    if (!preserveCase && (type === 'text' || type === 'search' || !type)) {
                        val = typeof val === 'string' ? val.toUpperCase() : val;
                    }
                    onChange(val);
                }} 
                required={required} 
                placeholder={placeholder} 
                {...props}
            />
            {error ? (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 ml-0.5">{error}</p>
            ) : helperText ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 ml-0.5">{helperText}</p>
            ) : null}
        </div> 
    );
};

export const FormSelect = ({ 
    label, 
    value, 
    onChange, 
    options, 
    required = false,
    className = "", 
    error = "",
    helperText = "",
    ...props 
}: { 
    label?: any; 
    value: any; 
    onChange: any; 
    options: any[]; 
    required?: boolean;
    className?: string; 
    error?: string;
    helperText?: string;
    [key: string]: any; 
}) => {
    const safeVal = (typeof value === 'object' && value !== null) ? (value.value || '') : (value || '');
    return ( 
        <div className={`mb-4 group ${className}`}>
            {label && (
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-0.5 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400">
                    {label} {required && <span className="text-rose-500 font-bold">*</span>}
                </label>
            )}
            <div className="relative">
                <select 
                    className={`w-full bg-slate-50 dark:bg-slate-800/80 border ${error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:ring-indigo-500/20'} rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 transition-all duration-150 appearance-none cursor-pointer pr-10`} 
                    value={safeVal} 
                    onChange={e => onChange(e.target.value)} 
                    required={required}
                    {...props}
                >
                    <option value="">Selecione...</option>
                    {(options || []).map((opt, idx) => {
                        const isObj = typeof opt === 'object' && opt !== null;
                        const val = isObj ? (opt.value !== undefined ? opt.value : opt) : opt;
                        let lab = isObj ? (opt.label || opt.nome || opt.titulo || opt.value) : opt;
                        if (typeof lab === 'object') lab = JSON.stringify(lab);
                        return <option key={idx} value={val}>{lab}</option>;
                    })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors"><ChevronDown size={18} /></div>
            </div>
            {error ? (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 ml-0.5">{error}</p>
            ) : helperText ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 ml-0.5">{helperText}</p>
            ) : null}
        </div> 
    );
};

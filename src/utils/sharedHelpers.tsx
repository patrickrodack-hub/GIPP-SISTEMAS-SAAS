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

export const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: { children: React.ReactNode, onClick?: (e: any) => void, variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost', className?: string, [x: string]: any }) => { 
    const variants = { 
        primary: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 border-0 hover:-translate-y-1 hover:scale-105 bg-[length:200%_auto] hover:bg-right transition-all duration-500", 
        secondary: "bg-white/80 backdrop-blur-md text-slate-700 border-white hover:bg-white hover:border-indigo-200 shadow-sm border hover:shadow-md hover:-translate-y-0.5", 
        danger: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 border-0 hover:-translate-y-1 hover:scale-105", 
        success: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 border-0 hover:-translate-y-1 hover:scale-105", 
        ghost: "bg-transparent text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 border-transparent hover:backdrop-blur-sm" 
    }; 
    return (
        <button 
            className={`relative overflow-hidden px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 ${variants[variant]} ${className}`} 
            onClick={onClick} 
            {...props}
        >
            {children}
        </button>
    ); 
};

export const FormInput = ({ label, value, onChange, type = "text", required = false, className="", placeholder="", preserveCase = false, ...props }: { label: any; value: any; onChange: any; type?: string; required?: boolean; className?: string; placeholder?: string; preserveCase?: boolean; [key: string]: any }) => {
    const safeVal = (typeof value === 'object' && value !== null) ? (value.value || value.label || '') : (value || '');
    return ( 
        <div className={`mb-6 group ${className}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 ml-1 transition-colors group-focus-within:text-indigo-600">{label} {required && <span className="text-rose-500">*</span>}</label>
            <input 
                type={type} 
                className={`input-futuristic w-full rounded-2xl p-4 text-sm shadow-sm text-slate-700 placeholder:text-slate-400 backdrop-blur-sm ${!preserveCase && type !== 'password' && type !== 'email' ? 'uppercase' : 'normal-case'}`} 
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
        </div> 
    );
};

export const FormSelect = ({ label, value, onChange, options, className="", ...props }: { label: any; value: any; onChange: any; options: any[]; className?: string; [key: string]: any }) => {
    const safeVal = (typeof value === 'object' && value !== null) ? (value.value || '') : (value || '');
    return ( 
        <div className={`mb-6 group ${className}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 ml-1 transition-colors group-focus-within:text-indigo-600">{label}</label>
            <div className="relative">
                <select 
                    className="input-futuristic w-full rounded-2xl p-4 text-sm bg-white/50 appearance-none cursor-pointer text-slate-700 shadow-sm pr-10 backdrop-blur-sm" 
                    value={safeVal} 
                    onChange={e => onChange(e.target.value)} 
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-indigo-500 transition-colors"><ChevronDown size={18} /></div>
            </div>
        </div> 
    );
};

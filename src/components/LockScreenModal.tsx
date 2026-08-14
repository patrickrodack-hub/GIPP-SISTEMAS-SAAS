import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Shield, Clock, Church, KeyRound, AlertTriangle, LogOut } from 'lucide-react';

interface LockScreenModalProps {
  churchName?: string;
  userName?: string;
  userRole?: string;
  userPhoto?: string;
  isLocked: boolean;
  onUnlock: (pinOrPass: string) => boolean;
  onLogout: () => void;
}

export const LockScreenModal: React.FC<LockScreenModalProps> = ({
  churchName = 'Igreja Sede',
  userName = 'Operador',
  userRole = 'Administrador',
  userPhoto,
  isLocked,
  onUnlock,
  onLogout
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLocked) {
      setPin('');
      setErrorMsg('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg('Digite o PIN ou senha de acesso');
      return;
    }
    const success = onUnlock(pin);
    if (!success) {
      setErrorMsg('Senha ou PIN incorreto!');
      setPin('');
      inputRef.current?.focus();
    } else {
      setErrorMsg('');
    }
  };

  const handleDigitClick = (num: string) => {
    if (pin.length < 8) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 select-none animate-fadeIn text-white">
      {/* Top ambient header */}
      <div className="absolute top-8 left-8 flex items-center gap-3 opacity-80">
        <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
          <Church size={20} />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-wider uppercase text-white/90">{churchName}</h2>
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Sessão Protegida por PIN</span>
        </div>
      </div>

      {/* Clock Display */}
      <div className="text-center mb-8">
        <div className="text-6xl sm:text-7xl font-light tracking-tighter text-white/90 font-mono">
          {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-400 mt-2 font-bold">
          {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* User Card & Unlock Form */}
      <div className="w-full max-w-sm bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white/20 p-1 flex items-center justify-center shadow-lg overflow-hidden">
            {userPhoto ? (
              <img src={userPhoto} alt={userName} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="text-2xl font-black text-white">{userName.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-md">
            <Lock size={12} />
          </div>
        </div>

        <h3 className="text-base font-bold text-white">{userName}</h3>
        <span className="text-[11px] text-blue-400 uppercase font-semibold tracking-wider mb-5">{userRole}</span>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              placeholder="Digite a Senha ou PIN..."
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-2xl py-3 px-4 text-center text-sm tracking-widest font-mono text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
            />
            <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>

          {errorMsg && (
            <div className="text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 animate-bounce">
              <AlertTriangle size={14} />
              {errorMsg}
            </div>
          )}

          {/* Keypad for Quick Touch / Pin Entry */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') setPin('');
                  else if (k === '⌫') handleBackspace();
                  else handleDigitClick(k);
                }}
                className="py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-xs font-bold font-mono text-slate-200 transition-all cursor-pointer border border-white/5"
              >
                {k}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2"
          >
            <Unlock size={16} />
            Desbloquear Painel
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/5 w-full flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] flex items-center gap-1">
            <Shield size={12} className="text-emerald-400" />
            Proteção Ativa
          </span>
          <button
            onClick={onLogout}
            className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <LogOut size={12} />
            Encerrar Sessão
          </button>
        </div>
      </div>
    </div>
  );
};

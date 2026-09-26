import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, QrCode, CheckCircle2, AlertCircle, RefreshCw, 
  Search, Users, Clock, Printer, X, Volume2, ShieldCheck, Check
} from 'lucide-react';
import jsQR from 'jsqr';
import { EventoItem, InscricaoItem } from '../../data/eventosInscricoesData';

interface CheckinScannerModalProps {
  evento: EventoItem;
  inscricoes: InscricaoItem[];
  onCheckinConfirm: (inscricaoId: string) => void;
  onClose: () => void;
}

export const CheckinScannerModal: React.FC<CheckinScannerModalProps> = ({
  evento,
  inscricoes,
  onCheckinConfirm,
  onClose,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [searchMember, setSearchMember] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastCheckin, setLastCheckin] = useState<InscricaoItem | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Play audio tone
  const playBeep = (type: 'success' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.1); // D6
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.setValueAtTime(200, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch {
      // AudioContext may be blocked by autoplay rules
    }
  };

  const eventoInscricoes = inscricoes.filter((i) => i.eventoId === evento.id && i.status !== 'cancelado');
  const presentesCount = eventoInscricoes.filter((i) => i.presente).length;
  const ausentesCount = eventoInscricoes.length - presentesCount;
  const pctPresenca = eventoInscricoes.length > 0 ? Math.round((presentesCount / eventoInscricoes.length) * 100) : 0;

  // Process Check-in code
  const handleProcessCode = (codeStr: string) => {
    if (!codeStr || !codeStr.trim()) return;
    const clean = codeStr.trim().toUpperCase();

    const found = eventoInscricoes.find((ins) => 
      ins.qrCodeToken.toUpperCase() === clean ||
      (ins.cpf && ins.cpf.replace(/\D/g, '') === clean.replace(/\D/g, '')) ||
      ins.id.toUpperCase() === clean
    );

    if (!found) {
      playBeep('error');
      setFeedbackMsg({
        text: `Inscrição não encontrada para o código: "${codeStr}" neste evento!`,
        type: 'error',
      });
      return;
    }

    if (found.presente) {
      playBeep('error');
      setFeedbackMsg({
        text: `Atenção: ${found.nome} já realizou check-in às ${found.checkInEm ? new Date(found.checkInEm).toLocaleTimeString('pt-BR') : ''}!`,
        type: 'warning',
      });
      setLastCheckin(found);
      setManualCode('');
      return;
    }

    // Success
    playBeep('success');
    onCheckinConfirm(found.id);
    const updated = {
      ...found,
      presente: true,
      checkInEm: new Date().toISOString(),
    };
    setLastCheckin(updated);
    setFeedbackMsg({
      text: `Presença Confirmada! Bem-vindo(a), ${found.nome}!`,
      type: 'success',
    });
    setManualCode('');
  };

  // Camera Scanning Loop with jsQR
  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleProcessCode(code.data);
          }
        }
      }
    }
    if (isCameraActive) {
      animationFrameId.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    if (isCameraActive) {
      animationFrameId.current = requestAnimationFrame(tick);
    } else if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isCameraActive]);

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
      setIsCameraActive(false);
    } else {
      try {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsCameraActive(true);
        }
      } catch (err: any) {
        setFeedbackMsg({
          text: 'Câmera não disponível no dispositivo. Utilize a digitação manual de código ou busca por nome.',
          type: 'warning',
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Filter list for rapid check-in search
  const rapidSearchResults = searchMember.trim()
    ? eventoInscricoes.filter((i) => 
        i.nome.toLowerCase().includes(searchMember.toLowerCase()) ||
        (i.cpf && i.cpf.includes(searchMember)) ||
        i.qrCodeToken.toLowerCase().includes(searchMember.toLowerCase())
      )
    : eventoInscricoes.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 my-6 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-inner">
              <QrCode size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Terminal de Portaria
                </span>
                <span className="text-xs text-slate-400">• Check-in Express</span>
              </div>
              <h3 className="text-lg font-black text-slate-800">{evento.nome}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Real-time Status Badges */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Inscritos</p>
            <p className="text-xl font-black text-slate-800">{eventoInscricoes.length}</p>
          </div>

          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center">
            <p className="text-[11px] font-bold text-emerald-600 uppercase">Presentes ({pctPresenca}%)</p>
            <p className="text-xl font-black text-emerald-700">{presentesCount}</p>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center">
            <p className="text-[11px] font-bold text-amber-600 uppercase">Ausentes</p>
            <p className="text-xl font-black text-amber-700">{ausentesCount}</p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`p-3.5 rounded-2xl mb-4 flex items-center justify-between text-xs font-bold animate-fadeIn ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500 text-white'
                : feedbackMsg.type === 'warning'
                ? 'bg-amber-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="p-1 hover:bg-black/10 rounded-full">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main Check-in Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto pr-1">
          {/* Left Column: Camera and Manual Scanner */}
          <div className="space-y-4">
            {/* Camera Box */}
            <div className="relative bg-slate-900 rounded-3xl overflow-hidden aspect-video flex flex-col items-center justify-center border-2 border-slate-800 shadow-inner">
              <video ref={videoRef} className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`} playsInline />
              <canvas ref={canvasRef} className="hidden" />

              {!isCameraActive ? (
                <div className="text-center p-6 text-slate-400">
                  <Camera size={40} className="mx-auto mb-2 text-slate-500 opacity-60" />
                  <p className="text-xs font-semibold text-slate-300">Câmera de Leitura QR Code</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    Ative a câmera para escanear a credencial digital dos participantes instantaneamente.
                  </p>
                  <button
                    onClick={toggleCamera}
                    className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Ativar Câmera Scanner
                  </button>
                </div>
              ) : (
                <>
                  {/* Scanner Visual Reticle */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-2xl relative animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br" />
                    </div>
                  </div>
                  <button
                    onClick={toggleCamera}
                    className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20"
                  >
                    Desativar Câmera
                  </button>
                </>
              )}
            </div>

            {/* Manual Code Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessCode(manualCode);
              }}
              className="space-y-2"
            >
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Leitura Manual por Código de Inscrição / QR Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: EVT-1-INS-101-78901 ou CPF"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 text-sm font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 shrink-0"
                >
                  Validar
                </button>
              </div>
            </form>

            {/* Last Validated Card */}
            {lastCheckin && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-fadeIn">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div className="flex-1 truncate">
                  <p className="text-xs text-emerald-800 font-black truncate">{lastCheckin.nome}</p>
                  <p className="text-[11px] text-emerald-600">
                    Check-in confirmado às {lastCheckin.checkInEm ? new Date(lastCheckin.checkInEm).toLocaleTimeString('pt-BR') : ''}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Fast Search List */}
          <div className="flex flex-col space-y-3 bg-slate-50 p-4 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Busca Rápida de Presença por Nome
              </h4>
              <span className="text-[11px] text-slate-500">{eventoInscricoes.length} participantes</span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Digitar nome ou CPF do inscrito..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* List */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[320px] pr-1">
              {rapidSearchResults.map((ins) => (
                <div
                  key={ins.id}
                  className="bg-white p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">{ins.nome}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      <span>{ins.telefone || ins.email || 'Sem contato'}</span>
                      {ins.checkInEm && <span>• {new Date(ins.checkInEm).toLocaleTimeString('pt-BR')}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (ins.presente) {
                        handleProcessCode(ins.qrCodeToken);
                      } else {
                        handleProcessCode(ins.qrCodeToken);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                      ins.presente
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {ins.presente ? (
                      <>
                        <Check size={14} />
                        <span>Presente</span>
                      </>
                    ) : (
                      <span>Dar Presença</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

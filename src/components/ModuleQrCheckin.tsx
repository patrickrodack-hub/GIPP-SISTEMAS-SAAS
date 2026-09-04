import React, { useState, useContext, useMemo, useRef, useEffect } from 'react';
import { 
  QrCode, Camera, CheckCircle2, AlertCircle, RefreshCw, 
  Baby, GraduationCap, Users, Search, Download, Printer, 
  Sparkles, Check, X, Shield, ArrowRight
} from 'lucide-react';
import { ChurchContext } from '../context/ChurchContext';

export const ModuleQrCheckin: React.FC = () => {
  const { db, setDbState, addToast, user } = useContext(ChurchContext);
  const [activeMode, setActiveMode] = useState<'scan' | 'gerar_ebd' | 'gerar_kids'>('scan');
  const [targetContext, setTargetContext] = useState<'ebd' | 'kids'>('ebd');
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [lastChecked, setLastChecked] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [searchMember, setSearchMember] = useState('');

  const membros = useMemo(() => db.membros || [], [db.membros]);
  const kids = useMemo(() => db.kids_criancas || [], [db.kids_criancas]);
  const turmasEbd = useMemo(() => db.ebd?.turmas || [], [db.ebd?.turmas]);

  // Processa o Check-in com som e confirmação
  const handleProcessCode = (codeStr: string) => {
    if (!codeStr.trim()) return;
    const cleanCode = codeStr.trim().toUpperCase();

    // Verifica se é EBD ou Kids
    if (targetContext === 'ebd') {
      const membro = membros.find((m: any) => 
        (m.id && m.id.toUpperCase() === cleanCode) || 
        (m.cpf && m.cpf.replace(/\D/g, '') === cleanCode.replace(/\D/g, '')) ||
        (m.matricula && m.matricula.toUpperCase() === cleanCode)
      );

      if (membro) {
        const today = new Date().toISOString().split('T')[0];
        const presencasAtuais = db.ebd?.presencas || [];
        
        // Registra presença
        const novaPresenca = {
          id: `ebd_pres_${Date.now()}`,
          membro_id: membro.id,
          membro_nome: membro.nome,
          data: today,
          presente: true,
          origem: 'QR Code Express',
          hora: new Date().toLocaleTimeString('pt-BR')
        };

        const updated = [...presencasAtuais.filter((p: any) => !(p.membro_id === membro.id && p.data === today)), novaPresenca];
        setDbState((prev: any) => ({
          ...prev,
          ebd: {
            ...(prev.ebd || {}),
            presencas: updated
          }
        }));

        setLastChecked({
          tipo: 'membro',
          nome: membro.nome,
          detalhe: membro.cargo || membro.funcao || 'Membro EBD',
          foto: membro.foto,
          hora: new Date().toLocaleTimeString('pt-BR')
        });

        addToast(`Presença confirmada: ${membro.nome}!`, 'success');
        setManualCodeInput('');
      } else {
        addToast('Membro / Aluno não localizado com este código!', 'error');
      }
    } else {
      // Salinha Kids
      const kid = kids.find((k: any) => 
        (k.id && k.id.toUpperCase() === cleanCode) ||
        (k.nome && k.nome.toUpperCase().includes(cleanCode))
      );

      if (kid) {
        const today = new Date().toISOString().split('T')[0];
        const presencasKids = db.kids_presencas || [];

        const novaPresencaKid = {
          id: `kids_pres_${Date.now()}`,
          crianca_id: kid.id,
          crianca_nome: kid.nome,
          data: today,
          status: 'presente',
          checkin_hora: new Date().toLocaleTimeString('pt-BR'),
          responsavel: kid.responsavel_nome || 'Responsável'
        };

        const updated = [...presencasKids.filter((p: any) => !(p.crianca_id === kid.id && p.data === today)), novaPresencaKid];
        setDbState((prev: any) => ({
          ...prev,
          kids_presencas: updated
        }));

        setLastChecked({
          tipo: 'crianca',
          nome: kid.nome,
          detalhe: `Responsável: ${kid.responsavel_nome || 'Pais'} (${kid.responsavel_telefone || 'Sem tel'})`,
          foto: kid.foto,
          hora: new Date().toLocaleTimeString('pt-BR')
        });

        addToast(`Check-in confirmado: ${kid.nome}!`, 'success');
        setManualCodeInput('');
      } else {
        addToast('Criança não localizada com este código!', 'error');
      }
    }
  };

  // Liga/Desliga Câmera
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } catch (e) {
        addToast('Não foi possível acessar a câmera do dispositivo.', 'warning');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <QrCode size={30} className="text-blue-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide">Terminal QR Code & Chamada Express</h1>
            <p className="text-xs text-blue-100 mt-1 font-medium">Bipagem rápida de presenças para Escola Bíblica Dominical e Salinha Kids</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-2xl backdrop-blur-xs">
          <button
            onClick={() => setActiveMode('scan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'scan' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white'
            }`}
          >
            Terminal Leitor
          </button>
          <button
            onClick={() => setActiveMode('gerar_ebd')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'gerar_ebd' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white'
            }`}
          >
            Cartões EBD
          </button>
          <button
            onClick={() => setActiveMode('gerar_kids')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'gerar_kids' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white'
            }`}
          >
            Crachás Kids
          </button>
        </div>
      </div>

      {activeMode === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner & Manual Input */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              {/* Context Selector: EBD vs Kids */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTargetContext('ebd')}
                  className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    targetContext === 'ebd'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <GraduationCap size={16} />
                  Chamada EBD (Geral)
                </button>
                <button
                  onClick={() => setTargetContext('kids')}
                  className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    targetContext === 'kids'
                      ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-500 text-pink-600 dark:text-pink-400 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Baby size={16} />
                  Check-in Salinha Kids
                </button>
              </div>

              {/* Camera Area */}
              <div className="relative aspect-video rounded-3xl bg-slate-950 flex flex-col items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
                <video ref={videoRef} className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`} playsInline muted />
                {!isCameraActive && (
                  <div className="text-center p-6 text-slate-400 space-y-3">
                    <Camera size={40} className="mx-auto text-slate-500 opacity-60" />
                    <p className="text-xs font-bold">Câmera em espera</p>
                    <p className="text-[11px] text-slate-500 max-w-xs">Aponte a câmera para o QR Code da carteirinha ou digite o código/CPF abaixo.</p>
                  </div>
                )}
                {/* Aiming frame overlay */}
                {isCameraActive && (
                  <div className="absolute inset-0 border-4 border-blue-500/50 m-12 rounded-2xl animate-pulse pointer-events-none" />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={toggleCamera}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isCameraActive 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  }`}
                >
                  <Camera size={16} />
                  {isCameraActive ? 'Desativar Câmera' : 'Ativar Câmera Scanner'}
                </button>
              </div>

              {/* Manual Barcode / Code input */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2">
                  Digitação Manual de Código / CPF / ID:
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleProcessCode(manualCodeInput);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Bipe com leitor USB ou digite aqui..."
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95"
                  >
                    <CheckCircle2 size={15} />
                    Confirmar
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Result Confirmation Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Última Presença Confirmada
              </h3>

              {lastChecked ? (
                <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/60 space-y-4 text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg overflow-hidden">
                    {lastChecked.foto ? (
                      <img src={lastChecked.foto} alt={lastChecked.nome} className="w-full h-full object-cover" />
                    ) : (
                      lastChecked.nome.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{lastChecked.nome}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lastChecked.detalhe}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] rounded-full uppercase tracking-wider">
                      Presença Registrada às {lastChecked.hora}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <QrCode size={40} className="mx-auto opacity-30" />
                  <p className="text-xs font-semibold">Nenhuma chamada realizada nesta sessão</p>
                  <p className="text-[10px]">Aguardando leitura do leitor ou câmera...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generator Modes for EBD / Kids */}
      {(activeMode === 'gerar_ebd' || activeMode === 'gerar_kids') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeMode === 'gerar_ebd' ? 'Cartões Rápidos de Chamada - EBD' : 'Crachás de Identificação - Salinha Kids'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Impressão em lote com QR Code individual para chamada instantânea</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Printer size={15} />
              Imprimir Cartões
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {(activeMode === 'gerar_ebd' ? membros : kids).slice(0, 12).map((item: any) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center space-y-3 flex flex-col items-center justify-between shadow-xs"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate w-full">{item.nome}</div>
                <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center">
                  {/* SVG Mock QR Code with actual ID encoded */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.id || item.cpf || item.nome)}`}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-mono">ID: {item.id ? item.id.substring(0, 8) : 'GIPP'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

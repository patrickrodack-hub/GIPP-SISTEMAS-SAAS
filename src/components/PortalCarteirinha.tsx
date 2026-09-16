import React, { useState, useEffect, useRef, useContext } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import jsQR from 'jsqr';
import { 
  FileBadge, Download, Printer, RotateCw, Camera, User, Building2, 
  QrCode, CheckCircle2, Calendar, MapPin, ClipboardList, Check, X, 
  RefreshCw, Sparkles, Clock, ShieldCheck, AlertCircle, Eye, Search,
  Award, Smartphone, Upload, Image as ImageIcon
} from 'lucide-react';
import { ChurchContext } from '../context/ChurchContext';
import { Button, formatDateLocal, playNotificationSound } from '../utils/sharedHelpers';

interface PortalCarteirinhaProps {
  user: any;
  igreja: any;
}

interface ScannedMemberInfo {
  id: string;
  nome: string;
  cargo?: string;
  cpf?: string;
  numero_registro?: string;
  foto?: string;
  timestamp: string;
  status: 'confirmado' | 'aviso';
}

export const PortalCarteirinha: React.FC<PortalCarteirinhaProps> = ({ user, igreja }) => {
  const { db, addToast } = useContext(ChurchContext) || {};
  
  // State for 3D flip animation
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  
  // State for high-quality PDF generation
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  
  // State for camera QR scanner
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannedMember, setScannedMember] = useState<ScannedMemberInfo | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [checkinHistory, setCheckinHistory] = useState<ScannedMemberInfo[]>(() => {
    try {
      const saved = localStorage.getItem('gipp_carteirinha_checkins');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Refs for PDF capture and Camera
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const printSheetRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanLoopRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera media tracks helper
  const stopCameraStream = () => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Turn on camera and start scanning with multi-tier fallback
  const startCameraScanner = async () => {
    setScannerError(null);
    setScannedMember(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setScannerError('Acesso à câmera não suportado neste navegador ou dispositivo.');
        setCameraActive(false);
        return;
      }

      let stream: MediaStream | null = null;

      // 1. First attempt: environment/rear camera
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
      } catch (backErr) {
        // 2. Second attempt: generic camera (webcam, front camera, any available device)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
        } catch (fallbackErr) {
          // Re-throw to handle in outer block
          throw fallbackErr;
        }
      }

      if (!stream) {
        throw new Error('Nenhum dispositivo de vídeo disponível.');
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setCameraActive(true);
      startScanLoop();
    } catch (err: any) {
      console.warn('Câmera indisponível no dispositivo:', err?.message || err);
      const isNotFound = err?.name === 'NotFoundError' || 
                         err?.name === 'DevicesNotFoundError' ||
                         (err?.message && String(err.message).toLowerCase().includes('not found'));
      const isPermissionDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';

      if (isPermissionDenied) {
        setScannerError('Permissão de acesso à câmera negada no navegador. Conceda a permissão para escanear ao vivo.');
      } else if (isNotFound) {
        setScannerError('Nenhuma câmera física detectada neste dispositivo. Você pode carregar uma foto com QR Code ou digitar o CPF/ID abaixo.');
      } else {
        setScannerError('Câmera não disponível no momento. Você pode utilizar a busca manual ou carregar uma imagem com QR Code.');
      }
      setCameraActive(false);
    }
  };

  // Handle QR Code from uploaded image file
  const handleQrImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });
          if (code && code.data) {
            handleIdentifyMember(code.data.trim());
          } else {
            if (addToast) {
              addToast('Nenhum QR Code legível foi detectado na imagem enviada.', 'warning');
            }
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // Continuous frame scanning loop
  const startScanLoop = () => {
    const scanFrame = () => {
      if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        scanLoopRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Scan with jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          handleIdentifyMember(code.data.trim());
          return; // Pause scanning while showing identified member
        }
      }

      scanLoopRef.current = requestAnimationFrame(scanFrame);
    };

    scanLoopRef.current = requestAnimationFrame(scanFrame);
  };

  // Identify member from scanned QR code data
  const handleIdentifyMember = (dataStr: string) => {
    try {
      playNotificationSound();
    } catch (e) {
      // Audio autoplay might be blocked
    }

    const membrosList: any[] = db?.membros || [];
    const cleanQuery = dataStr.toLowerCase().trim();

    // 1. Try match by ID, CPF, Registration Number, or Name
    let matched = membrosList.find(m => 
      String(m.id).toLowerCase() === cleanQuery ||
      (m.cpf && m.cpf.replace(/\D/g, '') === cleanQuery.replace(/\D/g, '')) ||
      (m.numero_registro && String(m.numero_registro).toLowerCase() === cleanQuery) ||
      (m.nome && m.nome.toLowerCase() === cleanQuery)
    );

    // 2. Check if it matches the current logged-in user
    if (!matched && user && (
      String(user.id).toLowerCase() === cleanQuery ||
      (user.cpf && user.cpf.replace(/\D/g, '') === cleanQuery.replace(/\D/g, '')) ||
      (user.numero_registro && String(user.numero_registro).toLowerCase() === cleanQuery)
    )) {
      matched = user;
    }

    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (matched) {
      const resultInfo: ScannedMemberInfo = {
        id: matched.id || 'membro_' + Date.now(),
        nome: matched.nome || 'Membro Identificado',
        cargo: matched.cargo || 'Membro',
        cpf: matched.cpf || '---',
        numero_registro: matched.numero_registro || '000000',
        foto: matched.foto || null,
        timestamp: nowStr,
        status: 'confirmado'
      };
      setScannedMember(resultInfo);
      
      // Persist in checkin history
      setCheckinHistory(prev => {
        const updated = [resultInfo, ...prev.slice(0, 19)];
        try {
          localStorage.setItem('gipp_carteirinha_checkins', JSON.stringify(updated));
        } catch (e) {
          console.warn('Erro ao salvar histórico de checkin:', e);
        }
        return updated;
      });

      if (addToast) {
        addToast(`Check-in confirmado: ${matched.nome}!`, 'success');
      }
    } else {
      // Unrecognized QR payload
      const unknownInfo: ScannedMemberInfo = {
        id: dataStr,
        nome: `Código: ${dataStr}`,
        cargo: 'Não Cadastrado',
        cpf: '---',
        numero_registro: 'N/D',
        foto: undefined,
        timestamp: nowStr,
        status: 'aviso'
      };
      setScannedMember(unknownInfo);
      if (addToast) {
        addToast('QR Code escaneado, mas membro não localizado no banco!', 'warning');
      }
    }

    // Stop continuous loop once identified
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
  };

  // Clean up camera when unmounting
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Print to PDF function (generates high-quality PDF)
  const handlePrintToPdf = async () => {
    setIsGeneratingPdf(true);
    if (addToast) {
      addToast('A processar credencial em alta resolução para download...', 'info');
    }

    try {
      // Element that holds both front and back ready for print capture
      const targetElement = printSheetRef.current;
      if (!targetElement) {
        throw new Error('Elemento de impressão não encontrado.');
      }

      // Temporarily reveal print sheet offscreen
      targetElement.style.display = 'block';

      // Capture at scale: 3 for crisp vectors, text, and QR code
      const canvas = await html2canvas(targetElement, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      targetElement.style.display = 'none';

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Standard A4 PDF (210mm x 297mm) in portrait mode
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      
      // Scale image maintaining aspect ratio and centering on page
      const imgProps = pdf.getImageProperties(imgData);
      const aspect = imgProps.width / imgProps.height;
      
      let renderWidth = 190;
      let renderHeight = renderWidth / aspect;
      
      if (renderHeight > pdfHeight - 20) {
        renderHeight = pdfHeight - 20;
        renderWidth = renderHeight * aspect;
      }

      const posX = (pdfWidth - renderWidth) / 2;
      const posY = 15;

      pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
      
      // Clean file name
      const safeName = (user?.nome || 'Membro').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Credencial_${safeName}.pdf`);

      if (addToast) {
        addToast('Credencial baixada em PDF com alta qualidade!', 'success');
      }
    } catch (err: any) {
      console.error('Erro ao gerar PDF da carteirinha:', err);
      if (addToast) {
        addToast('Falha ao gerar o arquivo PDF da credencial.', 'error');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const churchName = igreja?.nome || 'Igreja Assembleia de Deus';
  const pastorPresidente = igreja?.pastor || 'Pastor Presidente';

  return (
    <div id="portal_carteirinha" className="space-y-6 animate-entrance flex flex-col items-center justify-center pb-12 w-full max-w-4xl mx-auto px-4">
      {/* Header Section */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FileBadge size={32} className="text-emerald-500" /> Credencial Digital
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Cartão oficial de identificação de membros e obreiros com validação por QR Code.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Print to PDF Button */}
          <button
            id="btn_print_pdf_carteirinha"
            onClick={handlePrintToPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            title="Baixar Credencial em PDF de Alta Qualidade"
          >
            {isGeneratingPdf ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Printer size={16} />
            )}
            <span>{isGeneratingPdf ? 'Gerando PDF...' : 'Imprimir em PDF'}</span>
          </button>

          {/* Camera QR Scanner for Check-in */}
          <button
            id="btn_open_camera_checkin"
            onClick={() => {
              setIsScannerOpen(true);
              startCameraScanner();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="Escanear QR Code com a Câmera para Check-in"
          >
            <Camera size={16} />
            <span>Escanear QR (Check-in)</span>
          </button>

          {/* Flip Card Toggle Button */}
          <button
            id="btn_flip_carteirinha"
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer border border-slate-300/80"
            title="Girar Cartão (Frente e Verso)"
          >
            <RotateCw size={16} className={`transition-transform duration-500 ${isFlipped ? 'rotate-180 text-amber-600' : 'text-slate-600'}`} />
            <span className="hidden sm:inline">{isFlipped ? 'Ver Frente' : 'Ver Verso'}</span>
          </button>
        </div>
      </div>

      {/* Flip Instruction Hint */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-amber-50/80 border border-amber-200/80 px-4 py-2 rounded-full shadow-xs animate-pulse">
        <Sparkles size={14} className="text-amber-500" />
        <span>Toque ou clique no cartão para girar e visualizar o <strong>{isFlipped ? 'lado da frente' : 'verso cadastral'}</strong></span>
      </div>

      {/* 3D Flippable Card Container */}
      <div 
        className="w-full flex justify-center items-center py-4"
        style={{ perspective: '1200px' }}
      >
        <div
          id="card_flipper_container"
          ref={cardContainerRef}
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-[340px] sm:w-[360px] h-[550px] cursor-pointer select-none transition-transform duration-700 hover:scale-[1.02]"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
          title="Clique para virar o cartão"
        >
          {/* ========================================================= */}
          {/* LADO DA FRENTE (FRONT FACE)                                */}
          {/* ========================================================= */}
          <div
            ref={frontCardRef}
            className="absolute inset-0 w-full h-full rounded-[2.2rem] overflow-hidden shadow-2xl border border-slate-700 bg-slate-950 text-white flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Holographic Glowing Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[90px] opacity-25 -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500 rounded-full blur-[100px] opacity-20 -ml-20 -mb-20 pointer-events-none"></div>
            <div className="absolute inset-0 border-[3px] border-amber-400/20 m-2 rounded-[1.8rem] pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500"></div>

            <div className="p-6 relative z-10 flex flex-col h-full justify-between">
              {/* Institutional Header */}
              <div className="flex flex-col items-center text-center pb-4 border-b border-white/10">
                <div className="relative mb-2">
                  {igreja?.logo ? (
                    <img 
                      src={igreja.logo} 
                      alt="Logo da Igreja" 
                      className="h-16 w-16 object-contain bg-white rounded-2xl p-1.5 shadow-xl border border-amber-400/40"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
                      <Building2 size={32} className="text-amber-400" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 rounded-full p-1 shadow-md">
                    <ShieldCheck size={12} />
                  </div>
                </div>

                <h3 className="font-black text-white text-sm uppercase tracking-wider drop-shadow-md leading-tight line-clamp-1">
                  {churchName}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[9px] text-amber-400 font-black tracking-[0.25em] uppercase">
                    Credencial Oficial Eclesiástica
                  </span>
                </div>
              </div>

              {/* Photo & QR Code Section */}
              <div className="flex gap-4 my-auto items-center">
                {/* Member Photo */}
                <div className="w-28 h-36 bg-slate-900 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl shrink-0 relative group/photo">
                  {user?.foto ? (
                    <img 
                      src={user.foto} 
                      alt={user?.nome} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800">
                      <User size={48} className="text-slate-400 mb-1" />
                      <span className="text-[9px] font-bold text-slate-400">Sem Foto</span>
                    </div>
                  )}
                  <div className="absolute top-1 left-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[7px] font-bold text-amber-400 uppercase tracking-widest border border-amber-400/30">
                    Ativo
                  </div>
                </div>

                {/* Validation QR Code */}
                <div className="flex-1 bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(user?.id || 'MEMBRO_GIPP')}&color=0f172a&bgcolor=ffffff`} 
                    alt="QR Code Check-in" 
                    className="w-28 h-28 object-contain"
                  />
                  <div className="mt-1 flex items-center justify-center gap-1 text-[8px] font-black text-slate-800 tracking-wider uppercase">
                    <CheckCircle2 size={10} className="text-emerald-600" />
                    <span>Check-in Válido</span>
                  </div>
                </div>
              </div>

              {/* Member Core Data */}
              <div className="mt-auto pt-2 border-t border-white/10">
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Nome do Titular</p>
                <p className="text-lg font-black text-white uppercase leading-tight tracking-tight drop-shadow-md truncate">
                  {user?.nome || 'Nome do Membro'}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-3 items-center">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Cargo / Função</p>
                    <div className="bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg shadow-sm inline-block">
                      <p className="text-[11px] font-black uppercase tracking-wider truncate max-w-[130px]">
                        {user?.cargo || 'Membro'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Nº Registro</p>
                    <p className="text-xs font-mono font-bold text-amber-300 bg-white/10 px-2.5 py-1 rounded-lg inline-block border border-white/20">
                      {user?.numero_registro || '000000'}
                    </p>
                  </div>
                </div>

                {/* Flip Card Badge */}
                <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <ShieldCheck size={11} className="text-emerald-400" /> Válido em Território Nacional
                  </span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <RotateCw size={10} /> Clique p/ Girar
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* LADO DO VERSO (BACK FACE)                                 */}
          {/* ========================================================= */}
          <div
            ref={backCardRef}
            className="absolute inset-0 w-full h-full rounded-[2.2rem] overflow-hidden shadow-2xl border border-slate-700 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Top Amber Ribbon */}
            <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500"></div>
            <div className="absolute inset-0 border-[3px] border-amber-400/20 m-2 rounded-[1.8rem] pointer-events-none"></div>

            <div className="p-6 relative z-10 flex flex-col h-full justify-between">
              {/* Header Verso */}
              <div className="pb-3 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                    <ClipboardList size={14} className="text-amber-400" /> Registro Eclesiástico
                  </h4>
                  <p className="text-[9px] text-slate-400 font-medium">Dados de Validação e Assentamento</p>
                </div>
                <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                  Autenticado
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-3 my-auto text-left">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <p className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Documento (CPF)</p>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">{user?.cpf || 'Não informado'}</p>
                </div>

                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <p className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Nascimento</p>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">
                    {formatDateLocal(user?.data_nascimento) || 'Não informado'}
                  </p>
                </div>

                <div className="col-span-2 bg-white/5 p-2 rounded-xl border border-white/5">
                  <p className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Filiação</p>
                  <p className="text-[11px] font-medium text-slate-200 uppercase leading-snug mt-0.5">
                    {user?.nome_pai || 'Pai não informado'} <br />
                    {user?.nome_mae || 'Mãe não informada'}
                  </p>
                </div>

                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <p className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Batismo em Águas</p>
                  <p className="text-[11px] font-mono font-bold text-white mt-0.5">
                    {formatDateLocal(user?.data_batismo) || 'Não informado'}
                  </p>
                </div>

                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <p className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Data Admissão</p>
                  <p className="text-[11px] font-mono font-bold text-white mt-0.5">
                    {formatDateLocal(user?.data_admissao) || 'Não informado'}
                  </p>
                </div>

                <div className="col-span-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/20">
                  <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={10} /> Congregação / Templo
                  </p>
                  <p className="text-[11px] font-bold text-white truncate mt-0.5">
                    {churchName} - {igreja?.cidade || 'Sede'}/{igreja?.uf || 'BR'}
                  </p>
                </div>
              </div>

              {/* Signatures and Authority */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between items-end gap-3 mb-2">
                  <div className="w-1/2 text-center">
                    <div className="border-b border-slate-500 w-full mb-1"></div>
                    <p className="text-[7px] text-slate-400 uppercase font-bold tracking-widest truncate">
                      Assinatura do Titular
                    </p>
                  </div>
                  <div className="w-1/2 text-center">
                    <div className="border-b border-amber-400 w-full mb-1"></div>
                    <p className="text-[7px] font-bold text-amber-300 uppercase tracking-wider truncate">
                      {pastorPresidente}
                    </p>
                    <p className="text-[6px] text-slate-400 uppercase tracking-widest">
                      Pastor Presidente
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[8px] text-slate-400 pt-1 border-t border-white/5">
                  <span className="font-mono">ID: {user?.id?.slice(0, 10) || '00000000'}</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <RotateCw size={9} /> Clique p/ Voltar à Frente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auxiliary Information Notice */}
      <div className="w-full max-w-md bg-emerald-50 text-emerald-900 p-4 rounded-2xl border border-emerald-200/80 shadow-xs flex items-start gap-3 text-xs sm:text-sm">
        <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Validação Digital Integrada</p>
          <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
            Esta credencial digital possui validade oficial para entrada em congregações, eventos oficiais e reuniões administrativas. O QR Code permite check-in instantâneo em cultos e departamentos.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CAMERA QR CODE SCANNER MODAL (FOR CHECK-IN PURPOSES)       */}
      {/* ========================================================= */}
      {isScannerOpen && (
        <div 
          id="modal_qr_scanner_checkin"
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-entrance"
          onClick={() => {
            stopCameraStream();
            setIsScannerOpen(false);
          }}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-white flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Scanner de Check-in</h3>
                  <p className="text-xs text-slate-400">Identificação instantânea de membros pela câmera</p>
                </div>
              </div>

              <button
                onClick={() => {
                  stopCameraStream();
                  setIsScannerOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Fechar Scanner"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Camera Viewport */}
            <div className="p-6 flex flex-col items-center">
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  playsInline
                  muted
                />

                {/* Hidden canvas for jsQR analysis */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Hidden file input for uploading QR code images */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQrImageUpload}
                  className="hidden"
                />

                {/* Animated Targeting Reticle */}
                {cameraActive && !scannedMember && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-2xl relative animate-pulse shadow-[0_0_25px_rgba(52,211,153,0.3)]">
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400"></div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400"></div>
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400"></div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400"></div>
                      {/* Laser scanning beam */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce"></div>
                    </div>
                  </div>
                )}

                {/* Idle / Error State */}
                {!cameraActive && (
                  <div className="p-6 text-center space-y-3">
                    <AlertCircle size={40} className="mx-auto text-amber-400" />
                    <p className="text-xs font-bold text-slate-300 max-w-sm mx-auto leading-relaxed">
                      {scannerError || 'Câmera Desconectada'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        onClick={startCameraScanner}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw size={14} /> Tentar Câmera Novamente
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload size={14} /> Carregar Imagem com QR
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Scanned Member Identification Card */}
              {scannedMember && (
                <div className="w-full mt-4 bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-4 shadow-xl animate-entrance">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-700 border-2 border-emerald-400 shrink-0 flex items-center justify-center">
                      {scannedMember.foto ? (
                        <img src={scannedMember.foto} alt={scannedMember.nome} className="w-full h-full object-cover" />
                      ) : (
                        <User size={28} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          Check-in Confirmado
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {scannedMember.timestamp}
                        </span>
                      </div>
                      <h4 className="font-black text-white text-base truncate mt-1">
                        {scannedMember.nome}
                      </h4>
                      <p className="text-xs text-amber-400 font-bold">
                        {scannedMember.cargo || 'Membro'} • Reg: {scannedMember.numero_registro || 'N/D'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700 flex gap-2">
                    <button
                      onClick={() => {
                        setScannedMember(null);
                        startScanLoop();
                      }}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw size={14} /> Escanear Próximo Membro
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Entry Fallback */}
              <div className="w-full mt-4 pt-3 border-t border-slate-800">
                <p className="text-xs font-bold text-slate-400 mb-2">
                  Ou digite o Código / CPF do Membro:
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualCodeInput.trim()) {
                      handleIdentifyMember(manualCodeInput.trim());
                      setManualCodeInput('');
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ex: CPF ou ID do membro..."
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Identificar
                  </button>
                </form>
              </div>

              {/* Recent Check-in Logs */}
              {checkinHistory.length > 0 && (
                <div className="w-full mt-4 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> Últimos Check-ins na Sessão
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {checkinHistory.length} registrado(s)
                    </span>
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {checkinHistory.slice(0, 5).map((chk, idx) => (
                      <div key={idx} className="bg-slate-950/60 p-2 rounded-xl flex items-center justify-between text-xs border border-slate-800">
                        <div className="truncate mr-2">
                          <span className="font-bold text-white">{chk.nome}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">({chk.cargo})</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                          {chk.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HIDDEN HIGH-RES PRINT SHEET (CAPTURED FOR THE PDF)        */}
      {/* Contains both Front and Back formatted for cutting/print  */}
      {/* ========================================================= */}
      <div
        ref={printSheetRef}
        style={{
          display: 'none',
          width: '800px',
          padding: '30px',
          background: '#ffffff',
          color: '#0f172a',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Document Print Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', margin: 0, color: '#0f172a' }}>
            {churchName}
          </h1>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#059669', margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Folha Oficial de Impressão de Credencial Eclesiástica
          </p>
          <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0 0' }}>
            Documento emitido digitalmente em {new Date().toLocaleDateString('pt-BR')} • Próprio para laminação (Frente e Verso)
          </p>
        </div>

        {/* Side-by-side card layouts for printing */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', alignItems: 'stretch' }}>
          {/* Card Front Print */}
          <div style={{
            width: '350px',
            height: '520px',
            backgroundColor: '#020617',
            borderRadius: '24px',
            border: '2px solid #334155',
            color: '#ffffff',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', backgroundColor: '#f59e0b' }}></div>

            <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: '#ffffff' }}>
                {churchName}
              </div>
              <div style={{ fontSize: '9px', fontWeight: '800', color: '#f59e0b', letterSpacing: '2px', marginTop: '2px', textTransform: 'uppercase' }}>
                Credencial de Membro Oficial
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', margin: '14px 0' }}>
              <div style={{
                width: '100px',
                height: '130px',
                borderRadius: '16px',
                backgroundColor: '#1e293b',
                border: '2px solid #f59e0b',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8'
              }}>
                {user?.foto ? (
                  <img src={user.foto} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Foto 3x4</span>
                )}
              </div>

              <div style={{
                flex: 1,
                backgroundColor: '#ffffff',
                padding: '8px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(user?.id || 'MEMBRO_GIPP')}&color=0f172a&bgcolor=ffffff`}
                  alt="QR"
                  style={{ width: '90px', height: '90px', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '8px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '1px' }}>
                  Check-in Válido
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
                Nome do Titular
              </div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', margin: '2px 0 10px 0' }}>
                {user?.nome || 'Membro'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Função</div>
                  <div style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginTop: '2px' }}>
                    {user?.cargo || 'Membro'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Nº Registro</div>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold', color: '#fcd34d', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px', marginTop: '2px' }}>
                    {user?.numero_registro || '000000'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Back Print */}
          <div style={{
            width: '350px',
            height: '520px',
            backgroundColor: '#0f172a',
            borderRadius: '24px',
            border: '2px solid #334155',
            color: '#ffffff',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', backgroundColor: '#10b981' }}></div>

            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Assentamento Cadastral
              </div>
              <div style={{ fontSize: '8px', color: '#94a3b8' }}>Validação Eclesiástica GIPP</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '10px 0' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px' }}>
                <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase' }}>CPF</div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>{user?.cpf || '---'}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px' }}>
                <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase' }}>Nascimento</div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>{formatDateLocal(user?.data_nascimento) || '---'}</div>
              </div>
              <div style={{ gridColumn: 'span 2', backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px' }}>
                <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase' }}>Filiação</div>
                <div style={{ fontSize: '9px', color: '#ffffff', textTransform: 'uppercase' }}>
                  {user?.nome_pai || '---'} / {user?.nome_mae || '---'}
                </div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px' }}>
                <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase' }}>Batismo</div>
                <div style={{ fontSize: '9px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>{formatDateLocal(user?.data_batismo) || '---'}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px' }}>
                <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase' }}>Admissão</div>
                <div style={{ fontSize: '9px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>{formatDateLocal(user?.data_admissao) || '---'}</div>
              </div>
              <div style={{ gridColumn: 'span 2', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '6px', borderRadius: '8px' }}>
                <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#34d399', textTransform: 'uppercase' }}>Congregação</div>
                <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#ffffff' }}>{churchName} - {igreja?.cidade || 'Sede'}/{igreja?.uf || 'BR'}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #94a3b8', height: '14px', marginBottom: '3px' }}></div>
                  <div style={{ fontSize: '6px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Assinatura do Titular</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #f59e0b', height: '14px', marginBottom: '3px' }}></div>
                  <div style={{ fontSize: '7px', color: '#fcd34d', fontWeight: 'bold', textTransform: 'uppercase' }}>{pastorPresidente}</div>
                  <div style={{ fontSize: '6px', color: '#94a3b8', textTransform: 'uppercase' }}>Pastor Presidente</div>
                </div>
              </div>
              <div style={{ fontSize: '7px', color: '#64748b', textAlign: 'center' }}>
                Documento de porte obrigatório para identificação nos cultos e convenções.
              </div>
            </div>
          </div>
        </div>

        {/* Cutting instructions */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '10px', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
          ✂ Instruções de corte: Recorte as duas faces na linha de contorno dos cantos arredondados e dobre ou junte face a face antes da plastificação/laminação.
        </div>
      </div>
    </div>
  );
};

export default PortalCarteirinha;

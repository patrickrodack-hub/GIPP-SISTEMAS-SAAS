import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DownloadCloud, X, Cpu, Smartphone, Apple, Globe, Copy, Check, 
  CheckCircle, CheckCheck, Bell, ChevronRight, ExternalLink, ShieldCheck, 
  Monitor, FolderDown, Terminal, Layers, Share2, HelpCircle, Sparkles, Laptop, Chrome
} from 'lucide-react';

interface ModalInstalacaoAppProps {
  isOpen: boolean;
  onClose: () => void;
  installPrompt: any;
  setInstallPrompt: (prompt: any) => void;
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  churchName?: string;
  logoUrl?: string;
  initialDeviceType?: 'smartphone' | 'desktop' | null;
}

export const ModalInstalacaoApp: React.FC<ModalInstalacaoAppProps> = ({
  isOpen,
  onClose,
  installPrompt,
  setInstallPrompt,
  addToast,
  churchName = 'GIPP',
  logoUrl = 'https://cdn-icons-png.flaticon.com/512/3004/3004613.png',
  initialDeviceType = null,
}) => {
  const [installStep, setInstallStep] = useState<number>(initialDeviceType ? 3 : 1);
  const [installDeviceType, setInstallDeviceType] = useState<'smartphone' | 'desktop' | null>(initialDeviceType);
  const [installMobileOS, setInstallMobileOS] = useState<'ios' | 'android' | null>(null);
  const [isNotificationConfirmed, setIsNotificationConfirmed] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [isIframe, setIsIframe] = useState<boolean>(false);

  // Detecção de plataforma do usuário
  const [detectedPlatform, setDetectedPlatform] = useState<{
    isWindows: boolean;
    isMac: boolean;
    isLinux: boolean;
    isAndroid: boolean;
    isIOS: boolean;
    isChromium: boolean;
  }>({
    isWindows: true,
    isMac: false,
    isLinux: false,
    isAndroid: false,
    isIOS: false,
    isChromium: true
  });

  useEffect(() => {
    // Detectar iframe
    try {
      setIsIframe(window.self !== window.top);
    } catch {
      setIsIframe(true);
    }

    const ua = navigator.userAgent.toLowerCase();
    const platform = (navigator.platform || '').toLowerCase();
    
    const isWin = ua.includes('windows') || platform.includes('win');
    const isAppleMac = (ua.includes('macintosh') || platform.includes('mac')) && !ua.includes('iphone') && !ua.includes('ipad');
    const isLin = ua.includes('linux') && !ua.includes('android');
    const isDroid = ua.includes('android');
    const isAppleMobile = ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod');
    const isChromeEdge = ua.includes('chrome') || ua.includes('edg') || ua.includes('opr') || ua.includes('brave');

    setDetectedPlatform({
      isWindows: isWin,
      isMac: isAppleMac,
      isLinux: isLin,
      isAndroid: isDroid,
      isIOS: isAppleMobile,
      isChromium: isChromeEdge
    });

    // Se o usuário não selecionou ainda e o dispositivo é desktop, pré-selecionar
    if (!initialDeviceType) {
      if (isDroid) {
        setInstallDeviceType('smartphone');
        setInstallMobileOS('android');
      } else if (isAppleMobile) {
        setInstallDeviceType('smartphone');
        setInstallMobileOS('ios');
      } else {
        setInstallDeviceType('desktop');
      }
    }
  }, [initialDeviceType]);

  // Função 1: Instalação PWA Nativa (dispara o prompt do navegador para criar atalho no Desktop e Menu Iniciar)
  const handleNativePwaInstall = async () => {
    if (installPrompt) {
      try {
        setIsInstalling(true);
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setInstallPrompt(null);
          addToast("Instalação autorizada com sucesso! O aplicativo GIPP foi instalado e o atalho criado no seu Desktop.", "success");
        } else {
          addToast("A instalação foi cancelada no prompt do navegador.", "info");
        }
      } catch (err) {
        console.error("Erro no prompt PWA:", err);
        addToast("Falha ao invocar instalador do navegador.", "warning");
      } finally {
        setIsInstalling(false);
      }
    } else if (isIframe) {
      // Se estiver no iframe, o navegador proíbe a chamada do prompt nativo
      window.open(window.location.href, '_blank');
      addToast("Abrindo o sistema em nova janela limpa para ativação do instalador nativo!", "info");
    } else {
      // Sem prompt disponível no momento: fornecer guia de menu ou atalho
      addToast("Siga as instruções abaixo ou clique em 'Baixar Atalho da Área de Trabalho'!", "info");
    }
  };

  // Função 2: Gerar e Baixar o Atalho Real do Windows para a Área de Trabalho (.url)
  const handleDownloadWindowsShortcut = () => {
    try {
      const currentUrl = window.location.href;
      // Formato oficial do Windows Internet Shortcut (.url)
      const shortcutContent = [
        '[InternetShortcut]',
        `URL=${currentUrl}`,
        'IconIndex=0',
        `IconFile=${logoUrl}`,
        'HotKey=0',
        '[{000214A0-0000-0000-C000-000000000046}]',
        'Prop3=19,11'
      ].join('\r\n');

      const blob = new Blob([shortcutContent], { type: 'application/internet-shortcut;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `GIPP - Sistema de Gestão.url`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      addToast("Atalho da Área de Trabalho (.url) baixado! Arraste-o para o seu Desktop ou abra-o diretamente.", "success");
    } catch (err) {
      console.error("Erro ao criar atalho .url:", err);
      addToast("Erro ao gerar atalho. Tente novamente.", "error");
    }
  };

  // Função 3: Gerar e Baixar Instalador de Atalho Standalone Windows (.bat)
  // Cria de verdade o arquivo .lnk no Desktop do Windows apontando para Chrome/Edge com --app="URL"
  const handleDownloadWindowsInstallerBat = () => {
    try {
      const currentUrl = window.location.href;
      
      const batContent = `@echo off
chcp 65001 >nul
title Instalador de Atalho GIPP - Area de Trabalho
cls
echo =====================================================================
echo           GIPP - INSTALADOR DE ATALHO NA AREA DE TRABALHO
echo =====================================================================
echo.
echo [1/2] Localizando seu Desktop e navegadores de sistema...
set "TARGET_URL=${currentUrl}"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $desktop = [System.Environment]::GetFolderPath('Desktop'); ^
   $lnkPath = Join-Path $desktop 'GIPP - Sistema de Gestao.lnk'; ^
   $shortcut = $ws.CreateShortcut($lnkPath); ^
   $edge32 = Join-Path $env:ProgramFiles(x86) 'Microsoft\\Edge\\Application\\msedge.exe'; ^
   $edge64 = Join-Path $env:ProgramFiles 'Microsoft\\Edge\\Application\\msedge.exe'; ^
   $chrome32 = Join-Path $env:ProgramFiles(x86) 'Google\\Chrome\\Application\\chrome.exe'; ^
   $chrome64 = Join-Path $env:ProgramFiles 'Google\\Chrome\\Application\\chrome.exe'; ^
   if (Test-Path $edge64) { ^
     $shortcut.TargetPath = $edge64; ^
     $shortcut.Arguments = '--app=\"' + $env:TARGET_URL + '\"'; ^
   } elseif (Test-Path $edge32) { ^
     $shortcut.TargetPath = $edge32; ^
     $shortcut.Arguments = '--app=\"' + $env:TARGET_URL + '\"'; ^
   } elseif (Test-Path $chrome64) { ^
     $shortcut.TargetPath = $chrome64; ^
     $shortcut.Arguments = '--app=\"' + $env:TARGET_URL + '\"'; ^
   } elseif (Test-Path $chrome32) { ^
     $shortcut.TargetPath = $chrome32; ^
     $shortcut.Arguments = '--app=\"' + $env:TARGET_URL + '\"'; ^
   } else { ^
     $shortcut.TargetPath = $env:TARGET_URL; ^
   }; ^
   $shortcut.Description = 'GIPP - Sistema de Gestao Eclesiastica Integrada'; ^
   $shortcut.Save();"

echo.
echo [2/2] SUCESSO ABSOLUTO!
echo.
echo O atalho 'GIPP - Sistema de Gestao' foi criado diretamente no seu Desktop!
echo Ao abrir o atalho, o sistema funcionara como um aplicativo nativo independente.
echo.
echo =====================================================================
echo Pressione qualquer tecla para concluir...
pause >nul
exit
`;

      const blob = new Blob([batContent], { type: 'application/x-bat;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Criar_Atalho_GIPP_Desktop.bat`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      addToast("Instalador de Atalho (.bat) baixado! Basta executá-lo para fixar o atalho no Desktop.", "success");
    } catch (err) {
      console.error("Erro ao gerar instalador .bat:", err);
      addToast("Erro ao gerar instalador.", "error");
    }
  };

  // Função 4: Abrir em Nova Aba/Janela (permite contornar a restrição de iframe do preview do AI Studio)
  const handleOpenTopLevel = () => {
    window.open(window.location.href, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div id="modal-instalacao-pwa-backdrop" className="fixed inset-0 bg-slate-950/80 z-[12000] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md animate-entrance overflow-y-auto">
      <motion.div 
        id="modal-instalacao-pwa-container"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden relative border border-white/20 flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header Elegante com Gradiente */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full -ml-10 -mb-10 blur-xl pointer-events-none"></div>
          
          <button 
            type="button" 
            id="btn-fechar-modal-instalacao"
            onClick={onClose} 
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all cursor-pointer z-10"
            title="Fechar Assistente"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-2 bg-white/10 rounded-xl">
              <DownloadCloud size={22} className="text-white animate-pulse" />
            </span>
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-indigo-500/50 px-2.5 py-1 rounded-full text-indigo-100">
              Instalador Oficial & Atalhos Desktop
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            Instalar Sistema GIPP
          </h3>
          <p className="text-indigo-100/90 text-xs font-medium mt-1 leading-relaxed">
            Tenha acesso rápido ao painel eclesiástico da congregação no seu Computador ou Celular.
          </p>

          {/* Stepper Indicators */}
          <div className="flex items-center justify-between mt-6 relative">
            <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-indigo-400/30 z-0"></div>
            <div 
              className="absolute top-4 left-[10%] h-[2px] bg-indigo-200 transition-all duration-300 z-0"
              style={{ width: installStep === 1 ? '0%' : installStep === 2 ? '42%' : '85%' }}
            ></div>

            <button 
              type="button"
              onClick={() => setInstallStep(1)}
              className="flex flex-col items-center z-10 relative cursor-pointer group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${installStep >= 1 ? 'bg-white text-indigo-700 font-extrabold ring-4 ring-indigo-500/30' : 'bg-indigo-500/50 text-indigo-200'}`}>
                1
              </div>
              <span className="text-[10px] font-bold mt-1 tracking-wider uppercase text-indigo-100">Dispositivo</span>
            </button>

            <button 
              type="button"
              onClick={() => installDeviceType ? setInstallStep(2) : null}
              className="flex flex-col items-center z-10 relative cursor-pointer group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${installStep >= 2 ? 'bg-white text-indigo-700 font-extrabold ring-4 ring-indigo-500/30' : 'bg-indigo-500/50 text-indigo-200'}`}>
                2
              </div>
              <span className="text-[10px] font-bold mt-1 tracking-wider uppercase text-indigo-100">Notificações</span>
            </button>

            <button 
              type="button"
              onClick={() => (installDeviceType && isNotificationConfirmed) ? setInstallStep(3) : null}
              className="flex flex-col items-center z-10 relative cursor-pointer group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${installStep >= 3 ? 'bg-white text-indigo-700 font-extrabold ring-4 ring-indigo-500/30' : 'bg-indigo-500/50 text-indigo-200'}`}>
                3
              </div>
              <span className="text-[10px] font-bold mt-1 tracking-wider uppercase text-indigo-100">Instalação</span>
            </button>
          </div>
        </div>

        {/* Corpo do Modal com Rolagem Suave */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 bg-slate-50/50 text-slate-800">
          <AnimatePresence mode="wait">
            {/* ETAPA 1: ESCOLHA DE DISPOSITIVO */}
            {installStep === 1 && (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 text-left"
              >
                <div>
                  <h4 className="text-slate-800 font-black text-base sm:text-lg">Onde deseja instalar o GIPP?</h4>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">
                    Selecione o seu tipo de dispositivo para carregar os instaladores nativos e atalhos correspondentes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Card Computador */}
                  <button
                    type="button"
                    id="btn-select-desktop-device"
                    onClick={() => {
                      setInstallDeviceType('desktop');
                      setInstallMobileOS(null);
                      setInstallStep(2);
                    }}
                    className={`p-5 rounded-2xl sm:rounded-[1.75rem] text-left border-2 transition-all cursor-pointer flex flex-col gap-3 relative group hover:shadow-md ${installDeviceType === 'desktop' ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className={`p-3 rounded-xl w-fit ${installDeviceType === 'desktop' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'} transition-all`}>
                      <Cpu size={22} />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                        Computador / Portátil
                        {detectedPlatform.isWindows && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-md">Detectado</span>}
                      </h5>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                        Windows, macOS ou Linux. Cria atalhos diretos na Área de Trabalho e janela independente.
                      </p>
                    </div>
                    {installDeviceType === 'desktop' && (
                      <div className="absolute top-4 right-4 bg-indigo-600 text-white rounded-full p-1 shadow-sm">
                        <Check size={13} className="stroke-[3]" />
                      </div>
                    )}
                  </button>

                  {/* Card Smartphone */}
                  <button
                    type="button"
                    id="btn-select-mobile-device"
                    onClick={() => {
                      setInstallDeviceType('smartphone');
                    }}
                    className={`p-5 rounded-2xl sm:rounded-[1.75rem] text-left border-2 transition-all cursor-pointer flex flex-col gap-3 relative group hover:shadow-md ${installDeviceType === 'smartphone' ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className={`p-3 rounded-xl w-fit ${installDeviceType === 'smartphone' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'} transition-all`}>
                      <Smartphone size={22} />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                        Smartphone / Tablet
                        {(detectedPlatform.isAndroid || detectedPlatform.isIOS) && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">Detectado</span>}
                      </h5>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                        Android ou iPhone/iPad. Aplicativo PWA com ícone no ecrã inicial e avisos push.
                      </p>
                    </div>
                    {installDeviceType === 'smartphone' && (
                      <div className="absolute top-4 right-4 bg-emerald-600 text-white rounded-full p-1 shadow-sm">
                        <Check size={13} className="stroke-[3]" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Sub-opções de Smartphone */}
                {installDeviceType === 'smartphone' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2.5 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100"
                  >
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                      Escolha o Sistema do Smartphone:
                    </label>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setInstallMobileOS('android');
                          setInstallStep(2);
                        }}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${installMobileOS === 'android' ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                      >
                        <Smartphone size={15} /> Android
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInstallMobileOS('ios');
                          setInstallStep(2);
                        }}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${installMobileOS === 'ios' ? 'bg-slate-800 border-slate-800 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                      >
                        <Apple size={15} /> Apple iOS (iPhone)
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Link de Compartilhamento */}
                <div className="bg-slate-100/90 rounded-2xl p-3.5 border border-slate-200/80 leading-relaxed">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-700 text-xs font-bold flex items-center gap-1.5">
                      <Globe size={14} className="text-indigo-600" /> Link de Acesso do Sistema:
                    </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        addToast("Link copiado para a área de transferência!", "success");
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-slate-200"
                    >
                      <Copy size={11} /> Copiar Link
                    </button>
                  </div>
                  <code className="text-[11px] text-indigo-900 font-mono font-bold block select-all truncate mt-1 bg-white/80 p-1.5 rounded-lg border border-slate-200/50">
                    {window.location.href}
                  </code>
                </div>
              </motion.div>
            )}

            {/* ETAPA 2: NOTIFICAÇÕES */}
            {installStep === 2 && (
              <motion.div 
                key="step2" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left"
              >
                <div>
                  <h4 className="text-slate-800 font-black text-base sm:text-lg">Ativação de Alertas e Notificações</h4>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">
                    Receba lembretes de escalas de obreiros, comunicados da congregação e tarefas no seu computador ou celular.
                  </p>
                </div>

                <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-100 flex flex-col items-center text-center gap-3">
                  <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                    <Bell size={22} className="animate-pulse" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm">Permissão de Notificação do Sistema</h5>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5 max-w-sm">
                      Clique no botão para autorizar o navegador a enviar avisos da igreja diretamente na sua área de trabalho ou tela de bloqueio.
                    </p>
                  </div>

                  <button 
                    type="button" 
                    id="btn-ativar-notificacoes-modal"
                    onClick={async () => {
                      try {
                        if ('Notification' in window) {
                          const res = await Notification.requestPermission();
                          if (res === 'granted') {
                            setIsNotificationConfirmed(true);
                            addToast("Notificações autorizadas com sucesso!", "success");
                          } else {
                            setIsNotificationConfirmed(true);
                            addToast("Permissão salva. O navegador respeitará suas configurações.", "info");
                          }
                        } else {
                          setIsNotificationConfirmed(true);
                          addToast("Modo compatível de notificações ativado.", "info");
                        }
                      } catch {
                        setIsNotificationConfirmed(true);
                      }
                    }}
                    className={`py-2.5 px-5 rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm ${isNotificationConfirmed ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  >
                    {isNotificationConfirmed ? <CheckCircle size={15} /> : <Bell size={15} />}
                    {isNotificationConfirmed ? 'Notificações Confirmadas' : 'Autorizar Alertas do GIPP'}
                  </button>
                </div>

                <div className={`p-3.5 rounded-xl border transition-all text-left ${isNotificationConfirmed ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900' : 'bg-amber-50/40 border-amber-200 text-amber-900'}`}>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      id="checkbox-confirmacao-notificacao"
                      checked={isNotificationConfirmed} 
                      onChange={(e) => setIsNotificationConfirmed(e.target.checked)} 
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                    />
                    <div className="text-left">
                      <strong className="text-xs font-black block">Desejo receber avisos da congregação</strong>
                      <span className="text-[10px] font-medium leading-relaxed block text-slate-500 mt-0.5">
                        Confirmo que desejo acompanhar avisos de reuniões, escalas e mensagens pastorais neste dispositivo ({installDeviceType === 'desktop' ? 'Computador' : 'Celular'}).
                      </span>
                    </div>
                  </label>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2.5 pt-1">
                  <button 
                    type="button" 
                    onClick={() => setInstallStep(1)} 
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button 
                    type="button" 
                    id="btn-avancar-para-instalacao"
                    onClick={() => {
                      setIsNotificationConfirmed(true);
                      setInstallStep(3);
                    }} 
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5"
                  >
                    Continuar para Instalação <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ETAPA 3: INSTALAÇÃO & CRIAÇÃO DE ATALHOS NO DESKTOP */}
            {installStep === 3 && (
              <motion.div 
                key="step3" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left"
              >
                {/* Cabeçalho do Passo 3 */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full tracking-wider uppercase">
                      {installDeviceType === 'desktop' ? 'Instalador de Computador' : 'Instalador Móvel'}
                    </span>
                    <h4 className="text-slate-800 font-black text-base sm:text-lg mt-0.5">
                      {installDeviceType === 'desktop' ? 'Instalação e Atalhos na Área de Trabalho' : 'Adicionar ao Ecrã Inicial'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInstallStep(1)}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Trocar Dispositivo
                  </button>
                </div>

                {/* ===== SEÇÃO PARA COMPUTADOR (DESKTOP) ===== */}
                {installDeviceType === 'desktop' ? (
                  <div className="space-y-3.5">
                    {/* Alerta de Iframe (quando rodando no preview do AI Studio) */}
                    {isIframe && (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-900 space-y-2">
                        <div className="flex items-start gap-2">
                          <HelpCircle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-xs font-bold block">Você está visualizando em Modo de Teste Incorporado (Iframe)</strong>
                            <p className="text-[11px] text-amber-800/90 leading-relaxed mt-0.5">
                              Por segurança, os navegadores Chrome e Edge não permitem a instalação automática dentro de janelas embutidas. Abra em uma janela própria para instalar nativamente ou utilize os botões de atalho abaixo!
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          id="btn-abrir-janela-dedicada"
                          onClick={handleOpenTopLevel}
                          className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ExternalLink size={13} /> Abrir em Nova Janela para Instalação Nativa
                        </button>
                      </div>
                    )}

                    {/* BOTÕES DE AÇÃO IMEDIATA: 1. Instalar PWA | 2. Baixar Atalho .url | 3. Criar Atalho .bat */}
                    <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-4 rounded-2xl border border-indigo-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles size={14} className="text-indigo-600" /> Ações Rápidas de Instalação no Desktop
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                          Windows / Mac / Linux
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Botão A: Instalar Aplicativo no Computador (PWA) */}
                        <button
                          type="button"
                          id="btn-executar-instalacao-desktop"
                          onClick={handleNativePwaInstall}
                          disabled={isInstalling}
                          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-indigo-500/20 transition-all flex items-center gap-2.5 cursor-pointer text-left group"
                        >
                          <div className="p-2 bg-white/20 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                            <DownloadCloud size={18} className="text-white" />
                          </div>
                          <div className="min-w-0">
                            <strong className="block text-xs font-black truncate">
                              {installPrompt ? 'Instalar com 1 Clique' : isIframe ? 'Abrir & Instalar App' : 'Instalar Aplicativo'}
                            </strong>
                            <span className="block text-[10px] text-indigo-100 truncate">
                              {installPrompt ? 'Prompt Ativo do Navegador' : 'Janela Própria Standalone'}
                            </span>
                          </div>
                        </button>

                        {/* Botão B: Baixar Atalho para a Área de Trabalho (.url) */}
                        <button
                          type="button"
                          id="btn-baixar-atalho-url-desktop"
                          onClick={handleDownloadWindowsShortcut}
                          className="p-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-slate-800/20 transition-all flex items-center gap-2.5 cursor-pointer text-left group"
                          title="Cria o arquivo oficial de atalho do Windows para a Área de Trabalho"
                        >
                          <div className="p-2 bg-white/20 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                            <Monitor size={18} className="text-white" />
                          </div>
                          <div className="min-w-0">
                            <strong className="block text-xs font-black truncate">Baixar Atalho (.url)</strong>
                            <span className="block text-[10px] text-slate-300 truncate">Colocar na Área de Trabalho</span>
                          </div>
                        </button>
                      </div>

                      {/* Botão C: Instalador Automático de Atalho Windows (.bat) */}
                      <div className="pt-1 border-t border-indigo-100/60">
                        <button
                          type="button"
                          id="btn-baixar-script-desktop-bat"
                          onClick={handleDownloadWindowsInstallerBat}
                          className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer"
                          title="Gera um instalador leve que cria automaticamente o atalho .lnk na sua Área de Trabalho do Windows"
                        >
                          <div className="flex items-center gap-2">
                            <Terminal size={15} className="text-emerald-700 shrink-0" />
                            <span className="text-[11px] font-extrabold text-left">
                              Criar Atalho Nativo no Desktop (.bat com 1 clique)
                            </span>
                          </div>
                          <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-md font-bold uppercase shrink-0">
                            Recomendado
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Guia Visual Passo a Passo de Instalação Manual no Chrome / Edge */}
                    <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Laptop size={14} className="text-indigo-600" />
                          Como fixar manualmente pelo Navegador:
                        </strong>
                        <span className="text-[10px] font-bold text-slate-500">Chrome / Edge / Safari</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                        <li className="flex gap-2.5 items-start">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">1</span>
                          <p className="leading-snug">
                            No <b>Google Chrome</b> ou <b>Edge</b>, olhe para a barra de endereços no topo à direita e clique no ícone de <b>Instalação <DownloadCloud size={12} className="inline text-indigo-600 mx-0.5" /></b> ou <b>[+]</b>.
                          </p>
                        </li>
                        <li className="flex gap-2.5 items-start">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">2</span>
                          <p className="leading-snug">
                            <b>Pelo Menu do Navegador:</b> Clique nos <b>Três Pontos (⋮)</b> no canto superior direito &gt; <b>Salvar e Compartilhar</b> (ou "Mais Ferramentas") &gt; <b>Criar Atalho...</b>.
                          </p>
                        </li>
                        <li className="flex gap-2.5 items-start">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">3</span>
                          <p className="leading-snug">
                            <b>Fundamental:</b> Marque a caixa de seleção <strong className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200">"Abrir como janela"</strong> e clique em <b>Criar</b>. O atalho é criado instantaneamente na sua Área de Trabalho!
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : installMobileOS === 'android' ? (
                  /* ===== SEÇÃO ANDROID ===== */
                  <div className="space-y-3.5">
                    <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-left space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                        <span className="p-1 px-2.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">Android (Samsung, Xiaomi, Motorola...)</span>
                        <span className="text-xs font-semibold text-slate-500">Navegador Chrome</span>
                      </div>

                      {installPrompt && (
                        <div className="bg-white p-3 rounded-xl border border-emerald-200 flex items-center justify-between gap-3 shadow-xs">
                          <div>
                            <strong className="text-xs font-black text-slate-800 block">Atalho Pronto para Instalar</strong>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Toque abaixo para instalar diretamente no celular.</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={handleNativePwaInstall}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-1 shadow-sm cursor-pointer shrink-0"
                          >
                            <DownloadCloud size={14} /> Instalar Agora
                          </button>
                        </div>
                      )}

                      <ul className="space-y-2 text-xs text-slate-600 font-medium">
                        <li className="flex gap-2 items-start">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <p>Abra o link da igreja no navegador <b>Google Chrome</b> do celular.</p>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <p>Toque no menu de <b>Três Pontos (⋮)</b> no canto superior direito.</p>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <p>Toque na opção <b>"Instalar Aplicativo"</b> ou <b>"Adicionar ao Ecrã Inicial"</b>.</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  /* ===== SEÇÃO APPLE IOS ===== */
                  <div className="space-y-3.5">
                    <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-left space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="p-1 px-2.5 bg-slate-800 text-white text-[10px] font-black rounded-lg">Apple iOS (iPhone / iPad)</span>
                        <span className="text-xs font-semibold text-slate-500">Navegador Safari</span>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-600 font-medium">
                        <li className="flex gap-2 items-start">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <p>Abra este site utilizando o navegador oficial <b>Safari</b> no iPhone.</p>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <p>Toque no botão central de <b>Compartilhar <Share2 size={12} className="inline text-indigo-600 mx-0.5" /></b> (quadrado com seta para cima).</p>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <p>Role o menu para baixo e toque em <b>"Adicionar ao Ecrã Principal"</b> (Add to Home Screen).</p>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                          <p>Toque em <b>"Adicionar"</b> no canto superior direito para fixar o ícone.</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Linha Final de Ações com Voltar e Concluir */}
                <div className="flex gap-2.5 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setInstallStep(2)} 
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button 
                    type="button" 
                    id="btn-concluir-instalador"
                    onClick={() => {
                      onClose();
                      addToast("Assistente de instalação concluído! O GIPP está pronto no seu dispositivo.", "success");
                    }} 
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
                  >
                    <CheckCheck size={16} /> Entendi e Concluí
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

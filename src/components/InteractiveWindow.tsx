import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Move, Save, ArrowUpDown, Command } from 'lucide-react';

interface InteractiveWindowProps {
  id: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  icon?: React.ComponentType<any>;
  headerBg?: string; // CSS class for background gradient (e.g., from-indigo-600 via-blue-600 to-indigo-800)
  defaultWidth?: number;
  defaultHeight?: number;
  footer?: React.ReactNode;
  iconColor?: string;
  saveLabel?: string;
  onSave?: () => void;
  isSaving?: boolean;
}

export const InteractiveWindow: React.FC<InteractiveWindowProps> = ({
  id,
  title,
  subtitle,
  onClose,
  children,
  icon: IconComponent,
  headerBg = 'from-slate-700 via-slate-800 to-slate-900',
  defaultWidth = 670,
  defaultHeight = 650,
  footer,
  iconColor = 'text-white',
  saveLabel = 'Salvar Dados',
  onSave,
  isSaving = false,
}) => {
  // Compute best default size depending on screen space
  const initialWidth = Math.min(defaultWidth, typeof window !== 'undefined' ? window.innerWidth - 24 : defaultWidth);
  const initialHeight = Math.min(defaultHeight, typeof window !== 'undefined' ? window.innerHeight * 0.85 : defaultHeight);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const posRef = useRef(position);
  const sizeRef = useRef(size);

  useEffect(() => {
    posRef.current = position;
  }, [position]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  // Load configuration or center window
  useEffect(() => {
    const saved = localStorage.getItem(`window_config_${id}`);
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 768;

    let targetWidth = initialWidth;
    let targetHeight = initialHeight;
    let targetX = (screenW - targetWidth) / 2;
    let targetY = (screenH - targetHeight) / 2;

    if (saved) {
      try {
        const config = JSON.parse(saved);
        targetWidth = Math.max(300, Math.min(config.width, screenW - 16));
        targetHeight = Math.max(200, Math.min(config.height, screenH - 16));
        
        // Recover user's saved positioning coordinate if available
        if (typeof config.x === 'number' && typeof config.y === 'number') {
          targetX = config.x;
          targetY = config.y;
        }
      } catch (e) {
        console.error('Error loading window config:', e);
      }
    }

    // Always clamp to screen boundaries to keep window fully visible and styled
    targetX = Math.max(8, Math.min(targetX, Math.max(8, screenW - targetWidth - 8)));
    targetY = Math.max(8, Math.min(targetY, Math.max(8, screenH - targetHeight - 8)));

    setPosition({ x: targetX, y: targetY });
    setSize({ width: targetWidth, height: targetHeight });
    setIsInitialized(true);
  }, [id, initialWidth, initialHeight]);

  // Listen to window size changes and dynamically clamp boundaries to prevent clipping
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (isFullscreen) return;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      setSize(prev => {
        const w = Math.max(300, Math.min(prev.width, screenW - 16));
        const h = Math.max(200, Math.min(prev.height, screenH - 16));
        return { width: w, height: h };
      });

      setPosition(prev => {
        const x = Math.max(8, Math.min(prev.x, Math.max(8, screenW - 50)));
        const y = Math.max(8, Math.min(prev.y, Math.max(8, screenH - 40)));
        return { x, y };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  const saveConfig = (x: number, y: number, w: number, h: number) => {
    const config = { x, y, width: w, height: h };
    localStorage.setItem(`window_config_${id}`, JSON.stringify(config));
  };

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isFullscreen) return;
    if ('button' in e && e.button !== 0) return;

    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select') || target.closest('textarea')) {
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const startX = clientX - posRef.current.x;
    const startY = clientY - posRef.current.y;

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const curX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const curY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      // Expanded motion area limits: allow full freedom across the viewport, leaving at least 50px of header visible
      const newX = Math.max(-sizeRef.current.width + 50, Math.min(curX - startX, window.innerWidth - 50));
      const newY = Math.max(0, Math.min(curY - startY, window.innerHeight - 40));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);

      saveConfig(posRef.current.x, posRef.current.y, sizeRef.current.width, sizeRef.current.height);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
  };

  const handleResizeMouseDown = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    direction: 'r' | 'b' | 'br'
  ) => {
    if (isFullscreen) return;
    if ('button' in e && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const startWidth = sizeRef.current.width;
    const startHeight = sizeRef.current.height;
    const startClientX = clientX;
    const startClientY = clientY;

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const curX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const curY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = curX - startClientX;
      const deltaY = curY - startClientY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction === 'r' || direction === 'br') {
        newWidth = Math.max(320, Math.min(startWidth + deltaX, window.innerWidth - posRef.current.x - 8));
      }
      if (direction === 'b' || direction === 'br') {
        newHeight = Math.max(220, Math.min(startHeight + deltaY, window.innerHeight - posRef.current.y - 8));
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);

      saveConfig(posRef.current.x, posRef.current.y, sizeRef.current.width, sizeRef.current.height);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Reset parameters to centered defaults
  const resetWindow = () => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const w = Math.min(defaultWidth, screenW - 24);
    const h = Math.min(defaultHeight, screenH * 0.85);
    const x = (screenW - w) / 2;
    const y = (screenH - h) / 2;
    setPosition({ x, y });
    setSize({ width: w, height: h });
    setIsFullscreen(false);
    saveConfig(x, y, w, h);
  };

  if (!isInitialized) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const currentStyle: React.CSSProperties = isFullscreen
    ? {
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
      }
    : isMobile
    ? {
        position: 'fixed',
        left: '12px',
        right: '12px',
        top: '12px',
        bottom: '12px',
        width: 'calc(100% - 24px)',
        height: 'calc(100% - 24px)',
      }
    : {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden no-print">
      {/* Background/Backdrop sibling with click to close & blur effects (doesn't restrict fixed siblings) */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-0 interactive-window-backdrop" 
        onClick={onClose}
      />

      {/* Main draggable resizable window container */}
      <div
        style={currentStyle}
        className={`bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/40 border border-slate-250 z-10 transition-shadow interactive-window-main ${
          isFullscreen ? 'rounded-none' : 'hover:shadow-indigo-500/10'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Drag Zone */}
        <div
          onMouseDown={isMobile ? undefined : handleHeaderMouseDown}
          onTouchStart={isMobile ? undefined : handleHeaderMouseDown}
          className={`px-6 py-4 flex justify-between items-center shrink-0 border-b border-white/20 select-none relative z-10 interactive-window-header ${isMobile ? '' : 'cursor-move hover:brightness-105 active:scale-[0.995] transition-all'}`}
        >
          {/* Header Gradients and Styling */}
          <div className={`absolute inset-0 bg-gradient-to-br ${headerBg} bg-[length:200%_200%] animate-pulse-glow -z-10 interactive-window-header-bg`}></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.12] mix-blend-overlay pointer-events-none interactive-window-header-pattern"></div>

          <div className="relative z-10 flex items-center gap-4 flex-1 min-w-0 pr-4">
            {IconComponent && (
              <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl border border-white/30 flex items-center justify-center text-white shrink-0 group relative shadow-inner interactive-window-icon-container">
                <IconComponent size={24} className={`${iconColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] interactive-window-icon`} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {subtitle && (
                <p className="text-[9px] font-black text-white/80 uppercase tracking-[0.3em] mb-1 truncate interactive-window-subtitle">
                  {subtitle}
                </p>
              )}
              <h3 className="font-extrabold text-lg tracking-tight leading-none drop-shadow-2xl font-['Outfit'] truncate text-white interactive-window-title">
                {title}
              </h3>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-1.5 shrink-0 interactive-window-controls">
            {/* Quick Helper to Reset Position */}
            {!isMobile && (
              <button
                onClick={resetWindow}
                title="Centralizar Janela"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-1.5 rounded-lg text-white/80 hover:text-white transition-all cursor-pointer interactive-window-btn interactive-window-btn-reset"
              >
                <Command size={14} className="animate-pulse" />
              </button>
            )}

            {/* Minimize / Maximize */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Restaurar Janela' : 'Maximizar'}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-1.5 rounded-lg text-white/80 hover:text-white transition-all cursor-pointer interactive-window-btn interactive-window-btn-resize"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              title="Fechar"
              className="bg-white/10 hover:bg-rose-600 backdrop-blur-md p-1.5 rounded-lg text-white/80 hover:text-white transition-all cursor-pointer interactive-window-btn interactive-window-btn-close"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/70 sm:p-8 interactive-window-content">
          {children}
        </div>

        {/* Footer Area */}
        {footer ? (
          <div className="p-4 sm:p-6 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0 interactive-window-footer">
            {footer}
          </div>
        ) : onSave ? (
          <div className="p-4 sm:p-6 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0 interactive-window-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 hover:bg-slate-100 border border-slate-250 rounded-xl text-slate-600 text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 interactive-window-btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 interactive-window-btn-save"
            >
              Salvar Dados
            </button>
          </div>
        ) : null}

        {/* Resize Handles - Hide if Fullscreen */}
        {!isFullscreen && (
          <>
            {/* Right handle */}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'r')}
              onTouchStart={(e) => handleResizeMouseDown(e, 'r')}
              className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-indigo-500/10 active:bg-indigo-500/20 z-20"
            />
            {/* Bottom handle */}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'b')}
              onTouchStart={(e) => handleResizeMouseDown(e, 'b')}
              className="absolute left-0 bottom-0 w-full h-2 cursor-ns-resize hover:bg-indigo-500/10 active:bg-indigo-500/20 z-20"
            />
            {/* Bottom-right diagonal handle */}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'br')}
              onTouchStart={(e) => handleResizeMouseDown(e, 'br')}
              className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 pointer-events-auto z-35 group"
            >
              <div className="w-2.5 h-2.5 border-r border-b border-indigo-400 group-hover:border-indigo-600 group-active:border-indigo-800 transition-colors mr-0.5 mb-0.5 rounded-br-xs" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

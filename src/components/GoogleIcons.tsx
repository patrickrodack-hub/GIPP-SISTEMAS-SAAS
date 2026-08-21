import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * Logotipo oficial do Google (4 Cores: Azul, Vermelho, Amarelo, Verde)
 */
export const GoogleGLogo: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <path 
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
      fill="#4285F4" 
    />
    <path 
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
      fill="#34A853" 
    />
    <path 
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" 
      fill="#FBBC05" 
    />
    <path 
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" 
      fill="#EA4335" 
    />
  </svg>
);

/**
 * Ícone Oficial do Google Meet (Câmera com 4 cores do Google Workspace)
 */
export const GoogleMeetIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <path d="M4 14C4 10.6863 6.68629 8 10 8H26C29.3137 8 32 10.6863 32 14V34C32 37.3137 29.3137 40 26 40H10C6.68629 40 4 37.3137 4 34V14Z" fill="#00832D"/>
    <path d="M32 19L41.36 12.76C42.72 11.85 44 12.82 44 14.45V33.55C44 35.18 42.72 36.15 41.36 35.24L32 29V19Z" fill="#00AA47"/>
    <path d="M4 14C4 10.6863 6.68629 8 10 8H26C29.3137 8 32 10.6863 32 14V22H4V14Z" fill="#2684FC"/>
    <path d="M4 22H32V34C32 37.3137 29.3137 40 26 40H10C6.68629 40 4 37.3137 4 34V22Z" fill="#0066DA"/>
    <path d="M4 30H32V34C32 37.3137 29.3137 40 26 40H10C6.68629 40 4 37.3137 4 34V30Z" fill="#00AC47"/>
    <path d="M4 14C4 10.6863 6.68629 8 10 8H18V22H4V14Z" fill="#FFBA00"/>
    <path d="M4 22H18V30H4V22Z" fill="#EA4335"/>
  </svg>
);

/**
 * Ícone Oficial do Google Sheets (Planilhas - Verde oficial com tabela)
 */
export const GoogleSheetsIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <path d="M30 4H12C9.79 4 8 5.79 8 8V40C8 42.21 9.79 44 12 44H36C38.21 44 40 42.21 40 40V14L30 4Z" fill="#0F9D58"/>
    <path d="M30 4L40 14H30V4Z" fill="#87CEAC"/>
    {/* Grid interior da planilha */}
    <rect x="15" y="19" width="18" height="17" rx="1.5" fill="white"/>
    <rect x="16.5" y="20.5" width="7" height="6.5" fill="#0F9D58" fillOpacity="0.85"/>
    <rect x="24.5" y="20.5" width="7" height="6.5" fill="#0F9D58" fillOpacity="0.85"/>
    <rect x="16.5" y="28" width="7" height="6.5" fill="#0F9D58" fillOpacity="0.85"/>
    <rect x="24.5" y="28" width="7" height="6.5" fill="#0F9D58" fillOpacity="0.85"/>
  </svg>
);

/**
 * Ícone Oficial do Google Docs (Documentos - Azul oficial com linhas)
 */
export const GoogleDocsIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <path d="M30 4H12C9.79 4 8 5.79 8 8V40C8 42.21 9.79 44 12 44H36C38.21 44 40 42.21 40 40V14L30 4Z" fill="#4285F4"/>
    <path d="M30 4L40 14H30V4Z" fill="#A1C8FC"/>
    {/* Linhas de texto brancas */}
    <rect x="15" y="20" width="18" height="3" rx="1.5" fill="white"/>
    <rect x="15" y="26" width="18" height="3" rx="1.5" fill="white"/>
    <rect x="15" y="32" width="11" height="3" rx="1.5" fill="white"/>
  </svg>
);

/**
 * Ícone Oficial do Google Tasks (Tarefas - Círculo azul com checkmark estilizado)
 */
export const GoogleTasksIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <circle cx="24" cy="24" r="20" fill="#1A73E8"/>
    <path d="M16 24.5L21.5 30L32.5 18" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="33" cy="15" r="3.5" fill="#FBBC04"/>
  </svg>
);

/**
 * Ícone Oficial do Google Calendar (Agenda - 31 com topo azul)
 */
export const GoogleCalendarIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect x="6" y="8" width="36" height="34" rx="4" fill="white" stroke="#E0E0E0" strokeWidth="1.5"/>
    <path d="M6 12C6 9.79086 7.79086 8 10 8H38C40.2091 8 42 9.79086 42 12V18H6V12Z" fill="#1A73E8"/>
    <circle cx="15" cy="8" r="2" fill="#EA4335"/>
    <circle cx="33" cy="8" r="2" fill="#EA4335"/>
    <text x="24" y="34" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#1A73E8" textAnchor="middle">31</text>
    <rect x="36" y="36" width="6" height="6" fill="#34A853" rx="1"/>
    <rect x="6" y="36" width="6" height="6" fill="#FBBC05" rx="1"/>
  </svg>
);

/**
 * Ícone Oficial do Gmail (Multi-cor Envelope / M oficial do Workspace)
 */
export const GoogleGmailIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <path d="M6 14C6 11.79 7.79 10 10 10H14V26L6 20V14Z" fill="#EA4335"/>
    <path d="M42 14C42 11.79 40.21 10 38 10H34V26L42 20V14Z" fill="#4285F4"/>
    <path d="M34 10L24 18L14 10H10C7.79 10 6 11.79 6 14V16L24 29.5L42 16V14C42 11.79 40.21 10 38 10H34Z" fill="#EA4335"/>
    <path d="M14 26V38H10C7.79 38 6 36.21 6 34V20L14 26Z" fill="#FBBC05"/>
    <path d="M34 26V38H38C40.21 38 42 36.21 42 34V20L34 26Z" fill="#34A853"/>
    <path d="M14 26L24 33.5L34 26V38H14V26Z" fill="#C5221F"/>
  </svg>
);

/**
 * Ícone Oficial do Google Forms (Formulários - Roxo oficial com checklist)
 */
export const GoogleFormsIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <path d="M30 4H12C9.79 4 8 5.79 8 8V40C8 42.21 9.79 44 12 44H36C38.21 44 40 42.21 40 40V14L30 4Z" fill="#7248B9"/>
    <path d="M30 4L40 14H30V4Z" fill="#B39DDB"/>
    {/* Formulário com checkboxes e linhas */}
    <circle cx="15" cy="22" r="2" fill="white"/>
    <rect x="19" y="21" width="14" height="2" rx="1" fill="white"/>
    <circle cx="15" cy="28" r="2" fill="white"/>
    <rect x="19" y="27" width="14" height="2" rx="1" fill="white"/>
    <circle cx="15" cy="34" r="2" fill="white"/>
    <rect x="19" y="33" width="10" height="2" rx="1" fill="white"/>
  </svg>
);

/**
 * Ícone Oficial do Google Classroom (Google Sala de Aula / Turmas)
 */
export const GoogleClassroomIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    {/* Moldura amarela clássica do Google Classroom */}
    <rect x="4" y="6" width="40" height="36" rx="6" fill="#F4B400"/>
    {/* Quadro-negro verde */}
    <rect x="8" y="10" width="32" height="28" rx="3" fill="#0F9D58"/>
    {/* Figura central do professor (Branco) */}
    <circle cx="24" cy="20" r="4" fill="white"/>
    <path d="M18 31C18 28.5 20.5 26.5 24 26.5C27.5 26.5 30 28.5 30 31H18Z" fill="white"/>
    {/* Alunos ao lado (Branco com opacidade) */}
    <circle cx="15" cy="22" r="2.8" fill="white" fillOpacity="0.8"/>
    <path d="M10.5 31C10.5 29.2 12.3 27.8 15 27.8C15.8 27.8 16.5 28 17.1 28.3C16.8 29.1 16.6 30 16.6 31H10.5Z" fill="white" fillOpacity="0.8"/>
    <circle cx="33" cy="22" r="2.8" fill="white" fillOpacity="0.8"/>
    <path d="M37.5 31C37.5 29.2 35.7 27.8 33 27.8C32.2 27.8 31.5 28 30.9 28.3C31.2 29.1 31.4 30 31.4 31H37.5Z" fill="white" fillOpacity="0.8"/>
  </svg>
);

/**
 * Badge de Autorização Oficial Google
 */
export const GoogleAuthorizedBadge: React.FC<{ 
  compact?: boolean;
  className?: string;
  showIcon?: boolean;
  label?: string;
}> = ({ 
  compact = false, 
  className = "",
  showIcon = true,
  label = "Autorizado"
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const tooltipText = "Ambiente Autorizado: Conexão segura e certificada via Google OAuth 2.0";

  if (compact) {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          title={tooltipText}
          aria-label={tooltipText}
          className={`google-authorized-badge group relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-200 text-[9px] font-black uppercase tracking-wider shadow-xs hover:shadow-md hover:shadow-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/90 transition-all duration-200 cursor-pointer select-none ${className}`}
        >
          {/* Indicador de Pulso Verde Ativo */}
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          {showIcon && <GoogleGLogo size={10} />}
          <span>{label}</span>
        </button>

        {/* Tooltip informativo */}
        {showTooltip && (
          <div 
            role="tooltip"
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-52 p-2 rounded-xl bg-slate-900/95 dark:bg-slate-950 text-white text-[10px] font-medium leading-tight shadow-xl border border-emerald-500/30 backdrop-blur-md text-center pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {tooltipText}
            </div>
            <div className="text-[9px] text-slate-300">Criptografia de ponta a ponta e conformidade total com APIs Google.</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-950" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        title={tooltipText}
        aria-label={tooltipText}
        className={`google-authorized-badge group relative flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50/90 dark:bg-emerald-950/80 border border-emerald-500/40 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-200 text-[10px] font-extrabold tracking-wide shadow-xs hover:shadow-lg hover:shadow-emerald-500/25 hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all duration-200 cursor-pointer select-none ${className}`}
      >
        {/* Indicador de Pulso Verde Ativo */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        {showIcon && <GoogleGLogo size={13} />}
        <span className="font-black uppercase tracking-wider">{label}</span>
      </button>

      {/* Tooltip informativo */}
      {showTooltip && (
        <div 
          role="tooltip"
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-56 p-2.5 rounded-xl bg-slate-900/95 dark:bg-slate-950 text-white text-[11px] font-medium leading-snug shadow-xl border border-emerald-500/40 backdrop-blur-md text-center pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {tooltipText}
          </div>
          <div className="text-[9.5px] text-slate-300">Ambiente seguro verificado com autenticação oficial OAuth 2.0.</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-950" />
        </div>
      )}
    </div>
  );
};


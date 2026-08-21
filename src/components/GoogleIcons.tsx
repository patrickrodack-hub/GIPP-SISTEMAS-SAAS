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
export const GoogleAuthorizedBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider">
        <GoogleGLogo size={10} />
        Oficial
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-blue-800 dark:text-blue-200">
      <GoogleGLogo size={14} />
      <span className="text-[10px] font-bold tracking-wide">
        Google Workspace Integrado
      </span>
    </div>
  );
};

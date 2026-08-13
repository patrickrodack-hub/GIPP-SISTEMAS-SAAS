import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * Ícone estilizado do GIPP DOCs (Inspirado no Google Docs)
 * Documento azul com dobra no canto e linhas de texto brancas
 */
export const GippDocsIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect x="4" y="2" width="16" height="20" rx="2.5" fill="#1A73E8" />
    <path d="M14.5 2L20 7.5H16C15.1716 7.5 14.5 6.82843 14.5 6V2Z" fill="#A1C8FC" />
    <path d="M14.5 2V6C14.5 6.82843 15.1716 7.5 16 7.5H20" stroke="#1557B0" strokeWidth="0.5" opacity="0.4" />
    <rect x="7.5" y="10" width="9" height="1.8" rx="0.9" fill="white" />
    <rect x="7.5" y="13.2" width="9" height="1.8" rx="0.9" fill="white" />
    <rect x="7.5" y="16.4" width="6" height="1.8" rx="0.9" fill="white" />
  </svg>
);

/**
 * Ícone estilizado do GIPP Planilhas (Inspirado no Google Sheets)
 * Documento verde esmeralda com grade de células de planilha branca
 */
export const GippSheetsIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect x="4" y="2" width="16" height="20" rx="2.5" fill="#0F9D58" />
    <path d="M14.5 2L20 7.5H16C15.1716 7.5 14.5 6.82843 14.5 6V2Z" fill="#87CEAC" />
    <rect x="7" y="9.5" width="10" height="9.5" rx="1" fill="white" fillOpacity="0.25" />
    <line x1="7" y1="12.5" x2="17" y2="12.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="7" y1="15.8" x2="17" y2="15.8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="12" y1="9.5" x2="12" y2="19" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/**
 * Ícone estilizado do GIPP Apresentações (Inspirado no Google Slides)
 */
export const GippSlidesIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect x="4" y="2" width="16" height="20" rx="2.5" fill="#F4B400" />
    <path d="M14.5 2L20 7.5H16C15.1716 7.5 14.5 6.82843 14.5 6V2Z" fill="#FDE293" />
    <rect x="7.5" y="10" width="9" height="6.5" rx="1" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="1" />
    <path d="M10 11.5L14 13.25L10 15V11.5Z" fill="white" />
  </svg>
);

/**
 * Ícone estilizado do GIPP Formulários (Inspirado no Google Forms)
 */
export const GippFormsIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect x="4" y="2" width="16" height="20" rx="2.5" fill="#7248B9" />
    <path d="M14.5 2L20 7.5H16C15.1716 7.5 14.5 6.82843 14.5 6V2Z" fill="#C2A7EA" />
    <circle cx="8" cy="10.5" r="1.2" fill="white" />
    <rect x="10.5" y="9.8" width="6" height="1.4" rx="0.7" fill="white" />
    <circle cx="8" cy="14" r="1.2" fill="white" />
    <rect x="10.5" y="13.3" width="6" height="1.4" rx="0.7" fill="white" />
    <circle cx="8" cy="17.5" r="1.2" fill="white" />
    <rect x="10.5" y="16.8" width="4" height="1.4" rx="0.7" fill="white" />
  </svg>
);

/**
 * Ícone Microsoft Word estilo 365
 */
export const GippOfficeWordIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#0078D4" />
    <rect x="3" y="3" width="18" height="18" rx="3" fill="url(#word_grad)" />
    <path d="M6.5 7.5L8.8 16.5H10.5L12 11.2L13.5 16.5H15.2L17.5 7.5H15.6L14.3 13.5L12.8 8.2H11.2L9.7 13.5L8.4 7.5H6.5Z" fill="white" />
    <defs>
      <linearGradient id="word_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#106EBE" />
        <stop offset="1" stopColor="#004578" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Ícone Microsoft Excel estilo 365
 */
export const GippOfficeExcelIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#107C41" />
    <rect x="3" y="3" width="18" height="18" rx="3" fill="url(#excel_grad)" />
    <path d="M7 7.5L10.3 12L7 16.5H9.2L11.4 13.4L13.6 16.5H15.8L12.5 12L15.8 7.5H13.6L11.4 10.6L9.2 7.5H7Z" fill="white" />
    <defs>
      <linearGradient id="excel_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#107C41" />
        <stop offset="1" stopColor="#054B22" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Ícone Microsoft PowerPoint estilo 365
 */
export const GippOfficePowerPointIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#D83B01" />
    <rect x="3" y="3" width="18" height="18" rx="3" fill="url(#ppt_grad)" />
    <path d="M8 7.5H12.5C14.2 7.5 15.5 8.7 15.5 10.3C15.5 11.9 14.2 13.1 12.5 13.1H10V16.5H8V7.5ZM10 9.3V11.3H12.3C12.9 11.3 13.5 10.8 13.5 10.3C13.5 9.8 12.9 9.3 12.3 9.3H10Z" fill="white" />
    <defs>
      <linearGradient id="ppt_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#D83B01" />
        <stop offset="1" stopColor="#8E2500" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Ícone Adobe Acrobat PDF estilo Corporativo
 */
export const GippOfficePdfIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#E8252B" />
    <path d="M16.5 13.5C15.8 13.5 14.2 14.1 12.8 15.2C11.9 14.3 11 13 10.5 11.8C10.9 10 11.1 8.2 10.3 7.5C9.8 7.1 9.1 7.2 8.7 7.7C8.2 8.3 8.3 9.8 8.9 11.8C8.1 13.7 6.8 15.7 5.7 16.7C5.1 17.3 4.8 18 5.2 18.5C5.5 18.9 6.2 18.8 7.1 18.2C8.5 17.2 10.2 15.8 11.8 15.2C13.2 15.8 15 16.3 16.2 16.2C17.1 16.1 17.6 15.4 17.4 14.6C17.2 13.9 16.8 13.5 16.5 13.5ZM9.3 8.8C9.5 8.8 9.6 9.4 9.4 10.2C9.1 9.4 9 8.9 9.3 8.8ZM6.5 17.5C6.1 17.7 5.8 17.7 5.8 17.4C5.9 17.2 6.3 16.8 7 16.2C6.8 16.8 6.6 17.3 6.5 17.5ZM11.6 14.2C12 13.7 12.5 13.1 12.9 12.5C13.2 13 13.5 13.5 13.8 13.9C13 14.1 12.2 14.2 11.6 14.2ZM16.3 15.2C15.8 15.2 15.1 14.9 14.4 14.6C15.3 14.3 16.2 14.2 16.4 14.4C16.5 14.6 16.5 15 16.3 15.2Z" fill="white" />
  </svg>
);

/**
 * Ícone GIPP Eclesiástico - Sede & Cruz Dourada
 */
export const GippChurchIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#church_grad)" />
    <path d="M12 5V13M9.5 7.5H14.5" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 19V14L12 10L18 14V19H14V15H10V19H6Z" fill="white" fillOpacity="0.9" />
    <defs>
      <linearGradient id="church_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E3A8A" />
        <stop offset="1" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Ícone GIPP Financeiro CFO - Escudo Verde com Cédula e Barras
 */
export const GippFinanceIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#fin_grad)" />
    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" />
    <path d="M12 9.5V14.5M10.2 10.8C10.2 10.8 11 10 12 10C13 10 13.8 10.6 13.8 11.4C13.8 12.6 10.2 12.4 10.2 13.6C10.2 14.4 11 15 12 15C13 15 13.8 14.2 13.8 14.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="fin_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#047857" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Ícone GIPP EBD & Teologia CGADB - Bíblia Sagrada e Luz Dourada
 */
export const GippEbdIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#ebd_grad)" />
    <path d="M6.5 7.5C8 6.8 10 6.8 12 7.8C14 6.8 16 6.8 17.5 7.5V16.5C16 15.8 14 15.8 12 16.8C10 15.8 8 15.8 6.5 16.5V7.5Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
    <line x1="12" y1="7.8" x2="12" y2="16.8" stroke="white" strokeWidth="1.6" />
    <line x1="12" y1="5" x2="12" y2="3.5" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="9.5" y1="5.5" x2="8.5" y2="4.2" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="14.5" y1="5.5" x2="15.5" y2="4.2" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="ebd_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4338CA" />
        <stop offset="1" stopColor="#6366F1" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Ícone GIPP Salinha Kids - Ursinho / Arco-Íris Alegre
 */
export const GippSalinhaKidsIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#kids_grad)" />
    <circle cx="8" cy="8" r="2" fill="#F472B6" />
    <circle cx="16" cy="8" r="2" fill="#F472B6" />
    <circle cx="12" cy="13" r="5" fill="white" />
    <circle cx="10" cy="12" r="0.8" fill="#1E293B" />
    <circle cx="14" cy="12" r="0.8" fill="#1E293B" />
    <ellipse cx="12" cy="14" rx="1.2" ry="0.8" fill="#F472B6" />
    <defs>
      <linearGradient id="kids_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EC4899" />
        <stop offset="1" stopColor="#F43F5E" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Ícone GIPP Vendas & Divulgação - Sacola de Compras e Gráfico Ascendente
 */
export const GippVendasIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#vendas_grad)" />
    <path d="M7 9H17L18 18H6L7 9Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 9V7C9 5.3 10.3 4 12 4C13.7 4 15 5.3 15 7V9" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M9.5 14L11.5 16L14.5 12" stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="vendas_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#D97706" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Ícone GIPP Jogos & Gamificação Interativa - Controle Retro
 */
export const GippInterativoIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#game_grad)" />
    <path d="M6 10C6 8.9 6.9 8 8 8H16C17.1 8 18 8.9 18 10V14C18 15.7 16.7 17 15 17L13.5 15H10.5L9 17C7.3 17 6 15.7 6 14V10Z" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.5" />
    <line x1="9" y1="10" x2="9" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="7" y1="12" x2="11" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="15" cy="11" r="0.9" fill="#F87171" />
    <circle cx="16.5" cy="12.5" r="0.9" fill="#60A5FA" />
    <defs>
      <linearGradient id="game_grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0284C7" />
        <stop offset="1" stopColor="#38BDF8" />
      </linearGradient>
    </defs>
  </svg>
);

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
    {/* Sombra sutil de fundo */}
    <rect x="4" y="2" width="16" height="20" rx="2.5" fill="#1A73E8" />
    {/* Dobra superior direita */}
    <path d="M14.5 2L20 7.5H16C15.1716 7.5 14.5 6.82843 14.5 6V2Z" fill="#A1C8FC" />
    <path d="M14.5 2V6C14.5 6.82843 15.1716 7.5 16 7.5H20" stroke="#1557B0" strokeWidth="0.5" opacity="0.4" />
    {/* Linhas de texto representativas do Google Docs */}
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
    {/* Base da página verde Google Sheets */}
    <rect x="4" y="2" width="16" height="20" rx="2.5" fill="#0F9D58" />
    {/* Dobra do canto superior direito */}
    <path d="M14.5 2L20 7.5H16C15.1716 7.5 14.5 6.82843 14.5 6V2Z" fill="#87CEAC" />
    {/* Fundo da tabela/grade branca suave */}
    <rect x="7" y="9.5" width="10" height="9.5" rx="1" fill="white" fillOpacity="0.25" />
    {/* Linhas horizontais e verticais da grade de planilha */}
    <line x1="7" y1="12.5" x2="17" y2="12.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="7" y1="15.8" x2="17" y2="15.8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="12" y1="9.5" x2="12" y2="19" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

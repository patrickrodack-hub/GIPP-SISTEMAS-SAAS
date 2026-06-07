import { useContext } from 'react';
import { ChurchContext } from '../App';

export interface GlobalSettings {
  site: string;
  email: string;
  whatsapp: string;
  youtube: string;
  instagram: string;
  facebook: string;
  chave_pix: string;
  aviso_legal: string;
  nome: string;
  logo: string;
  endereco: string;
  cidade: string;
  uf: string;
  banco: string;
}

/**
 * A global React hook to easily fetch and use global church configuration settings
 * defined in the system configurations tab (settings/config).
 */
export function useGlobalSettings(): GlobalSettings {
  const context = useContext(ChurchContext);
  const igreja = context?.db?.igreja || {};

  return {
    site: igreja.site || igreja.saas_site || '',
    email: igreja.email || igreja.saas_email || '',
    whatsapp: igreja.whatsapp || igreja.saas_whatsapp || '',
    youtube: igreja.youtube || '',
    instagram: igreja.instagram || '',
    facebook: igreja.facebook || '',
    chave_pix: igreja.chave_pix || '',
    aviso_legal: igreja.aviso_legal || '© 2026 GIPP. Ministério Integrado de Comunicação e Gestão Coletiva. Informativo oficial de circulação interna.',
    nome: igreja.nome || 'Igreja Sem Nome',
    logo: igreja.logo || '',
    endereco: igreja.endereco || '',
    cidade: igreja.cidade || '',
    uf: igreja.uf || '',
    banco: igreja.banco || '',
  };
}

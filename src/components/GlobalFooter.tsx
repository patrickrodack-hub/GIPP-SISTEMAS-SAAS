import React from 'react';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { Globe, Mail, Phone, Instagram, Youtube, Facebook, Landmark, Heart } from 'lucide-react';

export interface GlobalFooterProps {
  showSocials?: boolean;
  showLegalNotice?: boolean;
  showAddress?: boolean;
  showPix?: boolean;
  variant?: 'glass' | 'dark' | 'light';
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({
  showSocials = true,
  showLegalNotice = true,
  showAddress = true,
  showPix = true,
  variant = 'glass',
}) => {
  const settings = useGlobalSettings();

  const getContainerStyles = () => {
    switch (variant) {
      case 'dark':
        return 'bg-slate-900 border-t border-slate-800 text-white';
      case 'light':
        return 'bg-slate-50 border-t border-slate-200 text-slate-800';
      case 'glass':
      default:
        return 'bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-[2rem] shadow-lg';
    }
  };

  return (
    <footer className={`p-8 md:p-12 transition-all w-full ${getContainerStyles()}`} id="global-system-footer">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Info Institucional */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-white/20 p-1 border border-white/20" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-indigo-600/25 flex items-center justify-center border border-indigo-600/30 text-indigo-600 dark:text-indigo-300">
                <Globe size={20} />
              </div>
            )}
            <h4 className="font-black text-base uppercase tracking-tight">{settings.nome}</h4>
          </div>
          {showAddress && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              {settings.endereco ? settings.endereco : 'Endereço institucional não especificado no cadastro.'}
              {settings.cidade && `, ${settings.cidade}`}
              {settings.uf && ` - ${settings.uf}`}
            </p>
          )}
          <div className="flex flex-col gap-2.5 pt-2">
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 hover:underline">
                <Mail size={14} /> {settings.email}
              </a>
            )}
            {settings.whatsapp && (
              <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 hover:underline">
                <Phone size={14} /> {settings.whatsapp}
              </a>
            )}
            {settings.site && (
              <a href={settings.site.startsWith('http') ? settings.site : `https://${settings.site}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 hover:underline">
                <Globe size={14} /> {settings.site}
              </a>
            )}
          </div>
        </div>

        {/* Links Rápidos */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Atalhos Comunitários</h4>
          <ul className="space-y-2 text-xs font-bold">
            <li><a href="#" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 transition-colors">Portal de Membros</a></li>
            <li><a href="#" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 transition-colors">Escola Bíblica (EBD)</a></li>
            <li><a href="#" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 transition-colors">Informativo Semanal</a></li>
            <li><a href="#" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 transition-colors">Galeria de Mídias</a></li>
          </ul>
        </div>

        {/* Redes Sociais */}
        {showSocials && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Conectar Conosco</h4>
            <div className="flex gap-3">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-indigo-50 hover:bg-pink-50 dark:bg-slate-800 dark:hover:bg-pink-900/30 text-slate-500 hover:text-pink-600 rounded-xl transition-all border border-slate-100 dark:border-slate-800" title="Instagram">
                  <Instagram size={18} />
                </a>
              )}
              {settings.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-indigo-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/30 text-slate-500 hover:text-rose-600 rounded-xl transition-all border border-slate-100 dark:border-slate-800" title="YouTube">
                  <Youtube size={18} />
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-indigo-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/30 text-slate-500 hover:text-blue-600 rounded-xl transition-all border border-slate-100 dark:border-slate-800" title="Facebook">
                  <Facebook size={18} />
                </a>
              )}
              {!settings.instagram && !settings.youtube && !settings.facebook && (
                <span className="text-xs font-semibold text-slate-400 italic">Redes sociais não cadastradas.</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Assista às nossas transmissões ao vivo ou interaja diretamente nas redes sociais.</p>
          </div>
        )}

        {/* Contribuições e PIX */}
        {showPix && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Ofertas e Contribuições</h4>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 flex items-center gap-1">
                <Landmark size={12} /> Chave Pix Oficial
              </span>
              <p className="text-xs font-mono font-black text-slate-700 dark:text-slate-300 truncate bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                {settings.chave_pix ? settings.chave_pix : 'Pix não cadastrado'}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Use o Pix acima no app do seu banco para dízimos, ofertas voluntárias e donativos missionários.</p>
            </div>
          </div>
        )}
      </div>

      {showLegalNotice && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap gap-4 justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
          <span className="flex items-center gap-1">
            GIPP <Heart size={10} className="text-rose-500 inline fill-rose-500 animate-pulse"/> SISTEMA ECLESIASTICO INTEGRADO
          </span>
          <span className="text-right leading-relaxed max-w-lg lowercase first-letter:uppercase font-medium text-slate-500 dark:text-slate-400">
            {settings.aviso_legal}
          </span>
        </div>
      )}
    </footer>
  );
};

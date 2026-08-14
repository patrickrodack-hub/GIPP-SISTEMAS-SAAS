import React from 'react';
import { 
  LayoutDashboard, Users, DollarSign, BookOpen, 
  MessageCircle, Menu, Sparkles, QrCode, Calendar, Shield
} from 'lucide-react';

interface MobileBottomDockProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  onOpenMenu: () => void;
  unreadMessagesCount?: number;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  currentView,
  onNavigate,
  onOpenMenu,
  unreadMessagesCount = 0
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'cad_membro', label: 'Membros', icon: Users },
    { id: 'fin_entrada', label: 'Financeiro', icon: DollarSign },
    { id: 'secretaria_ebd', label: 'EBD', icon: BookOpen },
    { id: 'mensagens_lote', label: 'WhatsApp', icon: MessageCircle, badge: unreadMessagesCount },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9990] pointer-events-auto select-none">
      <div className="mx-3 mb-2 bg-slate-900/90 dark:bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl p-1.5 shadow-2xl flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-blue-600/30 text-blue-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-blue-400 scale-110' : ''} />
              <span className="text-[9px] mt-1 font-medium tracking-tight">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full" />
              ) : null}
            </button>
          );
        })}

        {/* Global Menu Drawer Trigger */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-2 px-3 rounded-2xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        >
          <Menu size={18} />
          <span className="text-[9px] mt-1 font-medium tracking-tight">Menu</span>
        </button>
      </div>
    </div>
  );
};

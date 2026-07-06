import React, { useState, useEffect, useContext } from 'react';
import { 
  Activity, Smartphone, Monitor, Clock, ShieldCheck, RefreshCw, 
  Trash2, Bell, Sparkles, CheckCircle2, Wifi, Zap, Award
} from 'lucide-react';
import { ChurchContext } from '../App';
import { collection, onSnapshot, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

interface AccessLog {
  id: string;
  membroId: string;
  membroNome: string;
  cargo: string;
  timestamp: string;
  dispositivo: string;
  isMobile: boolean;
  tempoUtilizacaoSegundos: number;
  status: string;
  ultimoSinal: number;
}

export const PortalMonitoramento = ({ user }: { user: any }) => {
  const { dbFirestore, appId, addToast } = useContext(ChurchContext);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatedDevice, setSimulatedDevice] = useState<'desktop' | 'mobile'>(
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
  );
  
  // Real-time listener for this member's access logs
  useEffect(() => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'portal_access_logs'),
        where('membroId', '==', user.id)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedLogs: AccessLog[] = [];
        snapshot.forEach((doc) => {
          fetchedLogs.push({ id: doc.id, ...doc.data() } as AccessLog);
        });
        
        // Sort by timestamp desc
        fetchedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(fetchedLogs);
        setLoading(false);
      }, (error) => {
        console.warn("Firestore listener error, loading from local localStorage fallback", error);
        loadLocalFallback();
      });
      
      return () => unsubscribe();
    } catch (err) {
      console.warn("Error setting up access logs listener", err);
      loadLocalFallback();
    }
  }, [user?.id]);

  const loadLocalFallback = () => {
    const localLogs = JSON.parse(localStorage.getItem('portal_access_logs_fallback') || '[]');
    const memberLogs = localLogs.filter((log: any) => log.membroId === user?.id);
    setLogs(memberLogs);
    setLoading(false);
  };

  // Helper to format usage duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Helper to format timestamp
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('pt-BR');
    } catch {
      return isoString;
    }
  };

  // Simulate a new mobile login trigger
  const handleSimulateMobileConnection = async () => {
    const customSessionId = 'sess_sim_' + Date.now();
    const dateStr = new Date().toISOString();
    
    const simLog: AccessLog = {
      id: customSessionId,
      membroId: user?.id || 'simulated_user',
      membroNome: user?.nome || 'Membro de Teste',
      cargo: user?.cargo || 'Membro',
      timestamp: dateStr,
      dispositivo: 'Celular / Mobile (Simulação)',
      isMobile: true,
      tempoUtilizacaoSegundos: Math.floor(Math.random() * 45) + 15, // Pre-populated with some simulated duration
      status: 'Desconectado',
      ultimoSinal: Date.now()
    };

    try {
      // 1. Save connection record in Firestore
      const logRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'portal_access_logs', customSessionId);
      await setDoc(logRef, simLog);
      
      // 2. Dispatch real-time notification to the central notifications
      const notifTitle = `📱 Conexão Mobile Registrada`;
      const notifBody = `Membro ${user?.nome} conectou-se de forma bem-sucedida usando um Dispositivo Móvel!`;
      
      const notifRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'portal_system_notifications', `notif_${customSessionId}`);
      await setDoc(notifRef, {
        id: `notif_${customSessionId}`,
        title: notifTitle,
        desc: notifBody,
        timestamp: dateStr,
        type: 'portal_connection',
        membroNome: user?.nome,
        membroId: user?.id,
        dispositivo: 'Smartphone / Celular',
        isMobile: true
      });

      addToast("Conexão Mobile Simulada! Notificação enviada em tempo real.", "success");
    } catch (err) {
      console.warn("Could not execute simulated connection in Firestore", err);
      // Local fallback simulation
      const localLogs = JSON.parse(localStorage.getItem('portal_access_logs_fallback') || '[]');
      localLogs.unshift(simLog);
      localStorage.setItem('portal_access_logs_fallback', JSON.stringify(localLogs));
      loadLocalFallback();
      addToast("Conexão simulada salva localmente.", "success");
    }
  };

  // Clear all logs for this member
  const handleClearMyLogs = async () => {
    if (!confirm("Deseja realmente limpar todos os seus registros de acesso?")) return;
    
    try {
      // Clear local
      localStorage.setItem('portal_access_logs_fallback', JSON.stringify([]));
      
      // In Firestore, we delete them or just show empty
      const q = query(
        collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'portal_access_logs'),
        where('membroId', '==', user?.id)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (document) => {
        await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'portal_access_logs', document.id));
      });
      
      setLogs([]);
      addToast("Histórico de acessos limpo com sucesso.", "info");
    } catch (err) {
      console.warn("Error deleting logs", err);
      setLogs([]);
      addToast("Histórico local limpo.", "info");
    }
  };

  // Statistics calculations
  const totalAccesses = logs.length;
  const mobileAccesses = logs.filter(l => l.isMobile).length;
  const totalTimeSecs = logs.reduce((sum, l) => sum + (l.tempoUtilizacaoSegundos || 0), 0);
  const avgTimeSecs = totalAccesses > 0 ? Math.round(totalTimeSecs / totalAccesses) : 0;

  return (
    <div className="h-full flex flex-col space-y-6 animate-entrance">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <Activity size={28} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Monitoramento de Acesso
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Segurança, controle de sessões e telemetria do seu Portal de Membro.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSimulateMobileConnection}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Smartphone size={14} />
            Simular Acesso Celular
          </button>

          <button 
            onClick={handleClearMyLogs}
            disabled={logs.length === 0}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:border-rose-200 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            title="Limpar Histórico de Acessos"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* CORE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Connects */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/45 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Wifi size={22} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Acessos Totais</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{totalAccesses}</span>
          </div>
        </div>

        {/* Mobile Connections */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/45 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Smartphone size={22} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Por Celular</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">
              {mobileAccesses} <span className="text-xs font-bold text-slate-400">({totalAccesses > 0 ? Math.round((mobileAccesses / totalAccesses) * 100) : 0}%)</span>
            </span>
          </div>
        </div>

        {/* Total Duration */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/45 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Tempo Utilizado</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{formatDuration(totalTimeSecs)}</span>
          </div>
        </div>

        {/* Average Duration */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/45 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Zap size={22} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Tempo Médio / Login</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{formatDuration(avgTimeSecs)}</span>
          </div>
        </div>
      </div>

      {/* DETAILED ACTIVE STATE & TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CURRENT SESSION CARD */}
        <div className="lg:col-span-1 bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-950/50 dark:to-slate-900 p-6 rounded-[2rem] border border-indigo-100/60 dark:border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-400 flex items-center gap-2">
              <Zap size={14} className="text-indigo-600 animate-pulse" />
              Sessão Atual Ativa
            </h3>
            <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Online
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Seu Dispositivo</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                {simulatedDevice === 'mobile' ? (
                  <>
                    <Smartphone size={13} className="text-emerald-500" />
                    Celular (Simulado)
                  </>
                ) : (
                  <>
                    <Monitor size={13} className="text-indigo-500" />
                    Computador Desktop
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Status do Dispositivo</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    setSimulatedDevice('mobile');
                    addToast("Modo Móvel ativado para esta sessão de monitoramento.", "info");
                  }}
                  className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg transition-all border ${
                    simulatedDevice === 'mobile' 
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                      : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-850 dark:border-slate-800'
                  }`}
                >
                  Móvel
                </button>
                <button 
                  onClick={() => {
                    setSimulatedDevice('desktop');
                    addToast("Modo Desktop ativado para esta sessão de monitoramento.", "info");
                  }}
                  className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg transition-all border ${
                    simulatedDevice === 'desktop' 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                      : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-850 dark:border-slate-800'
                  }`}
                >
                  Desktop
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Segurança de Rede</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={14} />
                Criptografado SSL
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-xs space-y-1.5 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Início da Conexão</span>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-350 block">
                {formatTimestamp(new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>

        {/* LOG HISTORY LIST */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-820 pb-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" />
              Histórico Detalhado de Acessos
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {logs.length} registros
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <RefreshCw size={24} className="animate-spin text-indigo-600" />
              <p className="text-xs text-slate-400 italic">Carregando telemetria...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-850/30 rounded-2xl border-2 border-dashed border-slate-250 dark:border-slate-800">
              <Activity className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Sem acessos registrados</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Seus logins no celular ou tablet serão auditados automaticamente e aparecerão listados aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-800/60">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-slate-50 dark:bg-slate-850 text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Data & Hora de Entrada</th>
                    <th className="p-3">Dispositivo</th>
                    <th className="p-3">Tempo de Utilização</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50 text-slate-700 dark:text-slate-300">
                  {logs.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors">
                      <td className="p-3 font-mono text-[10px] text-slate-500 dark:text-slate-450">
                        {formatTimestamp(rec.timestamp)}
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1.5 font-semibold">
                          {rec.isMobile ? (
                            <Smartphone size={13} className="text-emerald-500" />
                          ) : (
                            <Monitor size={13} className="text-indigo-500" />
                          )}
                          {rec.dispositivo}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-600 dark:text-slate-300">
                        {rec.tempoUtilizacaoSegundos > 0 ? formatDuration(rec.tempoUtilizacaoSegundos) : 'Menos de 1s'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                          rec.status === 'Online' || rec.status === 'Ativo'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

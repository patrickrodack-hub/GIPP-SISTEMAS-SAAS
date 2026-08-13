import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Printer,
  Award,
  Send,
  UserCheck,
  CheckCircle2,
  Building,
  Sparkles,
  Download,
  Search,
  BookOpen
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface DocumentoModelo {
  id: string;
  tipo: 'Carta de Recomendação' | 'Carta de Mudança' | 'Atestado de Batismo' | 'Certificado de Criança' | 'Ficha de Membro';
  membroNome: string;
  cargo: string;
  dataEmissao: string;
  destinatario: string;
  congregacaoOrigem: string;
}

export default function ModuleDocumentosSecretariaExpress() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast } = context || {};

  const [documentos] = useState<DocumentoModelo[]>([
    {
      id: 'doc_1',
      tipo: 'Carta de Recomendação',
      membroNome: 'Irmão Mateus Oliveira',
      cargo: 'Diácono',
      dataEmissao: '12/08/2026',
      destinatario: 'Igreja AD em Campinas - SP (Pr. Marcos Souza)',
      congregacaoOrigem: 'Templo Sede - GIPP'
    },
    {
      id: 'doc_2',
      tipo: 'Atestado de Batismo',
      membroNome: 'Irmã Amanda Lima',
      cargo: 'Membro Congregado',
      dataEmissao: '10/08/2026',
      destinatario: 'Para Fins Eclesiásticos',
      congregacaoOrigem: 'Templo Sede - GIPP'
    },
    {
      id: 'doc_3',
      tipo: 'Certificado de Criança',
      membroNome: 'Pedro Lucas Costa',
      cargo: 'Apresentação de Criança',
      dataEmissao: '05/08/2026',
      destinatario: 'Família Costa',
      congregacaoOrigem: 'Congregação Monte das Oliveiras'
    }
  ]);

  const [selectedDoc, setSelectedDoc] = useState<DocumentoModelo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 border border-blue-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/20">
            <FileText size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Visão Usuário de Secretaria • Expediente Rápido
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Central de Emissão de Documentos & Cartas
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Emissão instantânea de Cartas de Recomendação, Mudança, Atestados de Batismo e Apresentação de Crianças com timbre oficial da Assembleia de Deus (CGADB).
            </p>
          </div>
        </div>
      </div>

      {/* Grid Documentos */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <BookOpen className="text-blue-400" size={20} /> Modelos de Expediente Rápido
          </h2>
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por membro ou tipo..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documentos.map(doc => (
            <div key={doc.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {doc.tipo}
                </span>
                <span className="text-[10px] text-slate-500">{doc.dataEmissao}</span>
              </div>

              <div>
                <h3 className="text-base font-black text-white">{doc.membroNome}</h3>
                <p className="text-xs text-slate-400">{doc.cargo} • {doc.congregacaoOrigem}</p>
                <p className="text-xs text-slate-500 mt-1 truncate">Destino: {doc.destinatario}</p>
              </div>

              <button
                onClick={() => setSelectedDoc(doc)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={15} /> Imprimir Documento Oficial
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Imprimir Documento Timbrado */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-lg rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-blue-400">{selectedDoc.tipo}</span>
                <button onClick={() => setSelectedDoc(null)} className="p-1 text-slate-400">✕</button>
              </div>

              <div className="p-6 bg-white text-slate-900 rounded-2xl shadow-xl space-y-4 font-serif text-xs leading-relaxed">
                <div className="text-center font-sans border-b border-slate-300 pb-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS</h3>
                  <p className="text-[10px] text-slate-600 font-bold">Filiada à CGADB / CONFRADESP • Templo Sede</p>
                  <span className="text-[9px] text-slate-500 font-mono">CNPJ: 00.000.000/0001-00</span>
                </div>

                <div className="text-center my-4 font-sans">
                  <h2 className="text-base font-black text-slate-900 uppercase underline decoration-2 underline-offset-4">
                    {selectedDoc.tipo.toUpperCase()}
                  </h2>
                </div>

                <p className="text-justify indent-6">
                  Recomendamos ao amor cristão e à comunhão dos santos o(a) nosso(a) estimado(a) irmão(ã) <strong>{selectedDoc.membroNome}</strong>, portador(a) do cargo de <strong>{selectedDoc.cargo}</strong>, o(a) qual se encontra em plena comunhão com a doutrina sagrada ensinada em nossa igreja.
                </p>

                <p className="text-justify indent-6">
                  Pedimos à igreja receptora (<strong>{selectedDoc.destinatario}</strong>) que o(a) receba no Senhor, prestando-lhe todo o auxílio necessário para a edificação do Reino de Deus.
                </p>

                <div className="pt-8 text-center font-sans space-y-4">
                  <p className="text-[10px] text-slate-600">Dado e passado nesta cidade, aos {selectedDoc.dataEmissao}.</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <div className="w-32 h-0.5 bg-slate-800 mx-auto mb-1" />
                      <strong className="block text-[10px] text-slate-900">Pr. Antônio Carlos</strong>
                      <span className="text-[9px] text-slate-500">Pastor Presidente</span>
                    </div>
                    <div>
                      <div className="w-32 h-0.5 bg-slate-800 mx-auto mb-1" />
                      <strong className="block text-[10px] text-slate-900">Irmã Juliana Costa</strong>
                      <span className="text-[9px] text-slate-500">Secretária Geral</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  window.print();
                  addToast('Imprimindo Documento Oficial Timbrado!', 'info');
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={16} /> Imprimir Documento Timbrado
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

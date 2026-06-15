import React from 'react';
import { Video, ImagePlus, UserCircle, Users, CheckSquare, Settings, Share2, UploadCloud, MonitorPlay, Calendar, Activity, Database, Heart, Mail } from 'lucide-react';
import { Button, GenericTable } from '../App';

export const ModuleMidiaTab = ({
    subTabMedia, setSubTabMedia,
    mediaEquipe, loadingMediaEquipe,
    mediaEventos, loadingMediaEventos,
    mediaBiblioteca, loadingMediaBiblioteca,
    mediaEquipamentos, loadingMediaEquipamentos
}: any) => {

    return (
        <div className="h-full flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {/* Header Panel */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-6 rounded-[2rem] shadow-md border border-teal-700/50 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md"><Video size={32}/></div>
                    <div>
                        <h3 className="font-extrabold text-2xl tracking-tight">Ministério de Mídia</h3>
                        <p className="text-xs text-teal-100/85 font-medium mt-1 uppercase tracking-widest">Escalas, Eventos, Conteúdo e Equipamentos</p>
                    </div>
                </div>
            </div>

            {/* Media Sub tabs switcher */}
            <div className="flex gap-2 border-b border-slate-200 pb-1">
                {['equipe', 'eventos', 'biblioteca', 'equipamentos', 'relatorios'].map((st) => (
                    <button
                        key={st}
                        onClick={() => setSubTabMedia(st)}
                        className={`px-5 py-2 font-black text-xs uppercase tracking-wider rounded-xl transition-all ${subTabMedia === st ? 'bg-teal-50 text-teal-700 font-black border-b-2 border-teal-600' : 'text-slate-500 hover:text-teal-600'}`}
                    >
                        {st === 'equipe' && 'Escala & Equipe'}
                        {st === 'eventos' && 'Agenda & Eventos'}
                        {st === 'biblioteca' && 'Acervo & Upload'}
                        {st === 'equipamentos' && 'Aparato Técnico'}
                        {st === 'relatorios' && 'Relatórios'}
                    </button>
                ))}
            </div>

            {subTabMedia === 'equipe' && (
                <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-black text-lg text-slate-800">Equipe Técnica de Mídia</h4>
                            <p className="text-xs text-slate-500">Fotógrafos, vídeomakers, operadores e editores</p>
                        </div>
                        <Button variant="primary" className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700"><UserCircle size={16}/> Novo Integrante</Button>
                    </div>
                    {loadingMediaEquipe ? <p className="text-sm text-slate-500">Carregando equipe...</p> : (
                        <GenericTable title="" type="midia_equipe" data={mediaEquipe} columns={[{header:'Integrante', key:'nome'}, {header:'Função', key:'funcao'}, {header:'Status', key:'status'}]} />
                    )}
                </div>
            )}
            
            {subTabMedia === 'eventos' && (
                <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-black text-lg text-slate-800">Agenda & Checklist</h4>
                            <p className="text-xs text-slate-500">Pautas de eventos para equipe e transmissão</p>
                        </div>
                        <Button variant="primary" className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700"><Calendar size={16}/> Agendar Briefing</Button>
                    </div>
                    {loadingMediaEventos ? <p className="text-sm text-slate-500">Carregando agenda...</p> : (
                        <GenericTable title="" type="midia_eventos" data={mediaEventos} columns={[{header:'Evento', key:'titulo'}, {header:'Data/Hora', key:'dataHora'}, {header:'Plataformas', key:'streaming'}]} />
                    )}
                </div>
            )}

            {subTabMedia === 'biblioteca' && (
                <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-black text-lg text-slate-800">Central de Conteúdo Digital</h4>
                            <p className="text-xs text-slate-500">Artes, vídeos e repositório de recursos visuais</p>
                        </div>
                        <Button variant="primary" className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700"><UploadCloud size={16}/> Upload Arquivo</Button>
                    </div>
                    {loadingMediaBiblioteca ? <p className="text-sm text-slate-500">Carregando acervo...</p> : (
                        <GenericTable title="" type="midia_biblioteca" data={mediaBiblioteca} columns={[{header:'Nome', key:'nome'}, {header:'Tipo', key:'tipo'}, {header:'Tamanho', key:'tamanho'}]} />
                    )}
                </div>
            )}

            {subTabMedia === 'equipamentos' && (
                <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-black text-lg text-slate-800">Inventário Técnico</h4>
                            <p className="text-xs text-slate-500">Câmeras, áudio, cenografia e checklist</p>
                        </div>
                        <Button variant="primary" className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700"><MonitorPlay size={16}/> Cadastrar Novo</Button>
                    </div>
                    {loadingMediaEquipamentos ? <p className="text-sm text-slate-500">Carregando equipamentos...</p> : (
                        <GenericTable title="" type="midia_equipamentos" data={mediaEquipamentos} columns={[{header:'Equipamento', key:'nome'}, {header:'Modelo/Ref', key:'modelo'}, {header:'Condição', key:'status'}]} />
                    )}
                </div>
            )}
            
            {subTabMedia === 'relatorios' && (
                <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-teal-50 border border-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
                        <Activity size={32} />
                    </div>
                    <h4 className="font-black text-xl text-slate-800 mb-2">Monitoramento de Alcance</h4>
                    <p className="text-sm text-slate-500 mb-6 max-w-sm">Estatísticas, feedbacks, controle de ativos depreciados e publicações em breve.</p>
                    <Button className="!bg-teal-600 text-white border-teal-700"><Database size={16}/> Processar Analytics</Button>
                </div>
            )}
            
        </div>
    );
};

import React, { useState } from 'react';
import { 
    HelpCircle, Plus, FileText, Download, Award, Search, 
    Filter, CheckCircle, BookOpen, Printer, Sparkles, Trash2, Check
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
    QuestaoBanco, ProvaCustomizada, NIVEIS_MINISTERIAIS, 
    DISCIPLINAS_CURRICULARES, DisciplinaObreiro 
} from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal, getTodayDate } from '../../utils/sharedHelpers';

interface TabBancoQuestoesProvasProps {
    bancoQuestoes?: QuestaoBanco[];
    provasCustomizadas?: ProvaCustomizada[];
    onSalvarQuestao: (questao: QuestaoBanco) => void;
    onSalvarProva: (prova: ProvaCustomizada) => void;
    dbIgreja?: any;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TabBancoQuestoesProvas: React.FC<TabBancoQuestoesProvasProps> = ({
    bancoQuestoes = [],
    provasCustomizadas = [],
    onSalvarQuestao,
    onSalvarProva,
    dbIgreja,
    addToast
}) => {
    const listaBanco = bancoQuestoes || [];
    const listaProvas = provasCustomizadas || [];

    const [filtroNivel, setFiltroNivel] = useState<string>('todos');
    const [buscaTexto, setBuscaTexto] = useState('');
    const [showModalNovaQuestao, setShowModalNovaQuestao] = useState(false);
    const [showModalNovaProva, setShowModalNovaProva] = useState(false);

    // Form Nova Questão
    const [formQuestao, setFormQuestao] = useState({
        nivelId: 'diacono' as 'auxiliar' | 'diacono' | 'presbitero' | 'evangelista' | 'pastor',
        disciplinaId: 'disc_diacono_01',
        disciplinaTitulo: 'Fundamentos Bíblicos do Diaconato',
        enunciado: '',
        opcoes: [
            'Servir às mesas e aos necessitados, cooperando com os apóstolos',
            'Comandar a administração financeira central da convenção',
            'Substituir o pastor titular em concílios doutrinários universais',
            'Realizar viagens apostólicas exclusivas fora do país'
        ],
        respostaCorreta: 0,
        explicacao: 'Conforme Atos 6:1-6 e a Declaração de Fé da CPAD, o diaconato é vocacionado para o serviço prático e zelo do templo.',
        tipo: 'multipla_escolha' as 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso',
        dificuldade: 'medio' as 'facil' | 'medio' | 'avancado'
    });

    // Form Nova Prova
    const [formProva, setFormProva] = useState({
        titulo: 'Exame Teológico Geral de Diaconato - 2026',
        nivelId: 'diacono' as 'auxiliar' | 'diacono' | 'presbitero' | 'evangelista' | 'pastor',
        tempoMinutos: 90,
        notaMinima: 7.0,
        totalQuestoes: 5
    });

    const questoesFiltradas = bancoQuestoes.filter(q => {
        const matchesNivel = filtroNivel === 'todos' || q.nivelId === filtroNivel;
        const matchesBusca = !buscaTexto.trim() || 
            q.enunciado.toLowerCase().includes(buscaTexto.toLowerCase()) || 
            q.disciplinaTitulo.toLowerCase().includes(buscaTexto.toLowerCase());
        return matchesNivel && matchesBusca;
    });

    const handleCriarQuestao = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formQuestao.enunciado.trim()) {
            addToast("Informe o enunciado da questão.", "error");
            return;
        }

        const nova: QuestaoBanco = {
            id: `q_${Date.now()}`,
            nivelId: formQuestao.nivelId,
            disciplinaId: formQuestao.disciplinaId,
            disciplinaTitulo: formQuestao.disciplinaTitulo,
            enunciado: formQuestao.enunciado,
            opcoes: formQuestao.opcoes,
            respostaCorreta: formQuestao.respostaCorreta,
            explicacao: formQuestao.explicacao,
            tipo: formQuestao.tipo,
            dificuldade: formQuestao.dificuldade,
            criadoPor: 'Coordenação Teológica',
            dataCriacao: getTodayDate()
        };

        onSalvarQuestao(nova);
        setShowModalNovaQuestao(false);
        addToast("Questão adicionada ao Banco Dogmático!", "success");
    };

    // Gerar Prova Impressa em PDF (Avaliação em Sala de Aula)
    const handleImprimirProvaPDF = (prova: ProvaCustomizada) => {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 18;
            const contentWidth = pageWidth - (margin * 2);
            let currentY = 20;

            // Cabeçalho Institucional
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(15, 23, 42);
            doc.text((dbIgreja?.nome_igreja || 'ASSEMBLEIA DE DEUS').toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
            currentY += 5;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text('INSTITUTO BÍBLICO TEOLÓGICO & FORMAÇÃO DE OBREIROS', pageWidth / 2, currentY, { align: 'center' });
            currentY += 4.5;
            doc.text('PADRÃO DOGMÁTICO CGADB / CPAD - DECLARAÇÃO DE FÉ', pageWidth / 2, currentY, { align: 'center' });
            currentY += 6;

            doc.setDrawColor(16, 185, 129);
            doc.setLineWidth(0.6);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 7;

            // Título do Exame
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(15, 23, 42);
            doc.text(prova.titulo.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
            currentY += 7;

            // Campos do Aluno (Nome, Data, Nota)
            doc.setDrawColor(203, 213, 225);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, 'FD');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(30, 41, 59);
            doc.text('Nome do Candidato(a): _____________________________________________________', margin + 4, currentY + 6);
            doc.text(`Data: ____/____/________   |   Duração: ${prova.tempoMinutos || 90} min   |   Nota Mínima: ${(prova.notaMinima || 7.0).toFixed(1)}   |   Nota: [ _______ ]`, margin + 4, currentY + 12);
            currentY += 22;

            // Instruções
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text('Instruções: Leia atentamente cada enunciado. Marque apenas UMA alternativa correta para cada questão dogmática.', margin, currentY);
            currentY += 6;

            // Obter questões da prova
            const questoesDaProva = bancoQuestoes.filter(q => prova.questoesIds?.includes(q.id) || q.nivelId === prova.nivelId).slice(0, 10);

            questoesDaProva.forEach((q, idx) => {
                if (currentY > 260) {
                    doc.addPage();
                    currentY = 20;
                }

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(15, 23, 42);
                const qSplit = doc.splitTextToSize(`${idx + 1}. [${q.disciplinaTitulo}] ${q.enunciado}`, contentWidth);
                doc.text(qSplit, margin, currentY);
                currentY += (qSplit.length * 4.0) + 2;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(51, 65, 85);
                q.opcoes.forEach((opc, opcIdx) => {
                    const opcSplit = doc.splitTextToSize(`(   ) ${String.fromCharCode(65 + opcIdx)}) ${opc}`, contentWidth - 6);
                    doc.text(opcSplit, margin + 4, currentY);
                    currentY += (opcSplit.length * 3.8);
                });
                currentY += 4;
            });

            // Folha de Gabarito no Final
            if (currentY > 240) {
                doc.addPage();
                currentY = 20;
            }
            doc.setDrawColor(16, 185, 129);
            doc.setLineWidth(0.4);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 6;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text('FOLHA DE RESPOSTAS & GABARITO OFICIAL DO CANDIDATO:', margin, currentY);
            currentY += 6;

            let gabaritoX = margin;
            questoesDaProva.forEach((_, idx) => {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.text(`${idx + 1}: [ A ] [ B ] [ C ] [ D ]`, gabaritoX, currentY);
                gabaritoX += 45;
                if (gabaritoX > pageWidth - 45) {
                    gabaritoX = margin;
                    currentY += 6;
                }
            });

            const cleanFileName = `Avaliacao_${prova.titulo.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.pdf`;
            doc.save(cleanFileName);
            addToast("Caderno de Prova (PDF) gerado para impressão!", "success");
        } catch (err) {
            console.error("Erro ao gerar PDF da prova:", err);
            addToast("Erro ao gerar PDF da prova.", "error");
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <HelpCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Banco de Questões Dogmático & Gerador de Provas
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Banco de questões teológicas baseadas na Declaração de Fé da CPAD e montagem de exames impressos em PDF.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowModalNovaQuestao(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                        <Plus size={15} />
                        <span>Nova Questão no Banco</span>
                    </button>
                </div>
            </div>

            {/* Seletor de Nível e Busca */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Filtrar Grau:</span>
                    <select
                        value={filtroNivel}
                        onChange={(e) => setFiltroNivel(e.target.value)}
                        className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-100"
                    >
                        <option value="todos">Todos os Graus Ministeriais</option>
                        {NIVEIS_MINISTERIAIS.map(n => (
                            <option key={n.id} value={n.id}>{n.nome}</option>
                        ))}
                    </select>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por termo ou matéria..."
                        value={buscaTexto}
                        onChange={(e) => setBuscaTexto(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
                    />
                </div>
            </div>

            {/* Seção de Provas Customizadas Disponíveis para Impressão */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                        <Award size={15} className="text-emerald-600" />
                        <span>Cadernos de Exames & Provas Oficiais ({provasCustomizadas.length})</span>
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {provasCustomizadas.map(pr => (
                        <div key={pr.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between text-xs">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                        Grau: {(pr.nivelId || 'diacono').toUpperCase()}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">{pr.tempoMinutos || 90} min • Mínimo {(pr.notaMinima || 7.0).toFixed(1)}</span>
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white mt-1 text-sm">{pr.titulo}</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">{pr.questoesIds?.length || 5} Questões selecionadas no banco</p>
                            </div>

                            <button
                                onClick={() => handleImprimirProvaPDF(pr)}
                                className="mt-3 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                            >
                                <Download size={13} />
                                <span>Gerar Caderno de Prova (PDF Impresso)</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lista de Questões do Banco */}
            <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400 px-1">
                    Questões Cadastradas no Acervo ({questoesFiltradas.length})
                </h3>

                <div className="space-y-3">
                    {questoesFiltradas.map((q, idx) => (
                        <div key={q.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
                            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 font-black text-[10px] flex items-center justify-center text-slate-600 dark:text-slate-400">
                                        {idx + 1}
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">{q.disciplinaTitulo}</span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                                    {q.nivelId} • {q.dificuldade}
                                </span>
                            </div>

                            <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-relaxed">
                                {q.enunciado}
                            </h4>

                            {/* Opções */}
                            <div className="space-y-1.5 pl-2">
                                {q.opcoes.map((opc, opcIdx) => {
                                    const isCorreta = opcIdx === q.respostaCorreta;
                                    return (
                                        <div key={opcIdx} className={`p-2 rounded-xl border flex items-center gap-2 text-[11px] ${
                                            isCorreta
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 font-bold'
                                                : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                        }`}>
                                            <span className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] bg-white dark:bg-slate-900 border">
                                                {String.fromCharCode(65 + opcIdx)}
                                            </span>
                                            <span className="flex-1">{opc}</span>
                                            {isCorreta && <span className="text-[9px] uppercase font-black text-emerald-600">(Gabarito Correto)</span>}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explicação Exegética */}
                            {q.explicacao && (
                                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-[10px] text-amber-800 dark:text-amber-300">
                                    <span className="font-bold block uppercase mb-0.5">Fundamentação Teológica CGADB:</span>
                                    {q.explicacao}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal: Nova Questão */}
            {showModalNovaQuestao && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Adicionar Questão ao Banco</h3>
                            <button onClick={() => setShowModalNovaQuestao(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleCriarQuestao} className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nível Ministerial</label>
                                    <select
                                        value={formQuestao.nivelId}
                                        onChange={(e) => setFormQuestao(p => ({ ...p, nivelId: e.target.value as any }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                                    >
                                        {NIVEIS_MINISTERIAIS.map(n => (
                                            <option key={n.id} value={n.id}>{n.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Dificuldade</label>
                                    <select
                                        value={formQuestao.dificuldade}
                                        onChange={(e) => setFormQuestao(p => ({ ...p, dificuldade: e.target.value as any }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                                    >
                                        <option value="facil">Fácil</option>
                                        <option value="medio">Médio</option>
                                        <option value="dificil">Difícil</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Matéria / Disciplina</label>
                                <input
                                    type="text"
                                    value={formQuestao.disciplinaTitulo}
                                    onChange={(e) => setFormQuestao(p => ({ ...p, disciplinaTitulo: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Enunciado da Questão</label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Escreva a pergunta com clareza dogmática..."
                                    value={formQuestao.enunciado}
                                    onChange={(e) => setFormQuestao(p => ({ ...p, enunciado: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Alternativas (A, B, C, D)</label>
                                <div className="space-y-2">
                                    {formQuestao.opcoes.map((opc, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="respCorreta"
                                                checked={formQuestao.respostaCorreta === idx}
                                                onChange={() => setFormQuestao(p => ({ ...p, respostaCorreta: idx }))}
                                                className="w-4 h-4 text-emerald-600"
                                            />
                                            <span className="font-bold">{String.fromCharCode(65 + idx)})</span>
                                            <input
                                                type="text"
                                                value={opc}
                                                onChange={(e) => {
                                                    const novasOpc = [...formQuestao.opcoes];
                                                    novasOpc[idx] = e.target.value;
                                                    setFormQuestao(p => ({ ...p, opcoes: novasOpc }));
                                                }}
                                                className="flex-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 block">Selecione o botão de rádio na opção que representa o gabarito correto.</span>
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Explicação / Referência Doutrinária</label>
                                <input
                                    type="text"
                                    value={formQuestao.explicacao}
                                    onChange={(e) => setFormQuestao(p => ({ ...p, explicacao: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer"
                            >
                                Salvar Questão no Banco
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

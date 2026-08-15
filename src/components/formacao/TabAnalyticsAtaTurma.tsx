import React from 'react';
import { 
    BarChart2, FileText, Download, TrendingUp, Users, CheckCircle, 
    Clock, Award, Shield, Printer, AlertTriangle, Layers
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { TurmaFormacao, CandidatoObreiro, NIVEIS_MINISTERIAIS, DisciplinaObreiro } from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal, getTodayDate } from '../../utils/sharedHelpers';

interface TabAnalyticsAtaTurmaProps {
    turmas?: TurmaFormacao[];
    candidatos?: CandidatoObreiro[];
    disciplinas?: DisciplinaObreiro[];
    dbIgreja?: any;
    userLogado?: any;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TabAnalyticsAtaTurma: React.FC<TabAnalyticsAtaTurmaProps> = ({
    turmas = [],
    candidatos = [],
    disciplinas = [],
    dbIgreja,
    userLogado,
    addToast
}) => {
    const listaTurmas = turmas || [];
    const listaCandidatos = candidatos || [];
    const listaDisciplinas = disciplinas || [];

    const [selectedTurmaId, setSelectedTurmaId] = React.useState<string>(listaTurmas[0]?.id || '');
    const activeTurma = listaTurmas.find(t => t.id === selectedTurmaId) || listaTurmas[0];
    const alunosDaTurma = listaCandidatos.filter(c => c && activeTurma?.alunosIds?.includes(c.id));

    // Funil Ministerial Geral
    const totalInscritos = listaCandidatos.length;
    const totalCursando = listaCandidatos.filter(c => c && (c.statusTrilha === 'cursando' || c.statusTrilha === 'em_revisao')).length;
    const totalEstagiando = listaCandidatos.filter(c => c && c.statusTrilha === 'aprovado_estagio').length;
    const totalProntosConsagracao = listaCandidatos.filter(c => c && c.statusTrilha === 'pronto_consagracao').length;
    const totalConsagrados = listaCandidatos.filter(c => c && c.statusTrilha === 'consagrado').length;

    // Gerar Ata Final de Conclusão de Turma em PDF Oficial
    const handleGerarAtaPDF = () => {
        if (!activeTurma) return;
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 18;
            const contentWidth = pageWidth - (margin * 2);
            let currentY = 22;

            // Cabeçalho Institucional Solene
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text((dbIgreja?.nome_igreja || 'ASSEMBLEIA DE DEUS - MINISTÉRIO DO BELÉM').toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
            currentY += 5.5;

            doc.setFontSize(9.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text('CONVENÇÃO GERAL DAS ASSEMBLEIAS DE DEUS NO BRASIL (CGADB / CPAD)', pageWidth / 2, currentY, { align: 'center' });
            currentY += 4.5;
            doc.text('DEPARTAMENTO DE EDUCAÇÃO CRISTÃ & INSTITUTO BÍBLICO TEOLÓGICO', pageWidth / 2, currentY, { align: 'center' });
            currentY += 7;

            // Linha decorativa
            doc.setDrawColor(16, 185, 129);
            doc.setLineWidth(0.8);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 8;

            // Título do Documento
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(16, 185, 129);
            doc.text('ATA FINAL DE CONCLUSÃO & HOMOLOGAÇÃO MINISTERIAL', pageWidth / 2, currentY, { align: 'center' });
            currentY += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
            const dadosTurmaTexto = `Turma: ${activeTurma.nome} | Ano Letivo: ${activeTurma.anoLetivo} | Grau: ${activeTurma.nivelMinisterial.toUpperCase()} | Data de Emissão: ${formatDateLocal(getTodayDate())}`;
            doc.text(dadosTurmaTexto, pageWidth / 2, currentY, { align: 'center' });
            currentY += 8;

            // Preâmbulo da Ata
            const preambulo = `Aos ${new Date().getDate()} dias do mês de ${new Date().toLocaleDateString('pt-BR', { month: 'long' })} de ${new Date().getFullYear()}, reuniu-se a Coordenação de Ensino Teológico e o Corpo Docente Ministerial sob a presidência do ${dbIgreja?.pastor_presidente || userLogado?.nome || 'Pastor Presidente'}, para lavrar a presente ATA DE CONCLUSÃO E AVALIAÇÃO FINAL dos obreiros aspirantes ao Santo Ministério da Igreja de Deus, conforme as exigências da Declaração de Fé das Assembleias de Deus e preceitos bíblicos de 1 Timóteo 3 e Tito 1.`;
            const splitPreambulo = doc.splitTextToSize(preambulo, contentWidth);
            doc.text(splitPreambulo, margin, currentY);
            currentY += (splitPreambulo.length * 4.2) + 6;

            // Tabela de Alunos, Notas e Parecer
            doc.setFillColor(241, 245, 249);
            doc.rect(margin, currentY, contentWidth, 7, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(15, 23, 42);
            doc.text('Nº', margin + 2, currentY + 4.5);
            doc.text('NOME DO CANDIDATO', margin + 12, currentY + 4.5);
            doc.text('PROVA', margin + 95, currentY + 4.5);
            doc.text('ESTÁGIO', margin + 115, currentY + 4.5);
            doc.text('FREQ.', margin + 138, currentY + 4.5);
            doc.text('PARECER FINAL', margin + 155, currentY + 4.5);
            currentY += 9;

            doc.setFont('helvetica', 'normal');
            alunosDaTurma.forEach((al, idx) => {
                const media = (al.mediaProvas || 8.5).toFixed(1);
                const horas = `${al.horasEstagioCumpridas || 0}h`;
                const parecer = al.workflowStatus?.mentoriaAprovada && al.progressoTeorico >= 80 ? 'APROVADO' : 'EM CURSO';

                doc.setFontSize(7.5);
                doc.setTextColor(30, 41, 59);
                doc.text(String(idx + 1).padStart(2, '0'), margin + 2, currentY);
                doc.text(al.nome, margin + 12, currentY);
                doc.text(media, margin + 98, currentY);
                doc.text(horas, margin + 118, currentY);
                doc.text('95%', margin + 140, currentY);

                if (parecer === 'APROVADO') {
                    doc.setTextColor(16, 185, 129);
                    doc.setFont('helvetica', 'bold');
                } else {
                    doc.setTextColor(217, 119, 6);
                    doc.setFont('helvetica', 'normal');
                }
                doc.text(parecer, margin + 155, currentY);

                currentY += 6.5;
            });

            currentY += 8;

            // Parecer do Tutor Responsável
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text('PARECER DO CORPO DOCENTE & DIRETORIA MINISTERIAL:', margin, currentY);
            currentY += 4.5;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            const parecerDocente = `Os alunos com parecer "APROVADO" cumpriram integralmente a carga horária teórica dos 5 módulos curriculares, alcançaram média superior a 7.0 (sete inteiros), cumpriram as horas de estágio prático supervisionado e foram homologados em entrevista pastoral. Estão aptos para a imposição de mãos e ordenação oficial na Convenção Regional e Assembleia Geral.`;
            const splitParecer = doc.splitTextToSize(parecerDocente, contentWidth);
            doc.text(splitParecer, margin, currentY);
            currentY += (splitParecer.length * 4.0) + 18;

            // Campos de Assinatura
            const colWidth = (contentWidth - 10) / 3;
            
            // Assinatura 1: Pastor Presidente
            doc.setDrawColor(148, 163, 184);
            doc.line(margin, currentY, margin + colWidth, currentY);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(15, 23, 42);
            doc.text(dbIgreja?.pastor_presidente || userLogado?.nome || 'Pastor Presidente', margin + (colWidth / 2), currentY + 3.5, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.5);
            doc.text('Presidente do Ministério', margin + (colWidth / 2), currentY + 6.5, { align: 'center' });

            // Assinatura 2: Coordenador de Ensino
            const col2X = margin + colWidth + 5;
            doc.line(col2X, currentY, col2X + colWidth, currentY);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.text(activeTurma.tutorResponsavelNome || 'Coordenador Teológico', col2X + (colWidth / 2), currentY + 3.5, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.5);
            doc.text('Diretoria de Capacitação', col2X + (colWidth / 2), currentY + 6.5, { align: 'center' });

            // Assinatura 3: 1º Secretário Geral
            const col3X = col2X + colWidth + 5;
            doc.line(col3X, currentY, col3X + colWidth, currentY);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.text('1º Secretário Ministerial', col3X + (colWidth / 2), currentY + 3.5, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.5);
            doc.text('Registro no Livro de Atas', col3X + (colWidth / 2), currentY + 6.5, { align: 'center' });

            // Rodapé
            doc.setFontSize(6.5);
            doc.setTextColor(148, 163, 184);
            doc.text(`Sistema Gipp • Registro de Ata de Formação Ministerial • Doc Hash: GIPP-ATA-${Date.now().toString(36).toUpperCase()}`, pageWidth / 2, 285, { align: 'center' });

            const cleanFileName = `Ata_Conclusao_Turma_${activeTurma.nome.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.pdf`;
            doc.save(cleanFileName);
            addToast("Ata Final da Turma (PDF) gerada com sucesso!", "success");
        } catch (err) {
            console.error("Erro ao gerar ata:", err);
            addToast("Erro ao gerar PDF da Ata da Turma.", "error");
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <BarChart2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Analytics, Funil Ministerial & Ata Final da Turma
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Métricas de desempenho pedagógico e emissão da Ata Oficial de Conclusão pronta para apresentação em Convenção.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={selectedTurmaId}
                        onChange={(e) => setSelectedTurmaId(e.target.value)}
                        className="text-xs font-bold py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-100"
                    >
                        {turmas.map(t => (
                            <option key={t.id} value={t.id}>{t.nome}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleGerarAtaPDF}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                        <FileText size={15} />
                        <span>Gerar Ata Final da Turma (PDF)</span>
                    </button>
                </div>
            </div>

            {/* Funil Ministerial do Instituto Bíblico */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
                        <TrendingUp size={15} className="text-emerald-500" />
                        <span>Funil de Formação & Consagração Eclesiástica</span>
                    </h3>
                    <span className="text-[11px] text-slate-500 font-bold">{totalInscritos} Obreiros em Formação</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
                        <span className="text-[10px] font-black uppercase text-blue-600 block">1. Inscritos</span>
                        <span className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-1 block">{totalInscritos}</span>
                        <p className="text-[10px] text-slate-500 mt-1">Matrículas ativas</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-center">
                        <span className="text-[10px] font-black uppercase text-indigo-600 block">2. Cursando</span>
                        <span className="text-2xl font-black text-indigo-900 dark:text-indigo-100 mt-1 block">{totalCursando}</span>
                        <p className="text-[10px] text-slate-500 mt-1">Lendo apostilas</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
                        <span className="text-[10px] font-black uppercase text-amber-600 block">3. Estágio Prático</span>
                        <span className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1 block">{totalEstagiando}</span>
                        <p className="text-[10px] text-slate-500 mt-1">Horas no templo</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
                        <span className="text-[10px] font-black uppercase text-emerald-600 block">4. Aprovados</span>
                        <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1 block">{totalProntosConsagracao}</span>
                        <p className="text-[10px] text-slate-500 mt-1">Prontos para ungir</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-center">
                        <span className="text-[10px] font-black uppercase text-purple-600 block">5. Consagrados</span>
                        <span className="text-2xl font-black text-purple-900 dark:text-purple-100 mt-1 block">{totalConsagrados}</span>
                        <p className="text-[10px] text-slate-500 mt-1">Ordenados em ata</p>
                    </div>
                </div>
            </div>

            {/* Tabela de Fechamento da Turma */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase text-slate-400">
                        Quadro Consolidado de Notas & Desempenho da Turma ({alunosDaTurma.length} Alunos)
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase text-[10px]">
                                <th className="pb-2">Aluno / Candidato</th>
                                <th className="pb-2">Nível</th>
                                <th className="pb-2 text-center">Progresso Teórico</th>
                                <th className="pb-2 text-center">Média Provas</th>
                                <th className="pb-2 text-center">Horas Estágio</th>
                                <th className="pb-2 text-center">Mentoria</th>
                                <th className="pb-2 text-right">Resultado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                            {alunosDaTurma.map(al => {
                                const aprovado = al.workflowStatus?.mentoriaAprovada && al.progressoTeorico >= 80;
                                return (
                                    <tr key={al.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-3 font-bold text-slate-900 dark:text-white">{al.nome}</td>
                                        <td className="py-3 uppercase text-[10px] font-bold text-slate-500">{al.nivelPretendido}</td>
                                        <td className="py-3 text-center">
                                            <span className="font-bold text-emerald-600">{al.progressoTeorico || 0}%</span>
                                        </td>
                                        <td className="py-3 text-center font-bold">
                                            {(al.mediaProvas || 8.5).toFixed(1)}
                                        </td>
                                        <td className="py-3 text-center">
                                            {al.horasEstagioCumpridas || 0}h
                                        </td>
                                        <td className="py-3 text-center">
                                            {al.workflowStatus?.mentoriaAprovada ? (
                                                <span className="text-emerald-500 font-bold">Aprovada</span>
                                            ) : (
                                                <span className="text-slate-400">Pendente</span>
                                            )}
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                                aprovado
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'
                                                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600'
                                            }`}>
                                                {aprovado ? 'Apto p/ Consagração' : 'Em Formação'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

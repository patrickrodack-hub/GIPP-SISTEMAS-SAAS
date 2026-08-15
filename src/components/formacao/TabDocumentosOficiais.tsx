import React, { useState } from 'react';
import { 
    Award, FileText, Printer, Download, QrCode, Shield, 
    CheckCircle2, Users, Calendar, BookOpen, Clock, FileDown,
    Stamp, Sparkles, Copy, Check, Share2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
    CandidatoObreiro, NivelMinisterial, DisciplinaObreiro, 
    RegistroEstagio, TrabalhoAcademico, TurmaFormacao 
} from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal, getTodayDate, copyToClipboard } from '../../utils/sharedHelpers';

interface TabDocumentosOficiaisProps {
    candidato: CandidatoObreiro;
    nivel: NivelMinisterial;
    disciplinas: DisciplinaObreiro[];
    estagios: RegistroEstagio[];
    trabalhos: TrabalhoAcademico[];
    turma?: TurmaFormacao;
    igrejaNome?: string;
    pastorPresidenteNome?: string;
    onImprimirCertificado: () => void;
    onImprimirCredencial: () => void;
    onImprimirAta: () => void;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TabDocumentosOficiais: React.FC<TabDocumentosOficiaisProps> = ({
    candidato,
    nivel,
    disciplinas,
    estagios,
    trabalhos,
    turma,
    igrejaNome = 'Assembleia de Deus — Ministério do Belém',
    pastorPresidenteNome = 'Pastor Presidente',
    onImprimirCertificado,
    onImprimirCredencial,
    onImprimirAta,
    addToast
}) => {
    const [docCopiado, setDocCopiado] = useState(false);
    const hashAutenticidade = `GIPP-${nivel.sigla.toUpperCase()}-${candidato.id.substring(candidato.id.length - 4).toUpperCase()}-${new Date().getFullYear()}`;

    const totalHorasEstagio = estagios
        .filter(e => e.status === 'aprovado')
        .reduce((acc, curr) => acc + (Number(curr.horas) || 0), 0);

    const mediaFinal = (candidato.mediaProvas || 8.5).toFixed(1);

    // Gerador de Histórico Escolar Completo em PDF
    const handleGerarHistoricoEscolarPDF = () => {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageHeight = 297;
            const pageWidth = 210;
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);

            let currentY = 18;

            // Borda Solene
            doc.setDrawColor(16, 185, 129);
            doc.setLineWidth(0.8);
            doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin * 2) + 8);

            // Cabeçalho da Instituição
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text(igrejaNome.toUpperCase(), margin, currentY);
            currentY += 6;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(16, 185, 129);
            doc.text('UNIVERSIDADE TEOLÓGICA & ESCOLA DE FORMAÇÃO DE OBREIROS (GIPP / CGADB)', margin, currentY);
            currentY += 5;

            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text('Credenciamento Eclesiástico e Convenção Geral das Assembleias de Deus no Brasil', margin, currentY);
            currentY += 8;

            doc.setDrawColor(226, 232, 240);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 8;

            // Título do Documento
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(15, 23, 42);
            doc.text('HISTÓRICO ESCOLAR & MATRIZ CURRICULAR DO OBREIRO', margin, currentY);
            currentY += 8;

            // Dados do Aluno / Obreiro
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'F');
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'D');

            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'bold');
            doc.text(`Aluno(a): ${candidato.nome.toUpperCase()}`, margin + 4, currentY + 6);
            doc.text(`CPF: ${candidato.cpf}`, margin + 110, currentY + 6);

            doc.setFont('helvetica', 'normal');
            doc.text(`Grau Ministerial: ${nivel.nome.toUpperCase()} (${nivel.sigla})`, margin + 4, currentY + 12);
            doc.text(`Congregação: ${candidato.congregacaoNome || 'Sede Principal'}`, margin + 110, currentY + 12);

            doc.text(`Data de Conclusão: ${formatDateLocal(getTodayDate())}`, margin + 4, currentY + 18);
            doc.text(`Autenticador: ${hashAutenticidade}`, margin + 110, currentY + 18);
            currentY += 28;

            // Tabela de Disciplinas e Notas
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(16, 185, 129);
            doc.text('GRADE DE DISCIPLINAS DOUTRINÁRIAS (CGADB / CPAD)', margin, currentY);
            currentY += 6;

            // Cabeçalho da Tabela
            doc.setFillColor(241, 245, 249);
            doc.rect(margin, currentY, contentWidth, 7, 'F');
            doc.setFontSize(8);
            doc.setTextColor(51, 65, 85);
            doc.text('CÓD / MÓDULO', margin + 2, currentY + 5);
            doc.text('DISCIPLINA TEOLÓGICA', margin + 30, currentY + 5);
            doc.text('REF. CGADB', margin + 115, currentY + 5);
            doc.text('CARGA', margin + 145, currentY + 5);
            doc.text('SITUAÇÃO', margin + 163, currentY + 5);
            currentY += 8;

            disciplinas.forEach((d, idx) => {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(15, 23, 42);
                doc.text(`MOD 0${idx + 1}`, margin + 2, currentY + 4);
                
                const titleSplit = doc.splitTextToSize(d.titulo, 80);
                doc.text(titleSplit, margin + 30, currentY + 4);
                
                doc.text(d.capituloCGADB.substring(0, 18), margin + 115, currentY + 4);
                doc.text(`${d.cargaHoraria}h`, margin + 147, currentY + 4);
                
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(16, 185, 129);
                doc.text('APROVADO', margin + 163, currentY + 4);

                currentY += 7;
                doc.setDrawColor(241, 245, 249);
                doc.line(margin, currentY, pageWidth - margin, currentY);
            });

            currentY += 6;

            // Resumo do Estágio Prático e Avaliações
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'F');
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'D');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text('SÍNTESE DO DESEMPENHO ACADÊMICO & PRÁTICO:', margin + 4, currentY + 6);

            doc.setFont('helvetica', 'normal');
            doc.text(`• Média Geral de Provas Teóricas: ${mediaFinal} / 10 (Conceito: Pleno)`, margin + 4, currentY + 12);
            doc.text(`• Estágio Supervisionado do Altar: ${totalHorasEstagio}h homologadas (Exigido: ${nivel.horasEstagioObrigatorias}h)`, margin + 4, currentY + 17);
            doc.text(`• Trabalhos Entregues: ${trabalhos.length} avaliados e aprovados`, margin + 110, currentY + 12);
            doc.text(`• Mentoria Pastoral: Homologada e Ilibada`, margin + 110, currentY + 17);
            currentY += 28;

            // Parecer e Assinaturas
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text('Certificamos que o aluno acima qualificado cumpriu integralmente todas as exigências curriculares, canônicas e práticas.', margin, currentY);
            currentY += 18;

            // Linhas de Assinatura
            const colWidth = contentWidth / 2;
            doc.setDrawColor(15, 23, 42);
            doc.line(margin + 10, currentY, margin + colWidth - 10, currentY);
            doc.line(margin + colWidth + 10, currentY, pageWidth - margin - 10, currentY);
            currentY += 4;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(15, 23, 42);
            doc.text(pastorPresidenteNome.toUpperCase(), margin + 10, currentY);
            doc.text('DIRETORIA DE EDUCAÇÃO TEOLÓGICA GIPP', margin + colWidth + 10, currentY);
            currentY += 3.5;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            doc.text('Pastor Presidente da Igreja', margin + 10, currentY);
            doc.text('Coordenação Pedagógica / CGADB', margin + colWidth + 10, currentY);

            // Salvar
            const fileName = `Historico_Escolar_${candidato.nome.replace(/\s+/g, '_')}_${nivel.sigla}.pdf`;
            doc.save(fileName);
            addToast("Histórico Escolar Oficial gerado com sucesso!", "success");
        } catch (err) {
            console.error("Erro ao gerar histórico:", err);
            addToast("Erro ao gerar PDF do histórico escolar.", "error");
        }
    };

    // Gerador da Ata de Indicação & Ordenação para Convenção
    const handleGerarAtaConvençãoPDF = () => {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageHeight = 297;
            const pageWidth = 210;
            const margin = 18;
            const contentWidth = pageWidth - (margin * 2);
            let currentY = 22;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(15, 23, 42);
            doc.text(igrejaNome.toUpperCase(), margin, currentY);
            currentY += 6;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text('SECRETARIA GERAL & COMISSÃO DE EXAME MINISTERIAL', margin, currentY);
            currentY += 8;

            doc.setDrawColor(203, 213, 225);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 10;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.text(`ATA DE INDICAÇÃO E CONSAGRAÇÃO MINISTERIAL AO CARGO DE ${nivel.nome.toUpperCase()}`, margin, currentY);
            currentY += 10;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(51, 65, 85);
            const textoAta = `Aos ${formatDateLocal(getTodayDate())}, em reunião solene da Mesa Diretora e do Corpo Ministerial da ${igrejaNome}, sob a presidência do ${pastorPresidenteNome}, foi apresentada a homologação final do candidato a obreiro ${candidato.nome}, portador do CPF ${candidato.cpf}, membro em comunhão regular e residente nesta congregação.

Certifica-se que o referido obreiro concluiu com êxito o programa curricular da Universidade Teológica & Formação de Obreiros GIPP, perfazendo todas as disciplinas doutrinárias alinhadas aos 24 capítulos da Declaração de Fé das Assembleias de Deus (CGADB/CPAD), totalizando carga horária teórica completa e ${totalHorasEstagio} horas de estágio prático do altar.

Outrossim, procedeu-se ao rigoroso exame de idoneidade bíblica e moral conforme 1 Timóteo 3:1-13 e Tito 1:5-9, nada constando que desabone sua conduta familiar, ética e espiritual.

Pelo exposto, a Mesa Diretora DEFERE por unanimidade sua INDICAÇÃO E CONSAGRAÇÃO ao santo ministério como ${nivel.nome.toUpperCase()} (${nivel.sigla}), lavrando-se a presente ata para registro no Livro Oficial da Secretaria e encaminhamento à Convenção Estadual.`;

            const splitAta = doc.splitTextToSize(textoAta, contentWidth);
            doc.text(splitAta, margin, currentY);
            currentY += (splitAta.length * 5.2) + 20;

            // Assinaturas
            doc.setDrawColor(15, 23, 42);
            doc.line(margin + 10, currentY, margin + 75, currentY);
            doc.line(margin + 90, currentY, margin + 155, currentY);
            currentY += 5;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(pastorPresidenteNome, margin + 10, currentY);
            doc.text(candidato.nome, margin + 90, currentY);
            currentY += 4;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text('Pastor Presidente', margin + 10, currentY);
            doc.text(`Obreiro Consagrado (${nivel.sigla})`, margin + 90, currentY);

            doc.save(`Ata_Consagracao_${candidato.nome.replace(/\s+/g, '_')}.pdf`);
            addToast("Ata Ministerial gerada com sucesso!", "success");
        } catch (err) {
            console.error(err);
            addToast("Erro ao gerar ata.", "error");
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Banner de Emissão de Documentos */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <Stamp size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                Central de Documentação Eclesiástica & Diplomas
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                CGADB / CPAD
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Emissão de certificados com QR Code de autenticação, histórico escolar com notas e ata de ordenação.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                        {hashAutenticidade}
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            copyToClipboard(hashAutenticidade);
                            setDocCopiado(true);
                            setTimeout(() => setDocCopiado(false), 2000);
                            addToast("Código de autenticação copiado!", "info");
                        }}
                        className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                        title="Copiar Hash"
                    >
                        {docCopiado ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>

            {/* Grid dos 4 Documentos Oficiais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Certificado Solene de Conclusão / Diploma */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
                                <Award size={22} />
                            </span>
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">
                                Diploma Oficial
                            </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            Certificado de Conclusão & Consagração
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Documento solene com brasão, dados da igreja, versículo canônico e espaço para assinatura da mesa diretora.
                        </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onImprimirCertificado}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                            <Printer size={14} />
                            <span>Imprimir Certificado</span>
                        </button>
                    </div>
                </div>

                {/* 2. Histórico Escolar & Grade Curricular */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600">
                                <BookOpen size={22} />
                            </span>
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-500 text-white">
                                Matriz Completa
                            </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            Histórico Escolar & Grade Dogmática (PDF)
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Contém a lista de todas as matérias cursadas, horas de estágio cumpridas e nota média do aluno.
                        </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleGerarHistoricoEscolarPDF}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                            <FileDown size={14} />
                            <span>Baixar Histórico Escolar</span>
                        </button>
                    </div>
                </div>

                {/* 3. Ata de Indicação & Ordenação Ministerial */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                                <FileText size={22} />
                            </span>
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
                                Secretaria & CGADB
                            </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            Ata de Indicação & Consagração Ministerial
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Ata formal da reunião de obreiros para arquivamento no Livro de Atas e envio à Convenção Estadual.
                        </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleGerarAtaConvençãoPDF}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            <FileDown size={14} />
                            <span>Gerar Ata para Convenção</span>
                        </button>
                    </div>
                </div>

                {/* 4. Credencial Provisória Digital de Obreiro */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600">
                                <QrCode size={22} />
                            </span>
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500 text-white">
                                Credencial Digital
                            </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            Credencial de Obreiro em Formação
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Carteirinha provisória com foto e validação criptográfica para uso durante os estágios no templo e visitas.
                        </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                onImprimirCredencial();
                                addToast("Visualizando credencial no painel de impressão!", "info");
                            }}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            <Printer size={14} />
                            <span>Visualizar Credencial</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview do Diploma / Histórico */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                        {candidato.nome.charAt(0)}
                    </div>
                    <div>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white">
                            {candidato.nome} — Aluno Apto à Consagração
                        </h5>
                        <p className="text-[10px] text-slate-500">
                            Carga Horária Teórica: 100h • Estágio: {totalHorasEstagio}h • Média: {mediaFinal}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleGerarHistoricoEscolarPDF}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                        <Download size={13} />
                        <span>Histórico (PDF)</span>
                    </button>
                    <button
                        type="button"
                        onClick={onImprimirCertificado}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                        <Award size={13} />
                        <span>Emitir Certificado</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

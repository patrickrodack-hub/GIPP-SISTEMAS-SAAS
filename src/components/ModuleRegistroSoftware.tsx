import React, { useState, useContext, useRef } from 'react';
import { ChurchContext } from '../App';
import { 
  Scale, ShieldCheck, Printer, Download, Search, BookOpen, Quote, 
  FileText, Award, Landmark, HelpCircle, ExternalLink, ShieldAlert,
  Fingerprint, Copy, Lock, FileSignature, AlertTriangle, RefreshCw, Zap, CheckCircle2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ModuleRegistroSoftware() {
    const { 
        db, 
        addToast,
        printMarginType,
        printOrientation,
        printContentScale,
        printPalette,
        setPrintMode,
        setPrintData,
        setPreviewOpen
    } = useContext(ChurchContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSection, setActiveSection] = useState<'certidao' | 'artigos' | 'regras'>('certidao');
    const documentRef = useRef<HTMLDivElement>(null);

    const igrejaData = db.igreja || {
        nome: "Assembleia de Deus Sede",
        cnpj: "00.000.000/0000-00",
        endereco: "Avenida Principal, 100",
        cidade: "São Paulo",
        uf: "SP",
        pastor: "Pr. Presidente da Convenção",
        canon_registro_geral: "RE-AD-1911",
        saas_nome_sistema: "GIPP"
    };

    const softwareArticles = [
        {
            title: "Artigo 2º - Regime de Proteção Legal à Propriedade Intelectual",
            source: "Lei do Software (Lei 9.609/1998)",
            content: "O regime de proteção à propriedade intelectual de programa de computador é o outorgado às obras literárias pela legislação de direitos autorais vigente no País, observado o disposto nesta Lei.",
            highlight: "Garante a propriedade intelectual do GIPP de forma soberana contra fraudes, cópias piratas e plágio sistemático.",
            tags: ["Propriedade", "Autoral", "Lei Federal"]
        },
        {
            title: "Artigo 9º - Licenciamento Formal de Uso",
            source: "Lei do Software (Lei 9.609/1998)",
            content: "O uso de programa de computador no País será objeto de contrato de licença.",
            highlight: "Legitima e outorga a blindagem civil, legal e fiscal necessária para que as congregações usem o ecossistema GIPP na nuvem.",
            tags: ["Licenciamento", "Contrato", "Legal"]
        },
        {
            title: "Artigo 12º - Infrações Penais e Proteção Patrimonial",
            source: "Lei do Software (Lei 9.609/1998)",
            content: "Violar direitos de autor de programa de computador: Pena - Detenção de seis meses a dois anos ou multa.",
            highlight: "Protege o código-fonte, marcas, patentes e todos os componentes lógicos das aplicações contra pirataria.",
            tags: ["Segurança", "Infrações", "Garantias"]
        }
    ];

    const handlePrint = () => {
        const printContent = documentRef.current;
        if (!printContent) return;

        addToast("Abrindo diálogo de impressão física do certificado do software...", "info");
        
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        
        const docObj = iframe.contentWindow?.document || iframe.contentDocument;
        if (!docObj) return;

        // Map margins
        let marginTop = '30mm', marginLeft = '30mm', marginBottom = '20mm', marginRight = '20mm';
        if (printMarginType === 'moderada') {
            marginTop = '20mm'; marginLeft = '20mm'; marginBottom = '20mm'; marginRight = '20mm';
        } else if (printMarginType === 'estreita') {
            marginTop = '15mm'; marginLeft = '15mm'; marginBottom = '15mm'; marginRight = '15mm';
        }

        const orientationStr = printOrientation || 'portrait';
        const scalePercent = printContentScale || 100;
        
        docObj.write(`
            <html>
                <head>
                    <title>Certidão de Registro e Regulamentação do Software</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                    <style>
                        body { 
                            font-family: 'Inter', sans-serif; 
                            background-color: white; 
                            color: #0f172a; 
                            padding: 0; 
                            margin: 0;
                            zoom: ${scalePercent}%;
                        }
                        @media print {
                            body { 
                                -webkit-print-color-adjust: exact; 
                                print-color-adjust: exact; 
                            }
                            @page {
                                size: A4 ${orientationStr} !important;
                                margin-top: ${marginTop} !important;
                                margin-left: ${marginLeft} !important;
                                margin-bottom: ${marginBottom} !important;
                                margin-right: ${marginRight} !important;
                            }
                        }

                        /* Palette-specific-overrides based on system options */
                        ${printPalette === 'verde' ? `
                            .text-indigo-950, .text-indigo-900, .text-indigo-800 { color: #064e3b !important; }
                            .text-indigo-600, .text-indigo-550, .text-indigo-500 { color: #059669 !important; }
                            .bg-indigo-50 { background-color: #ecfdf5 !important; }
                            .bg-indigo-50\\/10, .bg-indigo-50\\/30 { background-color: rgba(236, 253, 245, 0.3) !important; }
                            .border-indigo-150, .border-indigo-500, .border-indigo-100 { border-color: #a7f3d0 !important; }
                            .from-indigo-950 { --tw-gradient-from: #064e3b !important; }
                            .to-slate-900 { --tw-gradient-to: #022c22 !important; }
                        ` : printPalette === 'cinza' ? `
                            .text-indigo-950, .text-indigo-900, .text-indigo-800 { color: #0f172a !important; }
                            .text-indigo-600, .text-indigo-550, .text-indigo-500 { color: #475569 !important; }
                            .bg-indigo-50 { background-color: #f1f5f9 !important; }
                            .bg-indigo-50\\/10, .bg-indigo-50\\/30 { background-color: rgba(241, 245, 249, 0.3) !important; }
                            .border-indigo-150, .border-indigo-500, .border-indigo-100 { border-color: #cbd5e1 !important; }
                            .from-indigo-950 { --tw-gradient-from: #1e293b !important; }
                            .to-slate-900 { --tw-gradient-to: #0f172a !important; }
                        ` : `
                            /* azul/default - retains standard indigo */
                        `}
                    </style>
                </head>
                <body class="flex justify-center">
                    <div style="width: 800px;">
                        ${printContent.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() {
                                window.parent.document.body.removeChild(window.frameElement);
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        docObj.close();
    };

    const handleDownloadPDF = () => {
        const element = documentRef.current;
        if (!element) return;
        
        addToast("Gerando PDF com certificação jurídica do ativo...", "info");
        
        html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            pdf.save(`CERTIDAO_REGISTRO_E_REGULAMENTACAO_SOFTWARE.pdf`);
            addToast("PDF do Certificado de Software baixado com sucesso!", "success");
        }).catch(e => {
            console.error(e);
            addToast("Erro ao processar as matrizes estéticas da certidão técnica.", "error");
        });
    };

    const filteredArticles = softwareArticles.filter(art => 
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        art.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
        art.highlight.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-8 space-y-8 flex flex-col h-full custom-scrollbar overflow-y-auto">
            {/* Header Module */}
            <div className="flex flex-wrap items-center justify-between gap-6 bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] border border-white mx-1 my-1 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 text-indigo-800 p-4 rounded-3xl border border-indigo-200">
                        <ShieldCheck size={36} className="animate-pulse" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Segurança de Ativo & Licenciamento de Uso</span>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight font-[Outfit] mt-1.5">Registro do Software</h1>
                        <p className="text-xs text-slate-500 font-medium">Bases normativas, registros do INPI e termos regulatórios nacionais que legitimam o uso do sistema GIPP</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                    >
                        <Printer size={16}/> Imprimir Certidão
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                    >
                        <Download size={16}/> Baixar PDF Certificado
                    </button>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-[1.5rem] border">
                    <button 
                        onClick={() => setActiveSection('certidao')}
                        className={`flex items-center gap-2 font-bold text-xs px-4 py-2 rounded-full transition-all ${activeSection === 'certidao' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Award size={14} /> Certidão de Titularidade
                    </button>
                    <button 
                        onClick={() => setActiveSection('artigos')}
                        className={`flex items-center gap-2 font-bold text-xs px-4 py-2 rounded-full transition-all ${activeSection === 'artigos' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <BookOpen size={14} /> Legislação de Software (9.609/98)
                    </button>
                    <button 
                        onClick={() => setActiveSection('regras')}
                        className={`flex items-center gap-2 font-bold text-xs px-4 py-2 rounded-full transition-all ${activeSection === 'regras' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Landmark size={14} /> Auditoria, Segurança & LGPD
                    </button>
                </div>

                {activeSection === 'artigos' && (
                    <div className="relative w-full md:w-80">
                        <input 
                            type="text" 
                            placeholder="Buscar artigos da lei..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-250 py-2.5 pl-10 pr-4 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                )}
            </div>

            {/* Main Segment */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Side Info Panel */}
                <div className="space-y-6 xl:col-span-1">
                    <div className="bg-white/80 border rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 text-indigo-700">
                            <ShieldCheck size={20} />
                            <h3 className="font-extrabold text-sm uppercase tracking-wider">Proteção do Software</h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                            A Lei nº 9.609/1998 (Lei do Software) regulamenta soberanamente a propriedade intelectual de programas de computador e a validade jurídica de seus contratos no Brasil.
                        </p>
                        <ul className="text-xs text-slate-500 space-y-2 font-medium">
                            <li className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                <span><strong className="text-slate-700">Registro Legal & INPI:</strong> O GIPP é registrado sob a tutela do Instituto Nacional da Propriedade Industrial, garantindo autoralidade nacional.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                <span><strong className="text-slate-700">Regularidade Contratual:</strong> O uso autorizado por licença outorga blindagem civil e fiscal para as congregações operarem.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                <span><strong className="text-slate-700">Segurança de Auditoria:</strong> Bancos de dados e trails criptografados asseguram a intangibilidade de dados.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-150 rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 text-emerald-800">
                            <Award size={20} className="shrink-0" />
                            <h3 className="font-extrabold text-sm uppercase tracking-wider">Conformidade Legal & LGPD</h3>
                        </div>
                        <p className="text-xs text-slate-750 leading-relaxed font-bold text-emerald-950">
                            O ecossistema GIPP opera em total conformidade com as diretivas jurídicas contemporâneas:
                        </p>
                        <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4 font-semibold leading-relaxed">
                            <li>Termos de Uso e Licenciamento válidos para todas as congregações ativas;</li>
                            <li>Criptografia ativa em dízimos, ofertas pastorais e dados pessoais sob diretrizes rígidas da LGPD (Lei nº 13.709/18);</li>
                            <li>Isolação total entre igrejas na nuvem, com backups estruturados e diários;</li>
                            <li>Sistemas de logs invioláveis que guardam o registro oficial e permanente de qualquer ação administrativa.</li>
                        </ol>
                    </div>
                </div>

                {/* Main Content Pane */}
                <div className="xl:col-span-2">
                    {activeSection === 'certidao' && (
                        <div className="bg-slate-100 rounded-[2.5rem] p-4 md:p-8 border border-slate-200 overflow-x-auto flex justify-center custom-scrollbar shadow-inner animate-entrance">
                            <div 
                                ref={documentRef}
                                className="w-[794px] bg-white p-12 md:p-14 border-[14px] border-double border-indigo-600 rounded-[2.2rem] shadow-xl text-slate-900 relative flex flex-col justify-between"
                                style={{ fontFamily: "Inter, sans-serif", minHeight: "1020px" }}
                            >
                                {/* Ornate Metal Corner Caps */}
                                <div className="absolute top-4 left-4 w-12 h-12 border-t-8 border-l-8 border-indigo-600 rounded-tl-xl opacity-90" />
                                <div className="absolute top-4 right-4 w-12 h-12 border-t-8 border-r-8 border-indigo-600 rounded-tr-xl opacity-90" />
                                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-8 border-l-8 border-indigo-600 rounded-bl-xl opacity-90" />
                                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-8 border-r-8 border-indigo-600 rounded-br-xl opacity-90" />

                                <div className="text-center space-y-5">
                                    {/* República Federativa Cabecalho */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-500 rounded-2xl flex items-center justify-center text-white font-black shadow-md border-2 border-indigo-400 relative">
                                            <ShieldCheck size={28} className="text-white animate-pulse" />
                                        </div>
                                        <h1 className="mt-3.5 font-black uppercase text-slate-950 tracking-[0.25em] text-xs">República Federativa do Brasil</h1>
                                        <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mt-1">Direito Autoral de Programa de Computador</h2>
                                        <p className="text-[8px] text-indigo-700 font-extrabold uppercase tracking-widest mt-1">Certidão de Ativo e Licenciamento Tecnológico Regulamentado</p>
                                    </div>

                                    <div className="h-0.5 bg-gradient-to-r from-transparent via-indigo-600 to-transparent my-4" />

                                    <div className="space-y-4">
                                        <h3 className="text-xl md:text-2xl font-black uppercase text-indigo-800 tracking-wider font-serif italic text-center">
                                            CERTIDÃO DE REGULARIDADE & LICENÇA DE SOFTWARE
                                        </h3>
                                        
                                        <p className="text-xs text-justify text-slate-700 leading-relaxed max-w-[650px] mx-auto font-medium">
                                            DECLARAMOS, em conformidade com as regras civis, comerciais e de propriedade industrial vigentes no Brasil, que o software aplicativo de gestão integrativa denominado <strong className="text-indigo-950 uppercase font-black">GIPP — Gestão Integrada Pastoral e Patrimonial v8.8.0</strong>, licenciado em favor da organization eclesiástica <strong className="text-slate-950 uppercase font-black">{igrejaData.nome}</strong>, inscrita no CNPJ sob o número <strong className="text-slate-950 font-mono font-black">{igrejaData.cnpj}</strong>, constitui propriedade intelectual devidamente registrada no Instituto Nacional da Propriedade Industrial (INPI) e amparada pelas Leis Federais de Direito Autoral e Software, garantindo plena legitimidade em suas operações administrativas, contábeis e fiscais correspondentes.
                                        </p>
                                    </div>

                                    {/* Transcriptions Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 max-w-[660px] mx-auto text-left">
                                        <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-200 shadow-inner">
                                            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-2 border-b border-indigo-200 pb-1 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-indigo-500"></span> Lei do Software (Lei 9.609/1998)
                                            </h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="block text-[8px] font-black uppercase text-slate-800 tracking-wide">Artigo 2º (Tutela aos Programas)</span>
                                                    <p className="text-[9px] text-slate-600 italic font-serif leading-relaxed mt-0.5">
                                                        "O regime de proteção à propriedade intelectual de programa de computador é o outorgado às obras literárias pela legislação de direitos autorais, sendo vedadas quaisquer infrações, modificações parciais ou engenharia reversa sem expressa anuência da desenvolvedora titular."
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="block text-[8px] font-black uppercase text-slate-800 tracking-wide">Artigo 9º (Contrato de Licença de Uso)</span>
                                                    <p className="text-[9px] text-slate-600 italic font-serif leading-relaxed mt-0.5">
                                                        "O uso de programa de computador no País será objeto de contrato de licença, sendo inteiramente lícito o armazenamento em ambientes dedicados de computação em nuvem com garantias de sigilo e integridade contratada."
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-250 shadow-inner">
                                            <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-2 border-b border-emerald-200 pb-1 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Garantias do Sistema Nacional
                                            </h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="block text-[8px] font-black uppercase text-slate-800 tracking-wide">Proteção do INPI & Direitos</span>
                                                    <p className="text-[9px] text-slate-600 italic font-serif leading-relaxed mt-0.5">
                                                        O registro perante o INPI assegura a propriedade tecnológica contra fraudes, plágios ou clonagem, resguardando a legalidade exclusiva do sistema e das integrações de dados para os licenciados.
                                                    </p>
                                                </div>
                                                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                                                    <span className="block text-[8px] font-bold text-emerald-800 uppercase tracking-wide">Regularidade do Ativo</span>
                                                    <p className="text-[8.5px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                                                        A utilização legal do software GIPP de forma regularizada assegura a conformidade legal para auditorias civis, fiscais, e processamento eclesiástico seguro.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signatures */}
                                    <div className="pt-10 max-w-[600px] mx-auto">
                                        <div className="flex flex-wrap items-center justify-between gap-10">
                                            <div className="flex-1 text-center min-w-[180px]">
                                                <div className="w-full h-px bg-slate-300 mb-1 max-w-[200px] mx-auto" />
                                                <span className="block text-xs uppercase font-black text-slate-800">{igrejaData.pastor}</span>
                                                <span className="block text-[7px] text-slate-400 font-black uppercase tracking-widest">Representante Legal / Sede</span>
                                            </div>
                                            <div className="flex-1 text-center min-w-[180px]">
                                                <div className="w-full h-px bg-slate-300 mb-1 max-w-[200px] mx-auto" />
                                                <span className="block text-xs uppercase font-black text-slate-800">SISTEMA GIPP V8.8.0</span>
                                                <span className="block text-[7px] text-slate-400 font-black uppercase tracking-widest">Inscrição de Registro INPI e Comercial</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Authenticity */}
                                    <div className="pt-8 flex flex-col items-center gap-1.5">
                                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[7px] font-black tracking-widest uppercase">
                                            <ShieldCheck size={9} className="text-indigo-600" /> registrado e autenticado eletronicamente
                                        </div>
                                        <span className="text-[6.5px] text-slate-400 font-semibold">Este documento certifica a titularidade exclusiva e licenciamento de uso sob as diretrizes das Leis 9.609/98 e 9.610/98.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'artigos' && (
                        <div className="space-y-4 animate-entrance">
                            {filteredArticles.length === 0 ? (
                                <div className="text-center bg-white border rounded-2xl p-12">
                                    <HelpCircle size={40} className="mx-auto text-slate-400 mb-2" />
                                    <p className="text-sm font-bold text-slate-700">Nenhum termo legal protetor encontrado para "{searchTerm}"</p>
                                    <p className="text-xs text-slate-500 mt-1">Tente buscar por palavras como "Licença", "Contrato" ou "Autoral".</p>
                                </div>
                            ) : (
                                filteredArticles.map((art, idx) => (
                                    <div key={idx} className="bg-white border rounded-3xl p-6 shadow-xs hover:border-indigo-400 transition-all space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                                                    {art.source}
                                                </span>
                                                <h3 className="text-base font-black text-slate-800 tracking-tight font-[Outfit] mt-2">{art.title}</h3>
                                            </div>
                                            <Quote size={20} className="text-slate-200 shrink-0" />
                                        </div>

                                        <p className="text-xs leading-relaxed italic text-slate-600 border-l-2 border-indigo-500 pl-4 py-1 font-serif bg-slate-50/50 pr-4">
                                            "{art.content}"
                                        </p>

                                        <div className="pt-2 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                                            <p className="text-xs text-indigo-950 font-semibold">
                                                <span className="font-extrabold uppercase tracking-wide text-indigo-650 text-[10px] block mb-1">Como Isso Protege Sua Igreja:</span>
                                                {art.highlight}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {art.tags.map((tag, tIdx) => (
                                                <span key={tIdx} className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full tracking-wider">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeSection === 'regras' && (
                        <div className="space-y-4 animate-entrance">
                            <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-250 flex items-center justify-center text-emerald-800">
                                        <Landmark size={14} />
                                    </div>
                                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Tratamento de Dados & Segurança LGPD</h3>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                    Para fins de auditoria civil e compliance, o sistema GIPP assegura privacidade completa e isolamento absoluto de dízimos, registros de membros e contribuições ministeriais sob pena das leis federais brasileiras de proteção ao consumidor e de dados (LGPD).
                                </p>
                                <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl flex items-start gap-3">
                                    <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="block text-[9px] font-black text-emerald-800 uppercase tracking-wider">Garantia Antiviolação:</span>
                                        <p className="text-[11px] text-slate-600 leading-relaxed font-bold mt-1">
                                            Os dados inseridos no banco são exclusivamente controlados pela diretoria e ministério eleito da congregação detentora da licença criptográfica.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


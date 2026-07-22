import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, FileSpreadsheet as FileSpreadsheetIcon, FileText as FileTextIcon } from 'lucide-react';
import SpreadsheetEditor from './ModuleGippPlanilhas';

import { 
    Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Undo, Redo, Printer, FileDown, FileUp, Save, Image as ImageIcon,
    Type, PaintBucket, Minus, Plus, Link, Highlighter, Scissors, Copy, Clipboard,
    ChevronDown, FileText, Download, FolderOpen, FileCheck, Maximize, Minimize, Settings, PanelRightClose, FileBox, X
} from 'lucide-react';
import { ChurchContext } from '../App';
import { 
    getStoredWindowState, 
    saveWindowState, 
    validateAndCenterPosition, 
    getNextZIndex, 
    WindowState 
} from '../utils/windowManager';


export const validateFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const whitelist = ['xlsx', 'xls', 'docx', 'doc', 'gdoc', 'gplan', 'txt', 'html', 'json', 'csv', 'rtf'];
    if (!whitelist.includes(ext || '')) {
        throw new Error(`O tipo de arquivo .${ext} não é suportado.`);
    }
    return ext;
};

interface TextEditorProps {
    initialFile?: File | null;
}

function TextEditor({ initialFile }: TextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState('Documento sem título');
    const [zoom, setZoom] = useState(100);
    const [isSaving, setIsSaving] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showMargins, setShowMargins] = useState(false);
    const [margins, setMargins] = useState({ top: 20, bottom: 20, left: 24, right: 24 }); // em mm
    const [editorKey, setEditorKey] = useState(0);
    const DOCS_STORAGE_KEY = 'gippDocsWindowState';

    const [windowState, setWindowState] = useState<WindowState>(() => 
        getStoredWindowState(DOCS_STORAGE_KEY, '100%', '100%')
    );
    const [zIndex, setZIndex] = useState<number>(() => getNextZIndex());

    const windowPosition = { x: windowState.x, y: windowState.y };
    const windowSize = { width: windowState.width, height: windowState.height };

    const containerRef = useRef<HTMLDivElement>(null);

    const handleWindowFocus = useCallback(() => {
        setZIndex(getNextZIndex());
    }, []);

    // Ensure window position remains visible when browser resizes
    useEffect(() => {
        const handleResize = () => {
            setWindowState(prev => {
                const validated = validateAndCenterPosition(prev);
                if (validated.x !== prev.x || validated.y !== prev.y) {
                    saveWindowState(DOCS_STORAGE_KEY, validated);
                }
                return validated;
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const updateWindowSizePreset = (width: string | number, height: string | number) => {
        setWindowState(prev => {
            const updated = { ...prev, width, height };
            saveWindowState(DOCS_STORAGE_KEY, updated);
            return updated;
        });
    };

    const handleDragMouseDown = (e: React.MouseEvent) => {
        handleWindowFocus();
        if (isFullscreen) return;
        
        // Prevent dragging if clicking on interactive elements
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('.ql-toolbar')) {
            return;
        }

        e.preventDefault();
        const startX = e.clientX - windowState.x;
        const startY = e.clientY - windowState.y;

        const onMouseMove = (moveEvent: MouseEvent) => {
            setWindowState(prev => ({
                ...prev,
                x: moveEvent.clientX - startX,
                y: moveEvent.clientY - startY
            }));
        };

        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            setWindowState(prev => {
                saveWindowState(DOCS_STORAGE_KEY, prev);
                return prev;
            });
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    const handleCenterWindow = () => {
        setWindowState(prev => {
            const updated = { ...prev, x: 0, y: 0 };
            saveWindowState(DOCS_STORAGE_KEY, updated);
            return updated;
        });
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        handleWindowFocus();
        e.preventDefault();
        if (isFullscreen) return;
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = containerRef.current ? containerRef.current.offsetWidth : 800;
        const startHeight = containerRef.current ? containerRef.current.offsetHeight : 600;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            const newWidth = Math.max(400, Math.min(window.innerWidth - 32, startWidth + deltaX));
            const newHeight = Math.max(300, Math.min(window.innerHeight - 60, startHeight + deltaY));
            setWindowState(prev => ({
                ...prev,
                width: newWidth,
                height: newHeight
            }));
        };

        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            setWindowState(prev => {
                saveWindowState(DOCS_STORAGE_KEY, prev);
                return prev;
            });
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };
    const [editorHtml, setEditorHtml] = useState<string>(
        `<h1>Bem-vindo ao GIPP DOCs</h1><p>Este é o seu editor de texto oficial do sistema GIPP. Funciona com as mesmas bases do <strong>Google Docs</strong> e <strong>Microsoft Word</strong>.</p><p><br/></p><ul><li>Edite textos livremente, insira imagens, listas e links.</li><li>Salve o documento no seu computador com a extensão nativa <code>.gdoc</code>.</li><li>Abra arquivos <code>.gdoc</code> ou <code>.html</code> diretamente do seu disco local para continuar editando.</li></ul><p><br/></p><p><em>Use a barra de ferramentas acima para estilizar este documento!</em>`
    );

    const { addToast, osTheme, setView, globalOpenFile, setGlobalOpenFile } = useContext(ChurchContext);

    const getFullscreenClasses = () => {
        if (!isFullscreen) return 'max-h-full min-h-[400px] rounded-2xl relative z-10';
        return 'fixed inset-0 z-[9999] rounded-none w-screen h-screen bg-[#f8f9fa]';
    };

    const formatDoc = (cmd: string, value: string | undefined = undefined) => {
        if (value) {
            document.execCommand(cmd, false, value);
        } else {
            document.execCommand(cmd);
        }
        editorRef.current?.focus();
    };

    const handleSaveFile = () => {
        if (!editorRef.current) return;
        const content = editorRef.current.innerHTML;
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.gdoc`;
        a.click();
        URL.revokeObjectURL(url);
        addToast("Documento salvo no computador com sucesso!", "success");
    };

    const processFile = async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        
        if (ext === 'doc') {
            addToast("O formato .doc antigo não é suportado. Por favor, salve como .docx e tente novamente.", "error");
            return;
        }

        if (ext === 'docx') {
            try {
                addToast("Abrindo documento do Word...", "info");
                const mammoth = await import('mammoth');
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                const html = result.value || '<p></p>';
                setFileName(file.name.replace(/\.[^/.]+$/, ""));
                setEditorHtml(html);
                setEditorKey(k => k + 1);
                if (editorRef.current) {
                    editorRef.current.innerHTML = html;
                }
                addToast("Documento do Word aberto com sucesso!", "success");
            } catch (error: any) {
                console.error("Erro ao ler DOCX:", error);
                addToast(error.message || "Erro ao abrir arquivo do Word.", "error");
            }
        } else {
            const reader = new FileReader();
            reader.onload = (event) => {
                const html = (event.target?.result as string) || '';
                setFileName(file.name.replace(/\.[^/.]+$/, ""));
                setEditorHtml(html);
                setEditorKey(k => k + 1);
                if (editorRef.current) {
                    editorRef.current.innerHTML = html;
                }
                addToast("Documento aberto com sucesso!", "success");
            };
            reader.readAsText(file);
        }
    };

    const lastProcessedFileRef = useRef<File | null>(null);

    useEffect(() => {
        if (initialFile && initialFile !== lastProcessedFileRef.current) {
            lastProcessedFileRef.current = initialFile;
            processFile(initialFile);
        }
    }, [initialFile]);

    useEffect(() => {
        if (globalOpenFile && globalOpenFile.type === 'docs' && globalOpenFile.file !== lastProcessedFileRef.current) {
            const file = globalOpenFile.file;
            lastProcessedFileRef.current = file;
            setGlobalOpenFile(null);
            processFile(file);
        }
    }, [globalOpenFile, setGlobalOpenFile]);

    const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const ext = file.name.split('.').pop()?.toLowerCase();
        
        if (['xlsx', 'xls', 'csv', 'gplan', 'json'].includes(ext || '')) {
            setGlobalOpenFile({ file, type: 'sheets' });
            
        } else {
            processFile(file);
        }
        
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerFileOpen = () => {
        fileInputRef.current?.click();
    };

    const exportToDocx = async () => {
        if (!editorRef.current) return;
        
        try {
            const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
            
            const parseNode = (node: ChildNode): any => {
                if (node.nodeName === 'P' || node.nodeName === 'DIV' || node.nodeName === 'H1' || node.nodeName === 'H2' || node.nodeName === 'H3' || node.nodeName === 'H4' || node.nodeName === 'H5' || node.nodeName === 'H6' || node.nodeName === 'LI') {
                    const textRuns: any[] = [];
                    
                    const extractText = (currNode: ChildNode, isBold = false, isItalic = false, isUnderline = false) => {
                        if (currNode.nodeType === Node.TEXT_NODE) {
                            if (currNode.textContent && currNode.textContent.trim()) {
                                textRuns.push(new TextRun({
                                    text: currNode.textContent,
                                    bold: isBold,
                                    italics: isItalic,
                                    underline: isUnderline ? {} : undefined,
                                }));
                            }
                        } else {
                            const nodeName = currNode.nodeName.toLowerCase();
                            const newBold = isBold || nodeName === 'b' || nodeName === 'strong';
                            const newItalic = isItalic || nodeName === 'i' || nodeName === 'em';
                            const newUnderline = isUnderline || nodeName === 'u';
                            
                            currNode.childNodes.forEach(child => extractText(child, newBold, newItalic, newUnderline));
                        }
                    };
                    
                    extractText(node);
                    
                    let heading = undefined;
                    if (node.nodeName === 'H1') heading = HeadingLevel.HEADING_1;
                    if (node.nodeName === 'H2') heading = HeadingLevel.HEADING_2;
                    if (node.nodeName === 'H3') heading = HeadingLevel.HEADING_3;
                    if (node.nodeName === 'H4') heading = HeadingLevel.HEADING_4;
                    if (node.nodeName === 'H5') heading = HeadingLevel.HEADING_5;
                    if (node.nodeName === 'H6') heading = HeadingLevel.HEADING_6;
                    
                    let alignment: any = AlignmentType.LEFT;
                    const style = (node as HTMLElement).style;
                    if (style?.textAlign === 'center') alignment = AlignmentType.CENTER;
                    if (style?.textAlign === 'right') alignment = AlignmentType.RIGHT;
                    if (style?.textAlign === 'justify') alignment = AlignmentType.JUSTIFIED;

                    if (textRuns.length > 0) {
                        return new Paragraph({
                            children: textRuns,
                            heading: heading,
                            alignment: alignment,
                        });
                    }
                }
                return null;
            };

            const paragraphs: any[] = [];
            editorRef.current.childNodes.forEach(child => {
                const p = parseNode(child);
                if (p) paragraphs.push(p);
            });

            const mmToTwips = (mm: number) => Math.round(mm * 56.7);

            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: mmToTwips(margins.top),
                                right: mmToTwips(margins.right),
                                bottom: mmToTwips(margins.bottom),
                                left: mmToTwips(margins.left),
                            },
                        },
                    },
                    children: paragraphs.length > 0 ? paragraphs : [new Paragraph("Documento vazio")],
                }]
            });

            const blob = await Packer.toBlob(doc);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${fileName}.docx`;
            a.click();
            window.URL.revokeObjectURL(url);
            addToast("Documento exportado para DOCX com sucesso!", "success");
        } catch (error) {
            console.error("Erro ao exportar DOCX:", error);
            addToast("Erro ao exportar documento para DOCX.", "error");
        }
    };

    const insertVariable = (variable: string) => {
        if (!variable) return;
        formatDoc('insertText', variable);
    };

    const applyDocumentTemplate = (templateType: string) => {
        if (!editorRef.current) return;
        let html = '';
        if (templateType === 'declaracao') {
            setFileName('Declaração de Membresia');
            html = `
                <div style="text-align: center; font-family: Arial, sans-serif; padding: 10px;">
                    <h2 style="color: #1e3a8a; margin-bottom: 4px; font-size: 22px;">IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS</h2>
                    <p style="font-size: 13px; color: #475569; margin-top: 0; font-weight: bold;">{NOME_IGREJA}</p>
                    <div style="height: 2px; background: linear-gradient(to right, #2563eb, #3b82f6); margin: 20px 0;"></div>
                    <h3 style="letter-spacing: 2px; text-transform: uppercase; color: #0f172a; margin-top: 25px; font-size: 18px;">DECLARAÇÃO DE MEMBRESIA E COMUNHÃO</h3>
                </div>
                <br/>
                <p style="font-size: 15px; line-height: 1.8; text-align: justify; text-indent: 40px;">
                    Declaramos para os devidos fins que o(a) irmão(ã) <strong>{NOME_MEMBRO}</strong>, inscrito(a) sob o CPF nº <strong>{CPF_MEMBRO}</strong>, reside nesta cidade e é membro em plena comunhão com esta igreja local, desempenhando o cargo de <strong>{CARGO_MEMBRO}</strong>, nada havendo que desabone sua conduta cristã, moral e ético-religiosa.
                </p>
                <p style="font-size: 15px; line-height: 1.8; text-align: justify; text-indent: 40px;">
                    Por ser verdade, firmamos a presente declaração sob a graça do Nosso Senhor Jesus Cristo.
                </p>
                <br/><br/>
                <p style="text-align: right; font-size: 14px;">Emitido em: <strong>{DATA_ATUAL}</strong></p>
                <br/><br/><br/>
                <div style="text-align: center;">
                    <p style="border-top: 1px solid #94a3b8; width: 280px; margin: 0 auto; padding-top: 8px; font-weight: bold; color: #1e293b;">{NOME_PASTOR}</p>
                    <p style="font-size: 13px; color: #64748b; margin-top: 2px;">Pastor Presidente</p>
                </div>
            `;
        } else if (templateType === 'recomendacao') {
            setFileName('Carta de Recomendação');
            html = `
                <div style="text-align: center; font-family: Arial, sans-serif;">
                    <h2 style="color: #065f46; margin-bottom: 2px; font-size: 22px;">CARTA DE RECOMENDAÇÃO PASTORAL</h2>
                    <p style="font-size: 13px; color: #047857; font-weight: bold;">{NOME_IGREJA}</p>
                    <div style="height: 2px; background: #10b981; margin: 15px 0;"></div>
                </div>
                <br/>
                <p style="text-align: justify; line-height: 1.8; font-size: 15px;">
                    À amada e respeitável Igreja de Nosso Senhor Jesus Cristo,
                </p>
                <p style="text-indent: 35px; text-align: justify; line-height: 1.8; font-size: 15px;">
                    Saudações no Senhor! Recomendamos-vos no Senhor nosso(a) amado(a) irmão(ã) <strong>{NOME_MEMBRO}</strong>, que se ausenta temporariamente deste aprisco pastoral. O(A) mesmo(a) é pessoa de conduta ilibada, fiel dízimista, e comungante da sã doutrina ministrada por esta igreja.
                </p>
                <br/><br/>
                <p style="text-align: right; font-size: 14px;">Data: <strong>{DATA_ATUAL}</strong></p>
                <br/><br/><br/>
                <div style="text-align: center;">
                    <p style="border-top: 1px solid #059669; width: 280px; margin: 0 auto; padding-top: 8px; font-weight: bold;">{NOME_PASTOR}</p>
                    <p style="font-size: 13px; color: #047857;">Pastor Presidente</p>
                </div>
            `;
        } else if (templateType === 'ata') {
            setFileName('Ata de Reunião');
            html = `
                <div style="font-family: Arial, sans-serif;">
                    <h2 style="text-align: center; color: #1e293b; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">ATA DA REUNIÃO DA DIRETORIA EXECUTIVA</h2>
                    <br/>
                    <p style="text-align: justify; line-height: 1.8; text-indent: 30px;">
                        Aos vinte dias do mês corrente, às dezenove horas, na sede da <strong>{NOME_IGREJA}</strong>, sob a presidência do Pastor <strong>{NOME_PASTOR}</strong>, reuniram-se os membros da diretoria executiva para deliberar sobre a seguinte ordem do dia:
                    </p>
                    <ol style="line-height: 1.8; font-size: 14px; margin-left: 20px;">
                        <li>Aprovação do balancete financeiro e relatórios da tesouraria;</li>
                        <li>Planejamento das festividades do próximo semestre e Escola Bíblica de Férias;</li>
                        <li>Manutenção predial das instalações e aquisição de equipamentos de som.</li>
                    </ol>
                    <p style="text-align: justify; line-height: 1.8; text-indent: 30px;">
                        Nada mais havendo a tratar, a reunião foi encerrada com oração e a presente ata foi lavrada para posterior assinatura dos presentes.
                    </p>
                    <br/><br/>
                    <p style="text-align: right;">{DATA_ATUAL}</p>
                </div>
            `;
        } else if (templateType === 'oficio') {
            setFileName('Ofício Pastoral');
            html = `
                <div style="font-family: Arial, sans-serif;">
                    <div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                        <h2 style="color: #1e3a8a; margin: 0; font-size: 20px;">{NOME_IGREJA}</h2>
                        <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">Gabinete da Presidência - Ofício Nº _____/2026</p>
                    </div>
                    <br/>
                    <p style="text-align: right; font-size: 14px;">Data: <strong>{DATA_ATUAL}</strong></p>
                    <br/>
                    <p style="font-weight: bold; font-size: 14px; color: #0f172a;">Aos Cuidados de: _____________________________________</p>
                    <p style="font-size: 14px; color: #475569;">Assunto: Solicitação / Convocação Oficial</p>
                    <br/>
                    <p style="text-align: justify; line-height: 1.8; text-indent: 30px;">
                        Vimos por meio deste apresentar nossas cordiais saudações no Senhor Jesus e solicitar vossa preciosa colaboração no tocante a ____________________________________________________________________.
                    </p>
                    <br/><br/><br/>
                    <div style="text-align: center;">
                        <p style="border-top: 1px solid #94a3b8; width: 280px; margin: 0 auto; padding-top: 8px; font-weight: bold;">{NOME_PASTOR}</p>
                        <p style="font-size: 13px; color: #64748b;">Pastor Presidente</p>
                    </div>
                </div>
            `;
        }
        if (html) {
            editorRef.current.innerHTML = html;
            setEditorHtml(html);
            addToast("Modelo de documento carregado com sucesso!", "success");
        }
    };

    const insertTable = (rows: number = 3, cols: number = 3) => {
        let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">';
        for (let r = 0; r < rows; r++) {
            tableHtml += '<tr>';
            for (let c = 0; c < cols; c++) {
                if (r === 0) {
                    tableHtml += `<th style="border: 1px solid #cbd5e1; background: #2563eb; color: white; padding: 10px; text-align: left;">Cabeçalho ${c+1}</th>`;
                } else {
                    tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 8px;">Item ${r},${c+1}</td>`;
                }
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</table><p><br/></p>';
        formatDoc('insertHTML', tableHtml);
    };

    const insertCallout = () => {
        const calloutHtml = `
            <div style="border-left: 4px solid #2563eb; background-color: #eff6ff; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 15px 0; font-size: 14px; color: #1e40af;">
                <strong>💡 Nota Pastoral / Destaque:</strong> Insira aqui uma observação importante ou versículo bíblico relevante para o documento.
            </div>
            <p><br/></p>
        `;
        formatDoc('insertHTML', calloutHtml);
    };

    const handlePrint = () => {
        if (!editorRef.current) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${fileName}</title>
                        <style>
                            @page {
                                margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
                            }
                            body { font-family: Arial, sans-serif; padding: 10px; }
                            table { border-collapse: collapse; width: 100%; }
                            table, th, td { border: 1px solid #94a3b8; }
                            th, td { padding: 8px; text-align: left; }
                            @media print {
                                button { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        ${editorRef.current.innerHTML}
                        <script>
                            window.onload = () => { window.print(); window.close(); }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleZoomIn = () => setZoom(z => Math.min(200, z + 10));
    const handleZoomOut = () => setZoom(z => Math.max(50, z - 10));

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-[200] bg-white/95 backdrop-blur border border-slate-300 shadow-2xl rounded-2xl p-3 flex items-center gap-3 animate-bounce-short font-sans">
                <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                    <FileText size={20} />
                </div>
                <div>
                    <div className="font-bold text-xs text-slate-800 truncate max-w-[200px]">{fileName}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Documento Minimizado</div>
                </div>
                <button 
                    onClick={() => setIsMinimized(false)} 
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                    Restaurar
                </button>
                <button 
                    onClick={() => setView('dashboard')} 
                    className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                    title="Fechar"
                >
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <div 
            ref={containerRef}
            onMouseDown={handleWindowFocus}
            onClick={handleWindowFocus}
            style={
                !isFullscreen
                    ? {
                            width: typeof windowSize.width === 'number' ? `${windowSize.width}px` : windowSize.width,
                            height: typeof windowSize.height === 'number' ? `${windowSize.height}px` : windowSize.height,
                            maxHeight: '100%',
                            maxWidth: '100%',
                            transform: `translate(${windowPosition.x}px, ${windowPosition.y}px)`,
                            zIndex: zIndex,
                        }
                    : { zIndex: 9999 }
            }
            className={`flex flex-col bg-[#f8f9fa] overflow-hidden shadow-2xl border border-slate-200 animate-entrance font-sans mx-auto relative ${getFullscreenClasses()}`}
        >
            {/* Top Bar (Docs style) */}
            <div 
                className="flex items-center px-4 py-2 bg-white border-b border-slate-200 shrink-0 select-none cursor-move"
                onMouseDown={handleDragMouseDown}
            >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shrink-0 shadow-sm">
                    <FileText className="text-white" size={24} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center">
                        <input 
                            type="text" 
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="font-medium text-slate-800 text-lg px-2 py-0.5 border border-transparent hover:border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-auto max-w-[300px] truncate bg-transparent transition-all"
                        />
                        <div className="flex ml-4 space-x-1 text-slate-500">
                            <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors tooltip-trigger" title="Estrela"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></button>
                            <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors tooltip-trigger" title="Mover para pasta"><FolderOpen size={18} /></button>
                            <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors tooltip-trigger" title="Status do documento"><FileCheck size={18} /></button>
                        </div>
                    </div>
                    {/* Menus */}
                    <div className="flex space-x-1 mt-0.5 text-[13px] text-slate-600">
                        <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors" onClick={triggerFileOpen}>Arquivo</button>
                        <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors" onClick={() => formatDoc('undo')}>Editar</button>
                        <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors" onClick={() => setZoom(100)}>Ver</button>
                        <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors">Inserir</button>
                        <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors">Formatar</button>
                        <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors" onClick={() => setShowMargins(!showMargins)}>Margens</button>
                        <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors" onClick={exportToDocx}>Exportar DOCX</button>
                    </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0 ml-4">
                    <button onClick={exportToDocx} className="flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors" title="Exportar para formato Word (.docx)">
                        <FileBox size={16} /> .DOCX
                    </button>
                    <button onClick={handleSaveFile} className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors">
                        <Save size={16} /> .GDOC
                    </button>
                    <button onClick={triggerFileOpen} className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors" title="Abrir Arquivo">
                        <FolderOpen size={16} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleOpenFile} accept=".gdoc,.html,.txt,.docx,.doc,.rtf,.gplan,.json,.xlsx,.xls,.csv" className="hidden" />

                    {/* Window Controls (Minimizar, Maximizar, Fechar) */}
                    <div className="flex items-center gap-1 pl-2 border-l border-slate-200 ml-1">
                        <button 
                            onClick={() => setIsMinimized(true)} 
                            className="p-1.5 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors" 
                            title="Minimizar Janela"
                        >
                            <Minus size={16} />
                        </button>
                        <button 
                            onClick={() => setIsFullscreen(!isFullscreen)} 
                            className="p-1.5 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors" 
                            title={isFullscreen ? "Restaurar Janela" : "Maximizar Janela"}
                        >
                            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>
                        <button 
                            onClick={() => setView('dashboard')} 
                            className="p-1.5 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors" 
                            title="Fechar Editor"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Colorful Toolbar */}
            <div className="flex items-center flex-wrap gap-1.5 px-3 py-2 bg-[#f1f5f9] border-b border-slate-200 shrink-0 text-slate-700 text-sm overflow-x-auto">
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                    <button onClick={() => formatDoc('undo')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Desfazer (Ctrl+Z)"><Undo size={16} /></button>
                    <button onClick={() => formatDoc('redo')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Refazer (Ctrl+Y)"><Redo size={16} /></button>
                    <button onClick={handlePrint} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded transition-colors font-semibold flex items-center gap-1" title="Imprimir Documento">
                        <Printer size={16} />
                    </button>
                </div>
                
                <div className="w-px h-5 bg-slate-300 mx-0.5"></div>
                
                {/* Templates Selector */}
                <select 
                    onChange={(e) => {
                        if (e.target.value) {
                            applyDocumentTemplate(e.target.value);
                            e.target.value = '';
                        }
                    }}
                    className="h-8 border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold rounded-lg px-2 outline-none text-xs hover:bg-emerald-100 transition-all cursor-pointer shadow-sm"
                >
                    <option value="">📄 Modelos de Documento...</option>
                    <option value="declaracao">📋 Declaração de Membresia</option>
                    <option value="recomendacao">✉️ Carta de Recomendação</option>
                    <option value="ata">📑 Ata de Reunião</option>
                    <option value="oficio">🏛️ Ofício Pastoral</option>
                </select>

                <div className="w-px h-5 bg-slate-300 mx-0.5"></div>
                
                <div className="flex items-center bg-white border border-slate-200 rounded-lg px-1 h-8 shadow-sm">
                    <button onClick={handleZoomOut} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Minus size={14} /></button>
                    <span className="px-1.5 text-xs font-semibold w-11 text-center text-slate-700">{zoom}%</span>
                    <button onClick={handleZoomIn} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Plus size={14} /></button>
                </div>
                
                <div className="w-px h-5 bg-slate-300 mx-0.5"></div>
                
                <select 
                    onChange={(e) => formatDoc('formatBlock', e.target.value)}
                    className="h-8 border border-slate-200 bg-white rounded-lg px-2 outline-none text-xs font-medium w-28 truncate shadow-sm focus:border-blue-500"
                >
                    <option value="P">Texto Normal</option>
                    <option value="H1">Título 1</option>
                    <option value="H2">Título 2</option>
                    <option value="H3">Título 3</option>
                    <option value="H4">Título 4</option>
                </select>

                <select 
                    onChange={(e) => formatDoc('fontName', e.target.value)}
                    className="h-8 border border-slate-200 bg-white rounded-lg px-2 outline-none text-xs w-28 truncate shadow-sm focus:border-blue-500"
                >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                </select>

                <div className="w-px h-5 bg-slate-300 mx-0.5"></div>

                <select 
                    onChange={(e) => {
                        insertVariable(e.target.value);
                        e.target.value = '';
                    }}
                    className="h-8 border border-indigo-300 bg-indigo-50 text-indigo-700 rounded-lg px-2 outline-none text-xs font-bold w-32 truncate shadow-sm cursor-pointer"
                >
                    <option value="">{'{'} Variáveis {'}'}</option>
                    <option value="{NOME_MEMBRO}">{'{'}NOME_MEMBRO{'}'}</option>
                    <option value="{NOME_IGREJA}">{'{'}NOME_IGREJA{'}'}</option>
                    <option value="{NOME_PASTOR}">{'{'}NOME_PASTOR{'}'}</option>
                    <option value="{DATA_ATUAL}">{'{'}DATA_ATUAL{'}'}</option>
                    <option value="{CPF_MEMBRO}">{'{'}CPF_MEMBRO{'}'}</option>
                    <option value="{CARGO_MEMBRO}">{'{'}CARGO_MEMBRO{'}'}</option>
                </select>

                <div className="w-px h-5 bg-slate-300 mx-0.5"></div>
                
                {/* Estilos de Texto */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                    <button onClick={() => formatDoc('bold')} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors font-bold text-slate-700" title="Negrito"><Bold size={16} /></button>
                    <button onClick={() => formatDoc('italic')} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors italic text-slate-700" title="Itálico"><Italic size={16} /></button>
                    <button onClick={() => formatDoc('underline')} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors underline text-slate-700" title="Sublinhado"><Underline size={16} /></button>
                    <button onClick={() => formatDoc('strikeThrough')} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors text-slate-700" title="Tachado"><Strikethrough size={16} /></button>
                </div>
                
                <div className="w-px h-5 bg-slate-300 mx-0.5"></div>
                
                <div className="flex items-center bg-white border border-slate-200 rounded-lg px-1.5 h-8 gap-1 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cores</span>
                    <div className="flex items-center gap-1 relative" title="Cor do Texto">
                        <Type size={14} className="text-blue-600" />
                        <input type="color" className="w-4 h-4 p-0 border-none rounded cursor-pointer bg-transparent" onChange={(e) => formatDoc('foreColor', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-1 relative" title="Marca-Texto / Destaque">
                        <Highlighter size={14} className="text-amber-500" />
                        <input type="color" className="w-4 h-4 p-0 border-none rounded cursor-pointer bg-transparent" onChange={(e) => formatDoc('hiliteColor', e.target.value)} />
                    </div>
                </div>

                <div className="w-px h-5 bg-slate-300 mx-0.5"></div>

                {/* Alinhamentos */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                    <button onClick={() => formatDoc('justifyLeft')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Alinhar à Esquerda"><AlignLeft size={16} /></button>
                    <button onClick={() => formatDoc('justifyCenter')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Centralizar"><AlignCenter size={16} /></button>
                    <button onClick={() => formatDoc('justifyRight')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Alinhar à Direita"><AlignRight size={16} /></button>
                    <button onClick={() => formatDoc('justifyFull')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Justificar"><AlignJustify size={16} /></button>
                </div>

                <div className="w-px h-5 bg-slate-300 mx-0.5"></div>

                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                    <button onClick={() => formatDoc('insertUnorderedList')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Lista"><List size={16} /></button>
                    <button onClick={() => formatDoc('insertOrderedList')} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Lista Numerada"><ListOrdered size={16} /></button>
                </div>

                <div className="w-px h-5 bg-slate-300 mx-0.5"></div>

                {/* Elementos Especiais */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm gap-0.5">
                    <button onClick={() => insertTable(3, 3)} className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-bold transition-colors flex items-center gap-1" title="Inserir Tabela 3x3">
                        <span className="text-[11px]">▦ Tabela</span>
                    </button>
                    <button onClick={insertCallout} className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-xs font-bold transition-colors flex items-center gap-1" title="Inserir Caixa de Destaque">
                        <span className="text-[11px]">💡 Nota</span>
                    </button>
                    <button onClick={() => {
                        const url = prompt('Insira a URL da imagem:');
                        if (url) formatDoc('insertImage', url);
                    }} className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors" title="Inserir Imagem"><ImageIcon size={16} /></button>
                    <button onClick={() => {
                        const url = prompt('Insira a URL do link:');
                        if (url) formatDoc('createLink', url);
                    }} className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors" title="Inserir Link"><Link size={16} /></button>
                </div>

                <div className="w-px h-5 bg-slate-300 mx-0.5"></div>

                <button onClick={() => formatDoc('removeFormat')} className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors" title="Limpar formatação">Limpar Tx</button>
            </div>

            {/* Ruler area (Decorative to look like Word/Docs) */}
            <div className="h-6 bg-slate-100 border-b border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                <div className="h-full bg-white relative w-full max-w-[850px] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
                    {/* Ruler tick marks - simulated */}
                    <div className="absolute inset-0 flex" style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 49px, #cbd5e1 49px, #cbd5e1 50px)' }}>
                        <div className="w-16 h-full bg-slate-200 shrink-0"></div>
                        <div className="flex-1"></div>
                        <div className="w-16 h-full bg-slate-200 shrink-0"></div>
                    </div>
                </div>
            </div>

            {/* Workspace Editor */}
            <div className="flex-1 min-h-0 overflow-auto bg-[#f8f9fa] flex justify-center py-8 relative custom-scrollbar">
                <div 
                    className="bg-white shadow-md border border-slate-200 outline-none w-full max-w-[850px] min-h-[1100px] mb-16 relative"
                    style={{ 
                        transform: `scale(${zoom / 100})`, 
                        transformOrigin: 'top center', 
                        transition: 'transform 0.2s ease',
                        paddingTop: `${margins.top}mm`,
                        paddingBottom: `${margins.bottom}mm`,
                        paddingLeft: `${margins.left}mm`,
                        paddingRight: `${margins.right}mm`
                    }}
                >
                    <div 
                        key={editorKey}
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        className="outline-none min-h-full font-serif text-[11pt] leading-normal"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                        dangerouslySetInnerHTML={{ __html: editorHtml }}
                    />
                </div>

                {/* Margins Sidebar */}
                <div className={`absolute top-0 right-0 bottom-0 w-64 bg-white border-l border-slate-200 shadow-xl transition-transform duration-300 transform ${showMargins ? 'translate-x-0' : 'translate-x-full'} z-40`}>
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Settings size={18} /> Margens (mm)</h3>
                        <button onClick={() => setShowMargins(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><PanelRightClose size={18} /></button>
                    </div>
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Superior (Top)</label>
                            <input type="number" value={margins.top} onChange={(e) => setMargins({...margins, top: Number(e.target.value)})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Inferior (Bottom)</label>
                            <input type="number" value={margins.bottom} onChange={(e) => setMargins({...margins, bottom: Number(e.target.value)})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Esquerda (Left)</label>
                            <input type="number" value={margins.left} onChange={(e) => setMargins({...margins, left: Number(e.target.value)})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Direita (Right)</label>
                            <input type="number" value={margins.right} onChange={(e) => setMargins({...margins, right: Number(e.target.value)})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                        </div>

                        <div className="pt-3 border-t border-slate-100">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Janela & Posição</label>
                            
                            <button 
                                onClick={handleCenterWindow}
                                className="w-full mb-2 py-1.5 px-2 rounded border border-slate-200 text-center text-[11px] font-medium transition-colors text-slate-600 hover:bg-slate-50 flex justify-center items-center gap-1.5"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>
                                Centralizar Janela
                            </button>

                            <div className="grid grid-cols-2 gap-1.5">
                                <button 
                                    onClick={() => updateWindowSizePreset('100%', '100%')} 
                                    className={`py-1 px-2 rounded border text-center text-[11px] font-medium transition-colors ${windowSize.width === '100%' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    100% Total
                                </button>
                                <button 
                                    onClick={() => updateWindowSizePreset('90%', '85%')} 
                                    className={`py-1 px-2 rounded border text-center text-[11px] font-medium transition-colors ${windowSize.width === '90%' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    90% Largo
                                </button>
                                <button 
                                    onClick={() => updateWindowSizePreset('80%', '75%')} 
                                    className={`py-1 px-2 rounded border text-center text-[11px] font-medium transition-colors ${windowSize.width === '80%' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    80% Médio
                                </button>
                                <button 
                                    onClick={() => updateWindowSizePreset('70%', '65%')} 
                                    className={`py-1 px-2 rounded border text-center text-[11px] font-medium transition-colors ${windowSize.width === '70%' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    70% Compacto
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
                            As margens afetam a visualização do editor, impressão e exportação para PDF/DOCX.
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Status Bar */}
            <div className="h-8 bg-slate-100 border-t border-slate-200 shrink-0 flex items-center px-4 justify-between text-xs text-slate-500 font-medium relative">
                <div>GIPP DOCs Engine v1.0</div>
                <div className="flex items-center gap-4 mr-4">
                    <span>{fileName}</span>
                    <span>Modo de Edição</span>
                </div>

                {!isFullscreen && (
                    <div 
                        onMouseDown={handleResizeMouseDown}
                        title="Clique e arraste para redimensionar a janela livremente"
                        className="absolute bottom-0 right-0 z-50 w-6 h-6 cursor-se-resize flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-tl transition-colors group select-none border-t border-l border-slate-300 bg-slate-200/80"
                    >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70 group-hover:opacity-100">
                            <path d="M8 2L2 8M8 5L5 8M8 8L8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}



export default function ModuleGippDocs() {
    const { addToast, globalOpenFile, setGlobalOpenFile, osTheme } = useContext(ChurchContext);
    const [currentView, setCurrentView] = useState<'dropzone' | 'text' | 'spreadsheet'>('text');
    const [loadedFile, setLoadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (globalOpenFile) {
            if (globalOpenFile.type === 'docs') {
                setLoadedFile(globalOpenFile.file);
                setCurrentView('text');
            } else if (globalOpenFile.type === 'sheets') {
                setLoadedFile(globalOpenFile.file);
                setCurrentView('spreadsheet');
            }
        }
    }, [globalOpenFile]);

    const handleFile = useCallback((file: File) => {
        try {
            const ext = validateFile(file);
            setLoadedFile(file);
            
            if (['xlsx', 'xls', 'csv', 'gplan', 'json'].includes(ext || '')) {
                setGlobalOpenFile({ file, type: 'sheets' });
                setCurrentView('spreadsheet');
            } else {
                setGlobalOpenFile({ file, type: 'docs' });
                setCurrentView('text');
            }
        } catch (error: any) {
            addToast(error.message, "error");
        }
    }, [addToast, setGlobalOpenFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const getFullscreenClasses = () => {
        return 'h-full min-h-[600px] rounded-2xl relative z-10';
    };

    return (
        <AnimatePresence mode="wait">
            {currentView === 'dropzone' && (
                <motion.div 
                    key="dropzone"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className={`flex flex-col bg-[#f8f9fa] overflow-hidden shadow-2xl border border-slate-200 animate-entrance font-sans items-center justify-center p-8 ${getFullscreenClasses()}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <div className={`w-full max-w-2xl border-4 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center transition-colors duration-300 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}`}>
                        <div className="flex gap-4 mb-6 text-slate-400">
                            <FileTextIcon size={64} className={isDragging ? 'text-blue-500 animate-bounce' : ''} />
                            <FileSpreadsheetIcon size={64} className={isDragging ? 'text-emerald-500 animate-bounce delay-75' : ''} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-700 mb-2">Arraste e solte seus arquivos aqui</h2>
                        <p className="text-slate-500 mb-8 max-w-md">
                            GIPP Docs suporta arquivos Word (.docx, .doc) e planilhas Excel (.xlsx, .xls). O editor correto será carregado automaticamente.
                        </p>
                        
                        <label className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 cursor-pointer flex items-center gap-2">
                            <UploadCloud size={20} />
                            Procurar Arquivo
                            <input 
                                type="file" 
                                className="hidden" 
                                accept=".docx,.doc,.xlsx,.xls,.csv,.gdoc,.gplan,.txt,.html,.json,.rtf"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        handleFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </motion.div>
            )}
            
            {currentView === 'text' && (
                <motion.div 
                    key="text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full flex items-center justify-center relative"
                >
                    <TextEditor initialFile={loadedFile} />
                </motion.div>
            )}

            {currentView === 'spreadsheet' && (
                <motion.div 
                    key="spreadsheet"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full flex items-center justify-center relative"
                >
                    <SpreadsheetEditor initialFile={loadedFile} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

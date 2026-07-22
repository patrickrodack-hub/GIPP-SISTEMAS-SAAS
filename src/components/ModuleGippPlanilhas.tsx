import React, { useRef, useState, useContext, useEffect } from "react";
import { Workbook, WorkbookInstance } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import {
  Maximize,
  Minimize,
  FolderOpen,
  Save,
  FileSpreadsheet,
  Download,
  Settings,
  PanelRightClose,
  Minus,
  Plus,
  FileCheck,
  X
} from "lucide-react";
import { ChurchContext } from "../App";
import * as XLSX from "xlsx";
import { 
  getStoredWindowState, 
  saveWindowState, 
  validateAndCenterPosition, 
  getNextZIndex, 
  WindowState 
} from "../utils/windowManager";

interface ModuleGippPlanilhasProps {
  initialFile?: File | null;
}

export default function ModuleGippPlanilhas({ initialFile }: ModuleGippPlanilhasProps) {
  const { addToast, osTheme, setView, globalOpenFile, setGlobalOpenFile } = useContext(ChurchContext);
  const [fileName, setFileName] = useState("Planilha sem título");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [margins, setMargins] = useState({ top: 15, bottom: 15, left: 15, right: 15 }); // em mm
  const [pageSize, setPageSize] = useState<"full" | "a4" | "letter" | "legal">("full");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [showMargins, setShowMargins] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const PLANILHAS_STORAGE_KEY = 'gippPlanilhasWindowState';

  const [windowState, setWindowState] = useState<WindowState>(() => 
    getStoredWindowState(PLANILHAS_STORAGE_KEY, '100%', '100%')
  );
  const [zIndex, setZIndex] = useState<number>(() => getNextZIndex());

  const windowPosition = { x: windowState.x, y: windowState.y };
  const windowSize = { width: windowState.width, height: windowState.height };

  const containerRef = useRef<HTMLDivElement>(null);

  const handleWindowFocus = () => {
    setZIndex(getNextZIndex());
  };

  // Keep window position visible on browser resize
  useEffect(() => {
    const handleResize = () => {
      setWindowState(prev => {
        const validated = validateAndCenterPosition(prev);
        if (validated.x !== prev.x || validated.y !== prev.y) {
          saveWindowState(PLANILHAS_STORAGE_KEY, validated);
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
      saveWindowState(PLANILHAS_STORAGE_KEY, updated);
      return updated;
    });
  };

  const handleDragMouseDown = (e: React.MouseEvent) => {
    handleWindowFocus();
    if (isFullscreen) return;
    
    // Prevent dragging if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
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
            saveWindowState(PLANILHAS_STORAGE_KEY, prev);
            return prev;
        });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleCenterWindow = () => {
    setWindowState(prev => {
      const updated = { ...prev, x: 0, y: 0 };
      saveWindowState(PLANILHAS_STORAGE_KEY, updated);
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
        saveWindowState(PLANILHAS_STORAGE_KEY, prev);
        return prev;
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const getFullscreenClasses = () => {
    if (!isFullscreen) return 'max-h-full min-h-[400px] rounded-2xl relative z-10';
    return 'fixed inset-0 z-[9999] rounded-none w-screen h-screen bg-[#f8f9fa]';
  };

  const [formulaSuggestion, setFormulaSuggestion] = useState<string | null>(null);

  useEffect(() => {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (
        target &&
        target.tagName === "DIV" &&
        target.getAttribute("contenteditable") === "true"
      ) {
        const text = target.textContent || "";
        if (text.startsWith("=")) {
          const upperText = text.toUpperCase();
          if (upperText.includes("SO"))
            setFormulaSuggestion("SOMA(valor1, [valor2], ...) - Soma os valores");
          else if (upperText.includes("MÉ") || upperText.includes("ME"))
            setFormulaSuggestion("MÉDIA(valor1, [valor2], ...) - Retorna a média");
          else if (upperText.includes("SE"))
            setFormulaSuggestion("SE(teste_lógico; valor_se_verdadeiro; valor_se_falso)");
          else if (upperText.includes("PROCV"))
            setFormulaSuggestion("PROCV(valor_procurado; matriz_tabela; num_indice_coluna; [procurar_intervalo])");
          else setFormulaSuggestion("Funções comuns: SOMA, MÉDIA, SE, PROCV");
        } else {
          setFormulaSuggestion(null);
        }
      }
    };

    document.addEventListener("input", handleInput, true);
    return () => document.removeEventListener("input", handleInput, true);
  }, []);

  const workbookRef = useRef<WorkbookInstance>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sheetData, setSheetData] = useState<any[]>([
    {
      name: "Página 1",
      id: "1",
      status: 1,
      celldata: [],
    },
  ]);

  // Trigger window resize to force FortuneSheet canvas recalculation
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);
    return () => clearTimeout(timer);
  }, [sheetKey, pageSize, zoom, isFullscreen, isMinimized]);

  // Auto-save simulation every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (sheetData) {
        setLastSavedTime(new Date());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [sheetData]);

  const handleSaveFile = () => {
    if (!workbookRef.current) return;

    try {
      const data = workbookRef.current.getAllSheets();
      const jsonString = JSON.stringify(data);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.gplan`;
      document.body.appendChild(a);
      a.click();

      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast("Planilha salva com sucesso!", "success");
    } catch (error) {
      console.error("Error saving sheet:", error);
      addToast("Erro ao salvar a planilha.", "error");
    }
  };

  const handleExportXLSX = () => {
    if (!workbookRef.current) return;
    try {
      const data = workbookRef.current.getAllSheets();
      const wb = XLSX.utils.book_new();
      data.forEach((sheet) => {
        const wsData: any[][] = [];
        if (sheet.celldata) {
          sheet.celldata.forEach((cell: any) => {
            const r = cell.r;
            const c = cell.c;
            const v = cell.v;
            if (!wsData[r]) wsData[r] = [];
            let cellValue: any = { t: "s", v: "" };
            if (v) {
              if (v.f) {
                cellValue = {
                  t: "n",
                  f: v.f.startsWith("=") ? v.f.substring(1) : v.f,
                };
                if (v.v !== undefined) {
                  cellValue.v = v.v;
                }
              } else if (v.v !== undefined && v.v !== null) {
                const num = Number(v.v);
                if (!isNaN(num) && v.v !== "") {
                  cellValue = { t: "n", v: num };
                } else {
                  cellValue = { t: "s", v: String(v.m || v.v) };
                }
              }
            }
            wsData[r][c] = cellValue;
          });
        }
        for (let i = 0; i < wsData.length; i++) {
          if (!wsData[i]) wsData[i] = [];
          for (let j = 0; j < wsData[i].length; j++) {
            if (wsData[i][j] === undefined) {
              wsData[i][j] = { t: "z" };
            }
          }
        }
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws["!margins"] = {
          left: margins.left / 25.4,
          right: margins.right / 25.4,
          top: margins.top / 25.4,
          bottom: margins.bottom / 25.4,
        };
        XLSX.utils.book_append_sheet(wb, ws, sheet.name || "Planilha 1");
      });
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      addToast("Planilha exportada para Excel com sucesso!", "success");
    } catch (error) {
      console.error("Error exporting to XLSX:", error);
      addToast("Erro ao exportar a planilha.", "error");
    }
  };

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext === "xlsx" || ext === "xls" || ext === "csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheets: any[] = [];
          
          workbook.SheetNames.forEach((sheetName, index) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonSheet: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const celldata: any[] = [];
            jsonSheet.forEach((row, r) => {
              row.forEach((val, c) => {
                if (val !== undefined && val !== null && val !== '') {
                  celldata.push({ r, c, v: { v: val, m: String(val) } });
                }
              });
            });
            
            sheets.push({
              name: sheetName,
              celldata,
              row: Math.max(jsonSheet.length, 30),
              column: Math.max((jsonSheet[0] || []).length, 20),
              order: index.toString(),
            });
          });
          
          if (sheets.length > 0) {
            setSheetData(sheets);
            setSheetKey(k => k + 1);
            setFileName(file.name.replace(/\.[^/.]+$/, ""));
            addToast("Planilha do Excel carregada com sucesso!", "success");
          } else {
             addToast("A planilha está vazia.", "warning");
          }
        } catch (error) {
           console.error(error);
           addToast("Erro ao importar planilha do Excel.", "error");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (ext === "gplan" || ext === "json") {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
              setSheetData(parsed);
              setSheetKey(k => k + 1);
              setFileName(file.name.replace(/\.[^/.]+$/, ""));
              addToast("Planilha carregada com sucesso!", "success");
            } else {
              addToast("Formato de arquivo inválido.", "error");
            }
          } else {
            addToast("Formato não suportado. Use .gplan, .xlsx, .xls ou .csv", "warning");
          }
        } catch (error) {
          console.error("Error loading file:", error);
          addToast("Erro ao ler o arquivo.", "error");
        }
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
    if (globalOpenFile && globalOpenFile.type === 'sheets' && globalOpenFile.file !== lastProcessedFileRef.current) {
      const file = globalOpenFile.file;
      lastProcessedFileRef.current = file;
      setGlobalOpenFile(null);
      processFile(file);
    }
  }, [globalOpenFile, setGlobalOpenFile]);

  const handleOpenFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (['docx', 'doc', 'gdoc', 'html', 'txt', 'rtf'].includes(ext || '')) {
      setGlobalOpenFile({ file, type: 'docs' });
    } else {
      processFile(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileOpen = () => {
    fileInputRef.current?.click();
  };

  const handleZoomIn = () => setZoom(z => Math.min(200, z + 10));
  const handleZoomOut = () => setZoom(z => Math.max(50, z - 10));

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[200] bg-white/95 backdrop-blur border border-slate-300 shadow-2xl rounded-2xl p-3 flex items-center gap-3 animate-bounce-short font-sans">
        <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
          <FileSpreadsheet size={20} />
        </div>
        <div>
          <div className="font-bold text-xs text-slate-800 truncate max-w-[200px]">{fileName}</div>
          <div className="text-[10px] text-slate-500 font-medium">Planilha Minimizada</div>
        </div>
        <button 
          onClick={() => setIsMinimized(false)} 
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
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
      {/* Header Toolbar (Google Sheets Style aligned with GIPP Docs) */}
      <div 
        className="flex items-center px-4 py-2 bg-white border-b border-slate-200 shrink-0 flex-wrap gap-2 select-none cursor-move"
        onMouseDown={handleDragMouseDown}
      >
        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mr-1 shrink-0 shadow-sm">
          <FileSpreadsheet size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="font-medium text-slate-800 text-lg bg-transparent border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white border rounded px-2 py-0.5 outline-none transition-colors w-full max-w-md truncate"
            placeholder="Nome da planilha"
          />
          <div className="flex items-center space-x-1 mt-0.5 text-xs text-slate-600">
            <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors" onClick={triggerFileOpen}>
              Arquivo
            </button>
            <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors" onClick={() => setZoom(100)}>
              Ver
            </button>
            <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors" onClick={() => setShowMargins(!showMargins)}>
              Dimensões
            </button>
            <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors" onClick={handleExportXLSX}>
              Exportar XLSX
            </button>
          </div>
        </div>

        {/* Zoom & Window Toolbar Section */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center bg-slate-100 border border-slate-300 rounded px-1 h-8">
            <button onClick={handleZoomOut} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Diminuir Zoom">
              <Minus size={14} />
            </button>
            <span className="px-2 text-xs font-semibold w-12 text-center text-slate-700">{zoom}%</span>
            <button onClick={handleZoomIn} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Aumentar Zoom">
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={() => setShowMargins(!showMargins)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium text-xs transition-colors border ${showMargins ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'}`}
            title="Dimensões da Janela & Configuração de Tela"
          >
            <Settings size={16} /> Configurar Tela
          </button>

          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors"
            title="Exportar para Excel (.xlsx)"
          >
            <Download size={16} /> .XLSX
          </button>

          <button
            onClick={handleSaveFile}
            className="flex items-center gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors"
            title="Salvar Planilha GIPP (.gplan)"
          >
            <Save size={16} /> .GPLAN
          </button>

          <button
            onClick={triggerFileOpen}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-full font-medium text-xs transition-colors"
            title="Abrir Arquivo"
          >
            <FolderOpen size={16} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleOpenFile}
            accept=".gplan,.json,.xlsx,.xls,.csv,.docx,.doc,.rtf,.gdoc,.html,.txt"
            className="hidden"
          />

          {/* Window Action Controls (Minimizar, Maximizar, Fechar) */}
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
              className="p-1.5 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors" 
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

      {/* Formula Suggestion Bar */}
      {formulaSuggestion && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1 flex items-center shrink-0">
          <span className="text-emerald-700 font-semibold text-xs mr-2">
            Dica de Fórmula:
          </span>
          <span className="text-emerald-600 text-xs font-mono">
            {formulaSuggestion}
          </span>
        </div>
      )}

      {/* Workspace Area with Spacious Flex Height for FortuneSheet */}
      <div className="flex-1 min-h-[400px] relative w-full bg-[#f8f9fa] overflow-hidden">
        {pageSize === "full" ? (
          <div className="absolute inset-0 bg-white overflow-hidden">
            <div 
              className="w-full h-full relative overflow-hidden"
              style={{
                transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
                transformOrigin: 'top left',
                width: zoom !== 100 ? `${100 / (zoom / 100)}%` : '100%',
                height: zoom !== 100 ? `${100 / (zoom / 100)}%` : '100%',
              }}
            >
              <Workbook
                key={sheetKey}
                ref={workbookRef}
                data={sheetData}
                lang="en"
                showToolbar={true}
                showSheetTabs={true}
                showFormulaBar={true}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto bg-slate-200/80 p-6 flex justify-center custom-scrollbar">
            <div 
              className="bg-white shadow-2xl border border-slate-300 rounded-lg relative transition-all duration-200 flex flex-col shrink-0"
              style={{
                width: pageSize === 'a4' ? (orientation === 'portrait' ? '210mm' : '297mm') : pageSize === 'letter' ? (orientation === 'portrait' ? '216mm' : '279mm') : (orientation === 'portrait' ? '216mm' : '356mm'),
                height: pageSize === 'a4' ? (orientation === 'portrait' ? '297mm' : '210mm') : pageSize === 'letter' ? (orientation === 'portrait' ? '279mm' : '216mm') : (orientation === 'portrait' ? '356mm' : '216mm'),
                minHeight: '850px',
                paddingTop: `${margins.top}mm`,
                paddingBottom: `${margins.bottom}mm`,
                paddingLeft: `${margins.left}mm`,
                paddingRight: `${margins.right}mm`,
                transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
                transformOrigin: 'top center',
              }}
            >
              <div className="w-full h-full relative overflow-hidden flex-1 flex flex-col min-h-[550px]">
                <Workbook
                  key={sheetKey}
                  ref={workbookRef}
                  data={sheetData}
                  lang="en"
                  showToolbar={true}
                  showSheetTabs={true}
                  showFormulaBar={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Slide-over Margins & Window Dimensions Sidebar */}
        <div className={`absolute top-0 right-0 bottom-0 w-72 bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 transform ${showMargins ? 'translate-x-0' : 'translate-x-full'} z-40 flex flex-col`}>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Settings size={18} className="text-emerald-600" /> Dimensões da Janela
            </h3>
            <button onClick={() => setShowMargins(false)} className="p-1 hover:bg-slate-200 rounded text-slate-500">
              <PanelRightClose size={18} />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Zoom da Tela ({zoom}%)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="50" 
                  max="200" 
                  step="10" 
                  value={zoom} 
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer" 
                />
                <span className="font-mono font-bold w-10 text-right">{zoom}%</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block font-semibold text-slate-700 mb-1">Orientação do Papel</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setOrientation('portrait')} 
                  className={`py-1.5 px-3 rounded border text-center font-medium ${orientation === 'portrait' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  Retrato
                </button>
                <button 
                  onClick={() => setOrientation('landscape')} 
                  className={`py-1.5 px-3 rounded border text-center font-medium ${orientation === 'landscape' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  Paisagem
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block font-semibold text-slate-700 mb-1">Janela & Posição</label>
              
              <button 
                onClick={handleCenterWindow}
                className="w-full mb-2 py-1.5 px-2 rounded border border-slate-200 text-center text-[11px] font-medium transition-colors text-slate-600 hover:bg-slate-50 flex justify-center items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>
                Centralizar Janela
              </button>

              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <button 
                  onClick={() => updateWindowSizePreset('100%', '100%')} 
                  className={`py-1 px-2 rounded border text-center text-[11px] font-medium transition-colors ${windowSize.width === '100%' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  100% Total
                </button>
                <button 
                  onClick={() => updateWindowSizePreset('90%', '85%')} 
                  className={`py-1 px-2 rounded border text-center text-[11px] font-medium transition-colors ${windowSize.width === '90%' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  90% Largo
                </button>
                <button 
                  onClick={() => updateWindowSizePreset('80%', '75%')} 
                  className={`py-1 px-2 rounded border text-center text-[11px] font-medium transition-colors ${windowSize.width === '80%' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  80% Médio
                </button>
                <button 
                  onClick={() => updateWindowSizePreset('70%', '65%')} 
                  className={`py-1 px-2 rounded border text-center text-[11px] font-medium transition-colors ${windowSize.width === '70%' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  70% Compacto
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block font-semibold text-slate-700 mb-1">Dimensão da Folha / Tela</label>
              <select 
                value={pageSize} 
                onChange={(e: any) => setPageSize(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1.5 outline-none focus:border-emerald-500 bg-white"
              >
                <option value="full">100% Flexível (Ajustar à Tela)</option>
                <option value="a4">A4 (210 x 297 mm)</option>
                <option value="letter">Carta / Letter (216 x 279 mm)</option>
                <option value="legal">Ofício / Legal (216 x 356 mm)</option>
              </select>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <h4 className="font-bold text-slate-800">Margens Internas (mm)</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Superior (Top)</label>
                  <input type="number" value={margins.top} onChange={(e) => setMargins({...margins, top: Number(e.target.value)})} className="w-full border border-slate-300 rounded px-2 py-1 outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Inferior (Bottom)</label>
                  <input type="number" value={margins.bottom} onChange={(e) => setMargins({...margins, bottom: Number(e.target.value)})} className="w-full border border-slate-300 rounded px-2 py-1 outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Esquerda (Left)</label>
                  <input type="number" value={margins.left} onChange={(e) => setMargins({...margins, left: Number(e.target.value)})} className="w-full border border-slate-300 rounded px-2 py-1 outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Direita (Right)</label>
                  <input type="number" value={margins.right} onChange={(e) => setMargins({...margins, right: Number(e.target.value)})} className="w-full border border-slate-300 rounded px-2 py-1 outline-none focus:border-emerald-500" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-slate-600 text-[11px] leading-tight">
              Ajuste o zoom, margens e dimensões para adequar a exibição da planilha ao seu monitor ou preparar para exportação em PDF e Excel.
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-slate-100 border-t border-slate-200 shrink-0 flex items-center px-4 justify-between text-xs text-slate-500 font-medium relative">
        <div>GIPP Planilhas Engine v1.0</div>
        <div className="flex items-center gap-4 mr-4">
          <span>{fileName}</span>
          {lastSavedTime ? (
            <span className="text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
              <FileCheck size={12} /> Guardado ({lastSavedTime.toLocaleTimeString()})
            </span>
          ) : (
            <span>Salvo localmente</span>
          )}
        </div>

        {!isFullscreen && (
          <div 
            onMouseDown={handleResizeMouseDown}
            title="Clique e arraste para redimensionar a janela livremente"
            className="absolute bottom-0 right-0 z-50 w-6 h-6 cursor-se-resize flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-tl transition-colors group select-none border-t border-l border-slate-300 bg-slate-200/80"
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

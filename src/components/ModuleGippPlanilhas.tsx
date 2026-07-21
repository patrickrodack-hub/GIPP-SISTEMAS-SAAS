import React, { useRef, useState, useContext, useEffect } from "react";
import { Workbook, WorkbookInstance } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import {
  Maximize,
  Minimize,
  FolderOpen,
  Save,
  FileSpreadsheet,
} from "lucide-react";
import { ChurchContext } from "../App";
import * as XLSX from "xlsx";
import { Download, LayoutTemplate } from "lucide-react";

export default function ModuleGippPlanilhas() {
  const { addToast, osTheme } = useContext(ChurchContext);
  const [fileName, setFileName] = useState("Planilha sem título");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getFullscreenClasses = () => {
      if (!isFullscreen) return 'h-full min-h-[600px] rounded-2xl relative z-10';
      
      if (osTheme === 'linux') return 'fixed left-0 right-0 bottom-16 top-8 z-[100] rounded-none';
      if (osTheme === 'win11') return 'fixed left-0 right-0 top-0 bottom-12 z-[100] rounded-none';
      if (osTheme === 'macos_tahoe') return 'fixed left-0 right-0 bottom-0 top-6 z-[100] rounded-none';
      
      return 'fixed inset-0 z-[100] rounded-none';
  };
  const [formulaSuggestion, setFormulaSuggestion] = useState<string | null>(
    null,
  );
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(
    null,
  );

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
            setFormulaSuggestion(
              "SOMA(valor1, [valor2], ...) - Soma os valores",
            );
          else if (upperText.includes("MÉ") || upperText.includes("ME"))
            setFormulaSuggestion(
              "MÉDIA(valor1, [valor2], ...) - Retorna a média",
            );
          else if (upperText.includes("SE"))
            setFormulaSuggestion(
              "SE(teste_lógico; valor_se_verdadeiro; valor_se_falso)",
            );
          else if (upperText.includes("PROCV"))
            setFormulaSuggestion(
              "PROCV(valor_procurado; matriz_tabela; num_indice_coluna; [procurar_intervalo])",
            );
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

  // Initial default sheet data

  const [showMargins, setShowMargins] = useState(false);
  const [marginType, setMarginType] = useState("padrao"); // padrao, moderado, estreito

  const [sheetData, setSheetData] = useState<any[]>([
    {
      name: "Página 1",
      id: "1",
      status: 1,
      celldata: [],
    },
  ]);

  const handleSaveFile = () => {
    if (!workbookRef.current) return;

    try {
      // Get all sheet data
      const data = workbookRef.current.getAllSheets();

      // Create a backup JSON of the entire fortune-sheet structure
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
                // Add value if available
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
        const margins =
          marginType === "padrao"
            ? {
                left: 0.75,
                right: 0.75,
                top: 1.0,
                bottom: 1.0,
                header: 0.5,
                footer: 0.5,
              }
            : marginType === "moderado"
              ? {
                  left: 0.5,
                  right: 0.5,
                  top: 0.75,
                  bottom: 0.75,
                  header: 0.3,
                  footer: 0.3,
                }
              : {
                  left: 0.25,
                  right: 0.25,
                  top: 0.5,
                  bottom: 0.5,
                  header: 0.2,
                  footer: 0.2,
                };
        ws["!margins"] = margins;
        XLSX.utils.book_append_sheet(wb, ws, sheet.name || "Planilha 1");
      });
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      addToast("Planilha exportada para Excel com sucesso!", "success");
    } catch (error) {
      console.error("Error exporting to XLSX:", error);
      addToast("Erro ao exportar a planilha.", "error");
    }
  };

  const handleOpenFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (file.name.endsWith(".gplan") || file.name.endsWith(".json")) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            setSheetData(parsed);
            setFileName(file.name.replace(/\.[^/.]+$/, ""));
            addToast("Planilha carregada com sucesso!", "success");
          } else {
            addToast("Formato de arquivo inválido.", "error");
          }
        } else {
          addToast("Formato não suportado. Use .gplan", "warning");
        }
      } catch (error) {
        console.error("Error loading file:", error);
        addToast("Erro ao ler o arquivo.", "error");
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileOpen = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`flex flex-col bg-[#f8f9fa] overflow-hidden shadow-2xl border border-slate-200 animate-entrance font-sans ${getFullscreenClasses()}`}
    >
      {/* Header Toolbar (Google Sheets Style) */}
      <div className="flex items-center px-4 py-2 bg-white border-b border-slate-200 shrink-0">
        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mr-3 shrink-0 shadow-sm">
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
          <div className="flex items-center space-x-1 mt-0.5 text-sm text-slate-600">
            <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors">
              Arquivo
            </button>
            <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors">
              Editar
            </button>
            <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors">
              Ver
            </button>
            <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors">
              Inserir
            </button>
            <button className="px-2 py-1 hover:bg-slate-100 rounded transition-colors">
              Formatar
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3 shrink-0 ml-4">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
            title="Tela Cheia"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMargins(!showMargins)}
              className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-2 rounded font-medium text-sm transition-colors"
              title="Configurar Margens"
            >
              <LayoutTemplate size={18} />
            </button>
            {showMargins && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-slate-200 shadow-lg rounded-lg p-3 z-50 w-48">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                  Margens de Exportação
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setMarginType("padrao");
                      setShowMargins(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded ${marginType === "padrao" ? "bg-emerald-50 text-emerald-700 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    Padrão
                  </button>
                  <button
                    onClick={() => {
                      setMarginType("moderado");
                      setShowMargins(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded ${marginType === "moderado" ? "bg-emerald-50 text-emerald-700 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    Moderado
                  </button>
                  <button
                    onClick={() => {
                      setMarginType("estreito");
                      setShowMargins(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded ${marginType === "estreito" ? "bg-emerald-50 text-emerald-700 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    Estreito
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-full font-medium text-sm transition-colors"
          >
            <Download size={18} /> Exportar .XLSX
          </button>

          <button
            onClick={handleSaveFile}
            className="flex items-center gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-full font-medium text-sm transition-colors"
          >
            <Save size={18} /> Salvar .GPLAN
          </button>
          <button
            onClick={triggerFileOpen}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-full font-medium text-sm transition-colors"
          >
            <FolderOpen size={18} /> Abrir PC
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleOpenFile}
            accept=".gplan,.json"
            className="hidden"
          />
        </div>
      </div>

      {/* Formula Suggestion Bar */}
      {formulaSuggestion && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 flex items-center shrink-0">
          <span className="text-emerald-700 font-semibold text-xs mr-2">
            Dica de Fórmula:
          </span>
          <span className="text-emerald-600 text-xs font-mono">
            {formulaSuggestion}
          </span>
        </div>
      )}

      {/* FortuneSheet Container */}

      <div className="fortune-sheet-container" style={{ flex: 1, width: '100%', position: 'relative', minHeight: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Workbook
            ref={workbookRef}
            data={sheetData}
            lang="en"
            showToolbar={true}
            showSheetTabs={true}
            showFormulaBar={true}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-slate-100 border-t border-slate-200 shrink-0 flex items-center px-4 justify-between text-xs text-slate-500 font-medium">
        <div>GIPP Planilhas Engine v1.0</div>
        <div className="flex items-center gap-4">
          <span>{fileName}</span>
          <span>Salvo localmente</span>
        </div>
      </div>
    </div>
  );
}

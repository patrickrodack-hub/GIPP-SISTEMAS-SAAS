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
  Printer,
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

  const loadSheetTemplate = (type: string) => {
    let newCelldata: any[] = [];
    if (type === 'fluxo_caixa') {
      setFileName('Relatório de Fluxo de Caixa');
      newCelldata = [
        { r: 0, c: 0, v: { v: "RELATÓRIO DE FLUXO DE CAIXA - TESOURARIA", bg: "#1e3a8a", fc: "#ffffff", bl: 1, ht: 1 } },
        { r: 1, c: 0, v: { v: "Data", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 1, v: { v: "Descrição do Lançamento", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 2, v: { v: "Categoria", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 3, v: { v: "Entradas (R$)", bg: "#dcfce7", fc: "#166534", bl: 1 } },
        { r: 1, c: 4, v: { v: "Saídas (R$)", bg: "#fee2e2", fc: "#991b1b", bl: 1 } },
        { r: 1, c: 5, v: { v: "Saldo (R$)", bg: "#e0f2fe", fc: "#075985", bl: 1 } },
        { r: 2, c: 0, v: { v: "01/07/2026" } },
        { r: 2, c: 1, v: { v: "Dízimos e Ofertas do Culto de Domingo" } },
        { r: 2, c: 2, v: { v: "Entradas Ordinárias" } },
        { r: 2, c: 3, v: { v: 4500.00, m: "R$ 4.500,00" } },
        { r: 2, c: 4, v: { v: 0.00, m: "R$ 0,00" } },
        { r: 2, c: 5, v: { f: "=D3-E3", v: 4500.00 } },
        { r: 3, c: 0, v: { v: "05/07/2026" } },
        { r: 3, c: 1, v: { v: "Pagamento Conta de Energia Eletrica" } },
        { r: 3, c: 2, v: { v: "Despesas Fixas" } },
        { r: 3, c: 3, v: { v: 0.00, m: "R$ 0,00" } },
        { r: 3, c: 4, v: { v: 850.00, m: "R$ 850,00" } },
        { r: 3, c: 5, v: { f: "=F3-E4", v: 3650.00 } },
        { r: 4, c: 0, v: { v: "TOTAL", bl: 1, bg: "#f1f5f9" } },
        { r: 4, c: 1, v: { v: "BALANÇO TOTAL MENSAL", bl: 1, bg: "#f1f5f9" } },
        { r: 4, c: 2, v: { v: "-", bg: "#f1f5f9" } },
        { r: 4, c: 3, v: { f: "=SUM(D3:D4)", bl: 1, bg: "#dcfce7", fc: "#166534" } },
        { r: 4, c: 4, v: { f: "=SUM(E3:E4)", bl: 1, bg: "#fee2e2", fc: "#991b1b" } },
        { r: 4, c: 5, v: { f: "=D5-E5", bl: 1, bg: "#e0f2fe", fc: "#075985" } },
      ];
    } else if (type === 'dizimos') {
      setFileName('Controle de Dízimos e Ofertas');
      newCelldata = [
        { r: 0, c: 0, v: { v: "CONTROLE DE DÍZIMOS E OFERTAS", bg: "#065f46", fc: "#ffffff", bl: 1, ht: 1 } },
        { r: 1, c: 0, v: { v: "Rol", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 1, v: { v: "Nome do Membro", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 2, v: { v: "CPF / Identificação", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 3, v: { v: "Dízimo (R$)", bg: "#dcfce7", bl: 1 } },
        { r: 1, c: 4, v: { v: "Oferta (R$)", bg: "#fef3c7", bl: 1 } },
        { r: 1, c: 5, v: { v: "Total Geral (R$)", bg: "#e0f2fe", bl: 1 } },
        { r: 2, c: 0, v: { v: "001" } },
        { r: 2, c: 1, v: { v: "João da Silva Santos" } },
        { r: 2, c: 2, v: { v: "123.456.789-00" } },
        { r: 2, c: 3, v: { v: 350.00 } },
        { r: 2, c: 4, v: { v: 50.00 } },
        { r: 2, c: 5, v: { f: "=SUM(D3:E3)", v: 400.00 } },
        { r: 3, c: 0, v: { v: "SOMA", bl: 1, bg: "#f1f5f9" } },
        { r: 3, c: 1, v: { v: "TOTAL ARRECADADO", bl: 1, bg: "#f1f5f9" } },
        { r: 3, c: 2, v: { v: "-", bg: "#f1f5f9" } },
        { r: 3, c: 3, v: { f: "=SUM(D3:D3)", bl: 1 } },
        { r: 3, c: 4, v: { f: "=SUM(E3:E3)", bl: 1 } },
        { r: 3, c: 5, v: { f: "=SUM(F3:F3)", bl: 1 } },
      ];
    } else if (type === 'escala') {
      setFileName('Escala de Cultos e Louvor');
      newCelldata = [
        { r: 0, c: 0, v: { v: "ESCALA MENSAL DE CULTOS E MINISTÉRIO DE LOUVOR", bg: "#6b21a8", fc: "#ffffff", bl: 1 } },
        { r: 1, c: 0, v: { v: "Data", bg: "#f3e8ff", bl: 1 } },
        { r: 1, c: 1, v: { v: "Dia / Culto", bg: "#f3e8ff", bl: 1 } },
        { r: 1, c: 2, v: { v: "Dirigente", bg: "#f3e8ff", bl: 1 } },
        { r: 1, c: 3, v: { v: "Pregrador / Mensagem", bg: "#f3e8ff", bl: 1 } },
        { r: 1, c: 4, v: { v: "Grupo de Louvor", bg: "#f3e8ff", bl: 1 } },
        { r: 1, c: 5, v: { v: "Recepção / Apoio", bg: "#f3e8ff", bl: 1 } },
        { r: 2, c: 0, v: { v: "02/08/2026" } },
        { r: 2, c: 1, v: { v: "Domingo - Família" } },
        { r: 2, c: 2, v: { v: "Pr. Presidente" } },
        { r: 2, c: 3, v: { v: "Ev. Marcos Pedro" } },
        { r: 2, c: 4, v: { v: "Ministério Shalom" } },
        { r: 2, c: 5, v: { v: "Equipe Boas-Vindas A" } },
      ];
    }

    if (newCelldata.length > 0) {
      setSheetData([{
        name: "Página 1",
        id: "1",
        status: 1,
        celldata: newCelldata
      }]);
      setSheetKey(k => k + 1);
      addToast("Modelo de planilha carregado com sucesso!", "success");
    }
  };

  const handlePrintSheet = () => {
    if (!workbookRef.current) return;
    try {
      const sheets = workbookRef.current.getAllSheets();
      const currentSheet = sheets[0];
      if (!currentSheet || !currentSheet.celldata) {
        addToast("Sem dados para imprimir na planilha.", "warning");
        return;
      }

      const matrix: string[][] = [];
      let maxR = 0;
      let maxC = 0;

      currentSheet.celldata.forEach((cell: any) => {
        const r = cell.r;
        const c = cell.c;
        if (r > maxR) maxR = r;
        if (c > maxC) maxC = c;
        if (!matrix[r]) matrix[r] = [];
        const val = cell.v ? (cell.v.m !== undefined ? cell.v.m : (cell.v.v !== undefined ? cell.v.v : '')) : '';
        matrix[r][c] = String(val);
      });

      let tableHtml = `<table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px;">`;
      for (let r = 0; r <= Math.min(maxR, 100); r++) {
        tableHtml += `<tr>`;
        for (let c = 0; c <= Math.min(maxC, 20); c++) {
          const val = (matrix[r] && matrix[r][c]) ? matrix[r][c] : '';
          const isHeader = r === 0;
          const bgStyle = isHeader ? 'background-color: #f1f5f9; font-weight: bold;' : '';
          tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 6px; text-align: left; ${bgStyle}">${val}</td>`;
        }
        tableHtml += `</tr>`;
      }
      tableHtml += `</table>`;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${fileName} - Relatório de Impressão</title>
              <style>
                @page { margin: 15mm; size: ${orientation}; }
                body { font-family: Arial, sans-serif; padding: 10px; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                .header h2 { margin: 0; color: #1e3a8a; }
                .header p { margin: 4px 0 0 0; color: #64748b; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS</h2>
                <p>Relatório de Planilha: <strong>${fileName}</strong> - Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
              </div>
              ${tableHtml}
              <script>
                window.onload = () => { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (err) {
      console.error("Erro ao imprimir planilha:", err);
      addToast("Erro ao gerar visualização de impressão.", "error");
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

  const parseRgbColor = (colorObj: any): string | null => {
    if (!colorObj) return null;
    if (typeof colorObj === 'string') {
      let c = colorObj.trim();
      if (c.startsWith('#')) return c;
      if (c.length === 8) return '#' + c.substring(2);
      if (c.length === 6) return '#' + c;
    }
    if (colorObj.rgb) {
      let rgb = String(colorObj.rgb).trim();
      if (rgb.length === 8) return '#' + rgb.substring(2);
      if (rgb.length === 6) return '#' + rgb;
    }
    return null;
  };

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext === "xlsx" || ext === "xls" || ext === "csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { 
            type: 'array', 
            cellStyles: true, 
            cellFormula: true, 
            cellDates: true, 
            cellNF: true 
          });
          const sheets: any[] = [];
          
          workbook.SheetNames.forEach((sheetName, index) => {
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) return;

            const celldata: any[] = [];
            const mergeConfig: Record<string, { r: number; c: number; rs: number; cs: number }> = {};
            const columnlen: Record<number, number> = {};
            const rowlen: Record<number, number> = {};

            // Parse merged cells (!merges)
            if (worksheet['!merges'] && Array.isArray(worksheet['!merges'])) {
              worksheet['!merges'].forEach((m: any) => {
                if (m && m.s && m.e) {
                  const key = `${m.s.r}_${m.s.c}`;
                  mergeConfig[key] = {
                    r: m.s.r,
                    c: m.s.c,
                    rs: m.e.r - m.s.r + 1,
                    cs: m.e.c - m.s.c + 1,
                  };
                }
              });
            }

            // Parse column widths (!cols)
            if (worksheet['!cols'] && Array.isArray(worksheet['!cols'])) {
              worksheet['!cols'].forEach((col: any, idx: number) => {
                if (col) {
                  const px = col.wpx || (col.width ? Math.round(col.width * 8) : null);
                  if (px) columnlen[idx] = px;
                }
              });
            }

            // Parse row heights (!rows)
            if (worksheet['!rows'] && Array.isArray(worksheet['!rows'])) {
              worksheet['!rows'].forEach((row: any, idx: number) => {
                if (row) {
                  const px = row.hpx || (row.hpt ? Math.round(row.hpt * 1.33) : null);
                  if (px) rowlen[idx] = px;
                }
              });
            }

            let maxR = 25;
            let maxC = 15;

            Object.keys(worksheet).forEach((key) => {
              if (key.startsWith('!')) return;
              try {
                const coords = XLSX.utils.decode_cell(key);
                const r = coords.r;
                const c = coords.c;
                if (r > maxR) maxR = r;
                if (c > maxC) maxC = c;

                const cell = worksheet[key];
                if (!cell) return;

                const cellObj: any = {};

                // Formula
                if (cell.f) {
                  const rawFormula = String(cell.f).trim();
                  cellObj.f = rawFormula.startsWith('=') ? rawFormula : '=' + rawFormula;
                }

                // Value
                if (cell.v !== undefined && cell.v !== null) {
                  if (cell.t === 'd' && cell.v instanceof Date) {
                    cellObj.v = cell.v.toLocaleDateString('pt-BR');
                  } else if (cell.t === 'n') {
                    cellObj.v = Number(cell.v);
                  } else {
                    cellObj.v = cell.v;
                  }
                }

                // Formatted text display
                if (cell.w !== undefined) {
                  cellObj.m = String(cell.w);
                } else if (cellObj.v !== undefined) {
                  cellObj.m = String(cellObj.v);
                }

                // Number Format
                if (cell.z) {
                  cellObj.ct = { fa: cell.z, t: cell.t === 'n' ? 'n' : 'g' };
                }

                // Cell Styles (Background, Font color, Bold, Italic, Alignments)
                if (cell.s) {
                  const style = cell.s;

                  if (style.fill) {
                    const bgHex = parseRgbColor(style.fill.fgColor || style.fill.bgColor);
                    if (bgHex) cellObj.bg = bgHex;
                  }

                  if (style.font) {
                    const font = style.font;
                    const fcHex = parseRgbColor(font.color);
                    if (fcHex) cellObj.fc = fcHex;
                    if (font.bold) cellObj.bl = 1;
                    if (font.italic) cellObj.it = 1;
                    if (font.strike) cellObj.cl = 1;
                    if (font.underline) cellObj.un = 1;
                    if (font.sz) cellObj.fs = font.sz;
                    if (font.name) cellObj.ff = font.name;
                  }

                  if (style.alignment) {
                    const align = style.alignment;
                    if (align.horizontal === 'left') cellObj.ht = 1;
                    else if (align.horizontal === 'center') cellObj.ht = 0;
                    else if (align.horizontal === 'right') cellObj.ht = 2;

                    if (align.vertical === 'top') cellObj.vt = 1;
                    else if (align.vertical === 'center' || align.vertical === 'middle') cellObj.vt = 0;
                    else if (align.vertical === 'bottom') cellObj.vt = 2;

                    if (align.wrapText) cellObj.tb = 2;
                  }
                }

                if (Object.keys(cellObj).length > 0) {
                  celldata.push({ r, c, v: cellObj });
                }
              } catch (err) {
                console.warn("Cell decode error:", err);
              }
            });

            const config: any = {};
            if (Object.keys(mergeConfig).length > 0) config.merge = mergeConfig;
            if (Object.keys(columnlen).length > 0) config.columnlen = columnlen;
            if (Object.keys(rowlen).length > 0) config.rowlen = rowlen;

            sheets.push({
              name: sheetName,
              id: (index + 1).toString(),
              status: index === 0 ? 1 : 0,
              celldata,
              config,
              row: Math.max(maxR + 10, 35),
              column: Math.max(maxC + 5, 25),
              order: index.toString(),
            });
          });
          
          if (sheets.length > 0) {
            setSheetData(sheets);
            setSheetKey(k => k + 1);
            setFileName(file.name.replace(/\.[^/.]+$/, ""));
            addToast("Planilha do Excel importada com fórmulas e formatações!", "success");
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
            onClick={handlePrintSheet}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm"
            title="Imprimir Planilha com Cabeçalho Oficial"
          >
            <Printer size={16} /> Imprimir
          </button>

          <select 
            onChange={(e) => {
              if (e.target.value) {
                loadSheetTemplate(e.target.value);
                e.target.value = '';
              }
            }}
            className="h-8 border border-emerald-400 bg-emerald-50 text-emerald-800 font-bold rounded-lg px-2 outline-none text-xs hover:bg-emerald-100 transition-all cursor-pointer shadow-sm"
          >
            <option value="">📊 Modelos de Planilha...</option>
            <option value="fluxo_caixa">💰 Relatório de Fluxo de Caixa</option>
            <option value="dizimos">📜 Controle de Dízimos e Ofertas</option>
            <option value="escala">📅 Escala de Cultos e Louvor</option>
          </select>

          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-sm"
            title="Exportar para Excel (.xlsx)"
          >
            <Download size={16} /> .XLSX
          </button>

          <button
            onClick={handleSaveFile}
            className="flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-sm"
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

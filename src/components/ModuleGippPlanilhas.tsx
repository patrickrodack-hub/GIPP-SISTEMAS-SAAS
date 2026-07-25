import React, { useRef, useState, useContext, useEffect } from "react";
import { Workbook, WorkbookInstance } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import { GippSheetsIcon } from "./GippOfficeIcons";
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
  X,
  Paintbrush,
  Type,
  DollarSign,
  Percent,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Grid,
  Sparkles,
  Palette,
  Check,
  Calendar,
  Hash
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
  const [activeMenu, setActiveMenu] = useState<'arquivo' | 'editar' | 'exibir' | 'inserir' | 'formatar' | 'modelos' | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.gipp-planilhas-menu-container')) return;
      setActiveMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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

  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [selectedFormulaCategory, setSelectedFormulaCategory] = useState<'all' | 'fin' | 'stats' | 'logic'>('all');

  // Cell Formatting State
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [formatTab, setFormatTab] = useState<'number' | 'font' | 'align' | 'border'>('number');
  const [rangeInput, setRangeInput] = useState('A1:D10');
  const [numberFormat, setNumberFormat] = useState<'general' | 'currency_brl' | 'currency_usd' | 'percent' | 'decimal' | 'date' | 'text'>('currency_brl');
  const [decimals, setDecimals] = useState<number>(2);
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [fontSize, setFontSize] = useState<number>(11);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [isStrike, setIsStrike] = useState<boolean>(false);
  const [fontColor, setFontColor] = useState<string>('#1e293b');
  const [bgColor, setBgColor] = useState<string>('');
  const [horizontalAlign, setHorizontalAlign] = useState<number>(1); // 1: Left, 0: Center, 2: Right
  const [verticalAlign, setVerticalAlign] = useState<number>(0); // 0: Center, 1: Top, 2: Bottom
  const [borderType, setBorderType] = useState<string>('border-all');
  const [borderColor, setBorderColor] = useState<string>('#334155');
  const [borderStyle, setBorderStyle] = useState<string>('1');

  function colToIdx(colStr: string): number {
    let col = 0;
    const str = colStr.toUpperCase().trim();
    for (let i = 0; i < str.length; i++) {
      col = col * 26 + (str.charCodeAt(i) - 64);
    }
    return Math.max(0, col - 1);
  }

  function idxToCol(idx: number): string {
    let colStr = "";
    let temp = idx + 1;
    while (temp > 0) {
      let rem = (temp - 1) % 26;
      colStr = String.fromCharCode(65 + rem) + colStr;
      temp = Math.floor((temp - 1) / 26);
    }
    return colStr;
  }

  function parseRangeString(rangeStr: string): { startRow: number; endRow: number; startCol: number; endCol: number } {
    const cleanStr = rangeStr.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanStr) return { startRow: 0, endRow: 0, startCol: 0, endCol: 0 };

    const parts = cleanStr.split(':');
    const parseCell = (cellStr: string) => {
      const match = cellStr.match(/^([A-Z]+)(\d+)$/);
      if (!match) return { row: 0, col: 0 };
      const col = colToIdx(match[1]);
      const row = Math.max(0, parseInt(match[2], 10) - 1);
      return { row, col };
    };

    const c1 = parseCell(parts[0]);
    const c2 = parts[1] ? parseCell(parts[1]) : c1;

    return {
      startRow: Math.min(c1.row, c2.row),
      endRow: Math.max(c1.row, c2.row),
      startCol: Math.min(c1.col, c2.col),
      endCol: Math.max(c1.col, c2.col)
    };
  }

  const handleApplyCellFormatting = (options?: {
    overrideNumberFormat?: string;
    overrideBg?: string;
    overrideFc?: string;
    overrideBold?: boolean;
    overrideBorderType?: string;
  }) => {
    const { startRow, endRow, startCol, endCol } = parseRangeString(rangeInput);
    const activeNumFmt = options?.overrideNumberFormat || numberFormat;
    const activeBg = options?.overrideBg !== undefined ? options.overrideBg : bgColor;
    const activeFc = options?.overrideFc !== undefined ? options.overrideFc : fontColor;
    const activeBold = options?.overrideBold !== undefined ? options.overrideBold : isBold;
    const activeBorderType = options?.overrideBorderType !== undefined ? options.overrideBorderType : borderType;

    setSheetData(prev => {
      return prev.map((sheet, index) => {
        if (sheet.status === 1 || index === 0) {
          const celldataMap = new Map<string, any>();
          
          // Populate current cell map
          (sheet.celldata || []).forEach((cell: any) => {
            celldataMap.set(`${cell.r}_${cell.c}`, { ...cell.v });
          });

          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const key = `${r}_${c}`;
              const existingV = celldataMap.get(key) || {};
              const newV = { ...existingV };

              // Font & style
              if (fontFamily) newV.ff = fontFamily;
              if (fontSize) newV.fs = fontSize;
              newV.bl = activeBold ? 1 : 0;
              newV.it = isItalic ? 1 : 0;
              newV.un = isUnderline ? 1 : 0;
              newV.cl = isStrike ? 1 : 0;
              if (activeFc) newV.fc = activeFc;
              if (activeBg) newV.bg = activeBg;
              else if (options?.overrideBg === "") delete newV.bg;

              // Alignment
              newV.ht = horizontalAlign;
              newV.vt = verticalAlign;

              // Number formatting
              if (activeNumFmt === 'currency_brl') {
                let val = newV.v;
                let num = typeof val === 'number' ? val : parseFloat(String(val || "0").replace(/[^0-9.-]+/g, "")) || 0;
                newV.v = num;
                newV.m = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
                newV.ct = { fa: "R$ #,##0.00", t: "n" };
              } else if (activeNumFmt === 'currency_usd') {
                let val = newV.v;
                let num = typeof val === 'number' ? val : parseFloat(String(val || "0").replace(/[^0-9.-]+/g, "")) || 0;
                newV.v = num;
                newV.m = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
                newV.ct = { fa: "$ #,##0.00", t: "n" };
              } else if (activeNumFmt === 'percent') {
                let val = newV.v;
                let num = typeof val === 'number' ? val : parseFloat(String(val || "0").replace(/[^0-9.-]+/g, "")) || 0;
                newV.v = num;
                newV.m = `${(num * (Math.abs(num) <= 1 ? 100 : 1)).toFixed(decimals)}%`;
                newV.ct = { fa: "0.00%", t: "n" };
              } else if (activeNumFmt === 'decimal') {
                let val = newV.v;
                let num = typeof val === 'number' ? val : parseFloat(String(val || "0").replace(/[^0-9.-]+/g, "")) || 0;
                newV.v = num;
                newV.m = num.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
                newV.ct = { fa: decimals === 0 ? "#,##0" : "#,##0." + "0".repeat(decimals), t: "n" };
              } else if (activeNumFmt === 'date') {
                newV.ct = { fa: "yyyy-mm-dd", t: "d" };
              } else if (activeNumFmt === 'text') {
                newV.m = String(newV.v !== undefined ? newV.v : "");
                newV.ct = { fa: "@", t: "s" };
              } else if (activeNumFmt === 'general') {
                delete newV.m;
                delete newV.ct;
              }

              celldataMap.set(key, newV);
            }
          }

          const newCelldata: any[] = [];
          celldataMap.forEach((v, key) => {
            const [r, c] = key.split('_').map(Number);
            newCelldata.push({ r, c, v });
          });

          // Manage borders
          let newBorderInfo = [...(sheet.borderInfo || [])];
          if (activeBorderType && activeBorderType !== 'none') {
            newBorderInfo.push({
              rangeType: "range",
              borderType: activeBorderType,
              style: borderStyle,
              color: borderColor,
              range: [{ row: [startRow, endRow], column: [startCol, endCol] }]
            });
          } else if (activeBorderType === 'none') {
            newBorderInfo = newBorderInfo.filter(b => {
              if (b.range && b.range[0]) {
                const r = b.range[0].row;
                const c = b.range[0].column;
                return !(r[0] >= startRow && r[1] <= endRow && c[0] >= startCol && c[1] <= endCol);
              }
              return true;
            });
          }

          const updatedSheet = {
            ...sheet,
            celldata: newCelldata,
            borderInfo: newBorderInfo,
            config: {
              ...(sheet.config || {}),
              borderInfo: newBorderInfo
            }
          };
          delete updatedSheet.data;
          return updatedSheet;
        }
        return sheet;
      });
    });

    setSheetKey(k => k + 1);
    addToast(`Formatação aplicada ao intervalo ${rangeInput.toUpperCase()}!`, "success");
    setShowFormatModal(false);
  };

  const borderStyleToCss = (style: string | number | undefined, color: string | undefined): string => {
    if (style === "none" || style === "0") return "none";
    const s = String(style || "1");
    const col = color || "#cbd5e1";
    switch (s) {
      case "1":
      case "thin":
        return `1px solid ${col}`;
      case "2":
      case "medium":
        return `2px solid ${col}`;
      case "3":
      case "dashed":
        return `1px dashed ${col}`;
      case "4":
      case "dotted":
        return `1px dotted ${col}`;
      case "5":
      case "thick":
        return `3px solid ${col}`;
      case "6":
      case "double":
        return `3px double ${col}`;
      case "7":
      case "hair":
        return `1px solid ${col}`;
      case "8":
      case "mediumDashed":
        return `2px dashed ${col}`;
      case "9":
      case "dashDot":
        return `1px dashed ${col}`;
      case "10":
      case "mediumDashDot":
        return `2px dashed ${col}`;
      case "11":
      case "dashDotDot":
        return `1px dotted ${col}`;
      case "12":
      case "mediumDashDotDot":
        return `2px dotted ${col}`;
      case "13":
      case "slantDashDot":
        return `2px dashed ${col}`;
      default:
        return `1px solid ${col}`;
    }
  };

  const borderStyleToXLSX = (style: string | number | undefined): string => {
    if (!style || style === "none" || style === "0") return "thin";
    const s = String(style);
    switch (s) {
      case "1": return "thin";
      case "2": return "medium";
      case "3": return "dashed";
      case "4": return "dotted";
      case "5": return "thick";
      case "6": return "double";
      case "7": return "hair";
      case "8": return "mediumDashed";
      case "9": return "dashDot";
      case "10": return "mediumDashDot";
      case "11": return "dashDotDot";
      case "12": return "mediumDashDotDot";
      case "13": return "slantDashDot";
      default: return typeof style === 'string' && style ? style : "thin";
    }
  };

  const formatHexForXLSX = (color: string | undefined): string => {
    if (!color) return "FF000000";
    let hex = String(color).replace("#", "");
    if (hex.length === 6) return "FF" + hex.toUpperCase();
    if (hex.length === 8) return hex.toUpperCase();
    return "FF000000";
  };

  const buildCellBordersMap = (sheet: any) => {
    const bordersMap = new Map<string, { top?: { style: string; color: string } | null; right?: { style: string; color: string } | null; bottom?: { style: string; color: string } | null; left?: { style: string; color: string } | null }>();

    const getCellBorder = (r: number, c: number) => {
      const key = `${r}_${c}`;
      if (!bordersMap.has(key)) {
        bordersMap.set(key, {});
      }
      return bordersMap.get(key)!;
    };

    const borderList: any[] = [];
    if (Array.isArray(sheet.config?.borderInfo)) {
      borderList.push(...sheet.config.borderInfo);
    }
    if (Array.isArray(sheet.borderInfo)) {
      borderList.push(...sheet.borderInfo);
    }

    borderList.forEach((b: any) => {
      if (!b) return;

      if (b.rangeType === "range" && Array.isArray(b.range)) {
        b.range.forEach((rObj: any) => {
          if (!rObj || !Array.isArray(rObj.row) || !Array.isArray(rObj.column)) return;
          const r1 = rObj.row[0];
          const r2 = rObj.row[1];
          const c1 = rObj.column[0];
          const c2 = rObj.column[1];
          if (r1 === undefined || r2 === undefined || c1 === undefined || c2 === undefined) return;

          const borderType = b.borderType;
          const style = String(b.style || "1");
          const color = b.color || "#000000";
          const borderObj = { style, color };

          for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
              const cellBorder = getCellBorder(r, c);

              if (borderType === "border-all") {
                cellBorder.top = { ...borderObj };
                cellBorder.bottom = { ...borderObj };
                cellBorder.left = { ...borderObj };
                cellBorder.right = { ...borderObj };
              } else if (borderType === "border-top") {
                if (r === r1) cellBorder.top = { ...borderObj };
              } else if (borderType === "border-bottom") {
                if (r === r2) cellBorder.bottom = { ...borderObj };
              } else if (borderType === "border-left") {
                if (c === c1) cellBorder.left = { ...borderObj };
              } else if (borderType === "border-right") {
                if (c === c2) cellBorder.right = { ...borderObj };
              } else if (borderType === "border-outside") {
                if (r === r1) cellBorder.top = { ...borderObj };
                if (r === r2) cellBorder.bottom = { ...borderObj };
                if (c === c1) cellBorder.left = { ...borderObj };
                if (c === c2) cellBorder.right = { ...borderObj };
              } else if (borderType === "border-inside") {
                if (r > r1) cellBorder.top = { ...borderObj };
                if (r < r2) cellBorder.bottom = { ...borderObj };
                if (c > c1) cellBorder.left = { ...borderObj };
                if (c < c2) cellBorder.right = { ...borderObj };
              } else if (borderType === "border-horizontal") {
                if (r > r1) cellBorder.top = { ...borderObj };
                if (r < r2) cellBorder.bottom = { ...borderObj };
              } else if (borderType === "border-vertical") {
                if (c > c1) cellBorder.left = { ...borderObj };
                if (c < c2) cellBorder.right = { ...borderObj };
              } else if (borderType === "border-none") {
                cellBorder.top = null;
                cellBorder.bottom = null;
                cellBorder.left = null;
                cellBorder.right = null;
              }
            }
          }
        });
      } else if (b.rangeType === "cellSlice" || b.value || typeof b.row_index === 'number') {
        const row = b.value?.row_index ?? b.row_index;
        const col = b.value?.col_index ?? b.col_index;
        if (typeof row === "number" && typeof col === "number") {
          const cellBorder = getCellBorder(row, col);
          const l = b.value?.l || b.l;
          const r = b.value?.r || b.r;
          const t = b.value?.t || b.t;
          const bSide = b.value?.b || b.b;
          if (l) cellBorder.left = { style: String(l.style || 1), color: l.color || "#000000" };
          if (r) cellBorder.right = { style: String(r.style || 1), color: r.color || "#000000" };
          if (t) cellBorder.top = { style: String(t.style || 1), color: t.color || "#000000" };
          if (bSide) cellBorder.bottom = { style: String(bSide.style || 1), color: bSide.color || "#000000" };
        }
      }
    });

    // Also check individual cells for inline borders
    const cells = getSheetCells(sheet);
    cells.forEach(({ r, c, v }) => {
      if (v) {
        const bd = v.bd || v.border;
        const l = bd?.l || v.l;
        const rightSide = bd?.r || v.r;
        const t = bd?.t || v.t;
        const bSide = bd?.b || v.b;

        if (l || rightSide || t || bSide) {
          const cellBorder = getCellBorder(r, c);
          if (l) cellBorder.left = { style: String(l.style || 1), color: l.color || "#000000" };
          if (rightSide) cellBorder.right = { style: String(rightSide.style || 1), color: rightSide.color || "#000000" };
          if (t) cellBorder.top = { style: String(t.style || 1), color: t.color || "#000000" };
          if (bSide) cellBorder.bottom = { style: String(bSide.style || 1), color: bSide.color || "#000000" };
        }
      }
    });

    return bordersMap;
  };

  const handleOpenFormatModal = () => {
    try {
      if (workbookRef.current) {
        const selection = (workbookRef.current as any).getSelection?.();
        if (selection && selection.length > 0 && selection[0].row && selection[0].column) {
          const r1 = selection[0].row[0];
          const r2 = selection[0].row[1];
          const c1 = selection[0].column[0];
          const c2 = selection[0].column[1];
          setRangeInput(`${idxToCol(c1)}${r1 + 1}:${idxToCol(c2)}${r2 + 1}`);
        }
      }
    } catch (e) {
      console.log("No active selection detected");
    }
    setShowFormatModal(true);
  };

  const [sheetData, setSheetData] = useState<any[]>([
    {
      name: "Página 1",
      id: "1",
      status: 1,
      celldata: [],
    },
  ]);

  const applyThemeToSheet = (theme: 'azul' | 'verde' | 'purpura' | 'cinza') => {
    let headerBg = "#1e3a8a";
    let headerFc = "#ffffff";
    let zebraBg = "#f0f9ff";

    if (theme === 'verde') {
      headerBg = "#065f46";
      zebraBg = "#ecfdf5";
    } else if (theme === 'purpura') {
      headerBg = "#581c87";
      zebraBg = "#faf5ff";
    } else if (theme === 'cinza') {
      headerBg = "#334155";
      zebraBg = "#f8fafc";
    }

    setSheetData(prev => {
      return prev.map((sheet, index) => {
        if (index === 0 || sheet.status === 1) {
          const newCellData = [...(sheet.celldata || [])];
          // Style first row cells as header
          newCellData.forEach(cell => {
            if (cell.r === 0) {
              cell.v = { ...cell.v, bg: headerBg, fc: headerFc, bl: 1, ht: 1 };
            } else if (cell.r % 2 === 1) {
              cell.v = { ...cell.v, bg: zebraBg };
            }
          });
          const updatedSheet = { ...sheet, celldata: newCellData };
          delete updatedSheet.data;
          return updatedSheet;
        }
        return sheet;
      });
    });
    setSheetKey(k => k + 1);
    addToast(`Estilo de tabela '${theme.toUpperCase()}' aplicado à planilha!`, "success");
  };

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

  // Formula Normalizer: Converts Portuguese formula names (SOMA, SE, PROCV, etc.) to standard English Excel functions
  const normalizeFormula = (f: string): string => {
    if (!f || typeof f !== 'string') return f;
    let formula = f.trim();
    if (!formula.startsWith('=')) return formula;

    return formula
      .replace(/^=\s*SOMA\b/gi, '=SUM')
      .replace(/^=\s*MÉDIA\b/gi, '=AVERAGE')
      .replace(/^=\s*MEDIA\b/gi, '=AVERAGE')
      .replace(/^=\s*CONT\.SE\b/gi, '=COUNTIF')
      .replace(/^=\s*CONTAR\.SE\b/gi, '=COUNTIF')
      .replace(/^=\s*SE\b/gi, '=IF')
      .replace(/^=\s*PROCV\b/gi, '=VLOOKUP')
      .replace(/^=\s*MÁXIMO\b/gi, '=MAX')
      .replace(/^=\s*MAXIMO\b/gi, '=MAX')
      .replace(/^=\s*MÍNIMO\b/gi, '=MIN')
      .replace(/^=\s*MINIMO\b/gi, '=MIN')
      .replace(/^=\s*HOJE\b/gi, '=TODAY')
      .replace(/^=\s*AGORA\b/gi, '=NOW');
  };

  const getSheetCells = (sheet: any): { r: number; c: number; v: any }[] => {
    // If sheet.data exists and is populated, it is the live 2D grid matrix
    if (Array.isArray(sheet.data) && sheet.data.length > 0) {
      const result: { r: number; c: number; v: any }[] = [];
      sheet.data.forEach((row: any[], r: number) => {
        if (Array.isArray(row)) {
          row.forEach((cell: any, c: number) => {
            if (cell && typeof cell === 'object') {
              const hasV = cell.v !== undefined && cell.v !== null && cell.v !== "";
              const hasM = cell.m !== undefined && cell.m !== null && cell.m !== "";
              const hasF = cell.f !== undefined && cell.f !== null && cell.f !== "";
              const hasStyle = Boolean(
                cell.bg || cell.fc || cell.bl || cell.it || cell.fs || cell.ff || 
                cell.ht !== undefined || cell.vt !== undefined || cell.un || cell.cl || cell.tb || cell.ct
              );
              if (hasV || hasM || hasF || hasStyle) {
                const copyCell = { ...cell };
                if (copyCell.f) {
                  copyCell.f = normalizeFormula(copyCell.f);
                }
                result.push({ r, c, v: copyCell });
              }
            }
          });
        }
      });
      return result;
    }

    // Fallback to sparse celldata array if sheet.data is not yet rendered
    if (Array.isArray(sheet.celldata)) {
      return sheet.celldata
        .filter((item: any) => item && typeof item.r === 'number' && typeof item.c === 'number' && item.v)
        .map((item: any) => {
          if (item.v && item.v.f) {
            return {
              ...item,
              v: { ...item.v, f: normalizeFormula(item.v.f) }
            };
          }
          return item;
        });
    }

    return [];
  };

  const handleSaveFile = () => {
    if (!workbookRef.current) return;

    try {
      const data = workbookRef.current.getAllSheets();
      const updatedSheets = data.map((sheet: any) => {
        const celldata = getSheetCells(sheet);
        return {
          ...sheet,
          celldata,
          config: sheet.config || {},
        };
      });
      const jsonString = JSON.stringify(updatedSheets);
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
      setFileName('Relatório_de_Fluxo_de_Caixa');
      newCelldata = [
        { r: 0, c: 0, v: { v: "RELATÓRIO DE FLUXO DE CAIXA - TESOURARIA IGREJA", bg: "#1e3a8a", fc: "#ffffff", bl: 1, ht: 1 } },
        { r: 1, c: 0, v: { v: "Data", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 1, v: { v: "Descrição do Lançamento", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 2, v: { v: "Categoria", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 3, v: { v: "Entradas (R$)", bg: "#dcfce7", fc: "#166534", bl: 1 } },
        { r: 1, c: 4, v: { v: "Saídas (R$)", bg: "#fee2e2", fc: "#991b1b", bl: 1 } },
        { r: 1, c: 5, v: { v: "Saldo Acumulado (R$)", bg: "#e0f2fe", fc: "#075985", bl: 1 } },
        { r: 2, c: 0, v: { v: "01/07/2026" } },
        { r: 2, c: 1, v: { v: "Saldo Inicial do Mês Anterior" } },
        { r: 2, c: 2, v: { v: "Balanço" } },
        { r: 2, c: 3, v: { v: 12500.00, m: "R$ 12.500,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 2, c: 4, v: { v: 0.00, m: "R$ 0,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 2, c: 5, v: { f: "=D3-E3", v: 12500.00, m: "R$ 12.500,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 3, c: 0, v: { v: "05/07/2026" } },
        { r: 3, c: 1, v: { v: "Dízimos e Ofertas Culto de Domingo" } },
        { r: 3, c: 2, v: { v: "Arrecadação" } },
        { r: 3, c: 3, v: { v: 4850.00, m: "R$ 4.850,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 3, c: 4, v: { v: 0.00, m: "R$ 0,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 3, c: 5, v: { f: "=F3+D4-E4", v: 17350.00, m: "R$ 17.350,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 4, c: 0, v: { v: "08/07/2026" } },
        { r: 4, c: 1, v: { v: "Pagamento Conta Luz e Água Templo" } },
        { r: 4, c: 2, v: { v: "Utilidades" } },
        { r: 4, c: 3, v: { v: 0.00, m: "R$ 0,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 4, c: 4, v: { v: 920.00, m: "R$ 920,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 4, c: 5, v: { f: "=F4+D5-E5", v: 16430.00, m: "R$ 16.430,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 5, c: 0, v: { v: "12/07/2026" } },
        { r: 5, c: 1, v: { v: "Ofertas Espaciais de Missões Nacionais" } },
        { r: 5, c: 2, v: { v: "Missões" } },
        { r: 5, c: 3, v: { v: 1400.00, m: "R$ 1.400,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 5, c: 4, v: { v: 0.00, m: "R$ 0,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 5, c: 5, v: { f: "=F5+D6-E6", v: 17830.00, m: "R$ 17.830,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 6, c: 0, v: { v: "15/07/2026" } },
        { r: 6, c: 1, v: { v: "Manutenção e Revisão Mesa de Som" } },
        { r: 6, c: 2, v: { v: "Equipamentos" } },
        { r: 6, c: 3, v: { v: 0.00, m: "R$ 0,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 6, c: 4, v: { v: 650.00, m: "R$ 650,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 6, c: 5, v: { f: "=F6+D7-E7", v: 17180.00, m: "R$ 17.180,00", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 7, c: 0, v: { v: "TOTAL", bl: 1, bg: "#f1f5f9" } },
        { r: 7, c: 1, v: { v: "RESUMO BALANÇO DO MÊS", bl: 1, bg: "#f1f5f9" } },
        { r: 7, c: 2, v: { v: "-", bg: "#f1f5f9" } },
        { r: 7, c: 3, v: { f: "=SUM(D3:D7)", bl: 1, bg: "#dcfce7", fc: "#166534", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 7, c: 4, v: { f: "=SUM(E3:E7)", bl: 1, bg: "#fee2e2", fc: "#991b1b", ct: { fa: "R$ #,##0.00", t: "n" } } },
        { r: 7, c: 5, v: { f: "=D8-E8", bl: 1, bg: "#e0f2fe", fc: "#075985", ct: { fa: "R$ #,##0.00", t: "n" } } },
      ];
    } else if (type === 'dizimos') {
      setFileName('Controle_de_Dizimos_e_Ofertas');
      newCelldata = [
        { r: 0, c: 0, v: { v: "CONTROLE MENSAL DE DÍZIMOS E OFERTAS", bg: "#065f46", fc: "#ffffff", bl: 1, ht: 1 } },
        { r: 1, c: 0, v: { v: "Rol", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 1, v: { v: "Nome do Membro", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 2, v: { v: "CPF / Identificação", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 3, v: { v: "Dízimo (R$)", bg: "#dcfce7", bl: 1 } },
        { r: 1, c: 4, v: { v: "Oferta (R$)", bg: "#fef3c7", bl: 1 } },
        { r: 1, c: 5, v: { v: "Total Contribuído (R$)", bg: "#e0f2fe", bl: 1 } },
        { r: 2, c: 0, v: { v: "001" } },
        { r: 2, c: 1, v: { v: "João da Silva Santos" } },
        { r: 2, c: 2, v: { v: "123.456.789-00" } },
        { r: 2, c: 3, v: { v: 450.00, m: "R$ 450,00" } },
        { r: 2, c: 4, v: { v: 50.00, m: "R$ 50,00" } },
        { r: 2, c: 5, v: { f: "=SUM(D3:E3)", v: 500.00, m: "R$ 500,00" } },
        { r: 3, c: 0, v: { v: "002" } },
        { r: 3, c: 1, v: { v: "Maria Oliveira Costa" } },
        { r: 3, c: 2, v: { v: "234.567.890-11" } },
        { r: 3, c: 3, v: { v: 600.00, m: "R$ 600,00" } },
        { r: 3, c: 4, v: { v: 100.00, m: "R$ 100,00" } },
        { r: 3, c: 5, v: { f: "=SUM(D4:E4)", v: 700.00, m: "R$ 700,00" } },
        { r: 4, c: 0, v: { v: "003" } },
        { r: 4, c: 1, v: { v: "Pedro Henrique Lima" } },
        { r: 4, c: 2, v: { v: "345.678.901-22" } },
        { r: 4, c: 3, v: { v: 300.00, m: "R$ 300,00" } },
        { r: 4, c: 4, v: { v: 30.00, m: "R$ 30,00" } },
        { r: 4, c: 5, v: { f: "=SUM(D5:E5)", v: 330.00, m: "R$ 330,00" } },
        { r: 5, c: 0, v: { v: "004" } },
        { r: 5, c: 1, v: { v: "Ana Clara Fernandes" } },
        { r: 5, c: 2, v: { v: "456.789.012-33" } },
        { r: 5, c: 3, v: { v: 850.00, m: "R$ 850,00" } },
        { r: 5, c: 4, v: { v: 150.00, m: "R$ 150,00" } },
        { r: 5, c: 5, v: { f: "=SUM(D6:E6)", v: 1000.00, m: "R$ 1.000,00" } },
        { r: 6, c: 0, v: { v: "TOTAL", bl: 1, bg: "#f1f5f9" } },
        { r: 6, c: 1, v: { v: "TOTAL ARRECADADO NO MÊS", bl: 1, bg: "#f1f5f9" } },
        { r: 6, c: 2, v: { v: "-", bg: "#f1f5f9" } },
        { r: 6, c: 3, v: { f: "=SUM(D3:D6)", bl: 1, bg: "#dcfce7", fc: "#166534" } },
        { r: 6, c: 4, v: { f: "=SUM(E3:E6)", bl: 1, bg: "#fef3c7", fc: "#854d0e" } },
        { r: 6, c: 5, v: { f: "=SUM(F3:F6)", bl: 1, bg: "#e0f2fe", fc: "#075985" } },
      ];
    } else if (type === 'escala') {
      setFileName('Escala_de_Cultos_e_Louvor');
      newCelldata = [
        { r: 0, c: 0, v: { v: "ESCALA MENSAL DE CULTOS E MINISTÉRIO DE LOUVOR", bg: "#6b21a8", fc: "#ffffff", bl: 1 } },
        { r: 1, c: 0, v: { v: "Data", bg: "#f3e8ff", bl: 1 } },
        { r: 1, c: 1, v: { v: "Culto / Ocasião", bg: "#f3e8ff", bl: 1 } },
        { r: 1, c: 2, v: { v: "Dirigente", bg: "#f3e8ff", bl: 1 } },
        { r: 1, c: 3, v: { v: "Pregador / Mensagem", bg: "#f3e8ff", bl: 1 } },
        { r: 1, c: 4, v: { v: "Ministério de Louvor", bg: "#f3e8ff", bl: 1 } },
        { r: 1, c: 5, v: { v: "Apoio / Portaria", bg: "#f3e8ff", bl: 1 } },
        { r: 2, c: 0, v: { v: "02/08/2026" } },
        { r: 2, c: 1, v: { v: "Domingo de Santa Ceia" } },
        { r: 2, c: 2, v: { v: "Pr. Presidente" } },
        { r: 2, c: 3, v: { v: "Pr. Convidado Especial" } },
        { r: 2, c: 4, v: { v: "Coral Harpa de Davi" } },
        { r: 2, c: 5, v: { v: "Equipe Boas-Vindas A" } },
        { r: 3, c: 0, v: { v: "05/08/2026" } },
        { r: 3, c: 1, v: { v: "Quarta-Feira Doutrina" } },
        { r: 3, c: 2, v: { v: "Ev. Marcos Pedro" } },
        { r: 3, c: 3, v: { v: "Ev. Marcos Pedro" } },
        { r: 3, c: 4, v: { v: "Grupo Filhos da Promessa" } },
        { r: 3, c: 5, v: { v: "Equipe Boas-Vindas B" } },
        { r: 4, c: 0, v: { v: "08/08/2026" } },
        { r: 4, c: 1, v: { v: "Sábado Jovem UMADEB" } },
        { r: 4, c: 2, v: { v: "Pb. Lucas Gabriel" } },
        { r: 4, c: 3, v: { v: "Dc. Samuel Costa" } },
        { r: 4, c: 4, v: { v: "Banda Ministério Jovem" } },
        { r: 4, c: 5, v: { v: "Equipe Boas-Vindas A" } },
        { r: 5, c: 0, v: { v: "09/08/2026" } },
        { r: 5, c: 1, v: { v: "Domingo das Famílias" } },
        { r: 5, c: 2, v: { v: "Pr. Presidente" } },
        { r: 5, c: 3, v: { v: "Mss. Carmen Lucia" } },
        { r: 5, c: 4, v: { v: "Grupo de Varões" } },
        { r: 5, c: 5, v: { v: "Equipe Boas-Vindas B" } },
      ];
    } else if (type === 'ebd_frequencia') {
      setFileName('Chamada_e_Frequencia_EBD');
      newCelldata = [
        { r: 0, c: 0, v: { v: "RELATÓRIO DE FREQUÊNCIA E OFERTAS - EBD", bg: "#1e3a8a", fc: "#ffffff", bl: 1 } },
        { r: 1, c: 0, v: { v: "Matrícula", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 1, v: { v: "Nome do Aluno", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 2, v: { v: "Classe EBD", bg: "#e2e8f0", bl: 1 } },
        { r: 1, c: 3, v: { v: "Presença", bg: "#dcfce7", bl: 1 } },
        { r: 1, c: 4, v: { v: "Bíblia/Revista", bg: "#e0f2fe", bl: 1 } },
        { r: 1, c: 5, v: { v: "Oferta (R$)", bg: "#fef3c7", bl: 1 } },
        { r: 2, c: 0, v: { v: "EBD-001" } },
        { r: 2, c: 1, v: { v: "Carlos Eduardo Silva" } },
        { r: 2, c: 2, v: { v: "Jovens & Adultos" } },
        { r: 2, c: 3, v: { v: "SIM" } },
        { r: 2, c: 4, v: { v: "SIM" } },
        { r: 2, c: 5, v: { v: 10.00, m: "R$ 10,00" } },
        { r: 3, c: 0, v: { v: "EBD-002" } },
        { r: 3, c: 1, v: { v: "Beatriz Souza Mendes" } },
        { r: 3, c: 2, v: { v: "Senhoras" } },
        { r: 3, c: 3, v: { v: "SIM" } },
        { r: 3, c: 4, v: { v: "SIM" } },
        { r: 3, c: 5, v: { v: 15.00, m: "R$ 15,00" } },
        { r: 4, c: 0, v: { v: "EBD-003" } },
        { r: 4, c: 1, v: { v: "Daniel Rodrigues Lima" } },
        { r: 4, c: 2, v: { v: "Adolescentes" } },
        { r: 4, c: 3, v: { v: "SIM" } },
        { r: 4, c: 4, v: { v: "NÃO" } },
        { r: 4, c: 5, v: { v: 5.00, m: "R$ 5,00" } },
        { r: 5, c: 0, v: { v: "EBD-004" } },
        { r: 5, c: 1, v: { v: "Fernanda Martins Rocha" } },
        { r: 5, c: 2, v: { v: "Crianças" } },
        { r: 5, c: 3, v: { v: "SIM" } },
        { r: 5, c: 4, v: { v: "SIM" } },
        { r: 5, c: 5, v: { v: 5.00, m: "R$ 5,00" } },
        { r: 6, c: 0, v: { v: "TOTAL", bl: 1, bg: "#f1f5f9" } },
        { r: 6, c: 1, v: { v: "RESUMO GERAL DA EBD", bl: 1, bg: "#f1f5f9" } },
        { r: 6, c: 2, v: { v: "-", bg: "#f1f5f9" } },
        { r: 6, c: 3, v: { f: '=COUNTIF(D3:D6, "SIM")', bl: 1, bg: "#dcfce7", fc: "#166534" } },
        { r: 6, c: 4, v: { f: '=COUNTIF(E3:E6, "SIM")', bl: 1, bg: "#e0f2fe", fc: "#075985" } },
        { r: 6, c: 5, v: { f: "=SUM(F3:F6)", bl: 1, bg: "#fef3c7", fc: "#854d0e" } },
      ];
    } else if (type === 'patrimonio') {
      setFileName('Inventario_de_Patrimonio_Igreja');
      newCelldata = [
        { r: 0, c: 0, v: { v: "INVENTÁRIO E TOMBAMENTO DE PATRIMÔNIO", bg: "#0f766e", fc: "#ffffff", bl: 1 } },
        { r: 1, c: 0, v: { v: "Cód. Tombamento", bg: "#ccfbf1", bl: 1 } },
        { r: 1, c: 1, v: { v: "Descrição do Bem", bg: "#ccfbf1", bl: 1 } },
        { r: 1, c: 2, v: { v: "Setor / Sala", bg: "#ccfbf1", bl: 1 } },
        { r: 1, c: 3, v: { v: "Estado de Conservação", bg: "#ccfbf1", bl: 1 } },
        { r: 1, c: 4, v: { v: "Valor Estimado (R$)", bg: "#ccfbf1", bl: 1 } },
        { r: 2, c: 0, v: { v: "PAT-2026-001" } },
        { r: 2, c: 1, v: { v: "Mesa de Som Digital 32 Canais" } },
        { r: 2, c: 2, v: { v: "Templo Principal" } },
        { r: 2, c: 3, v: { v: "Excelente" } },
        { r: 2, c: 4, v: { v: 14500.00, m: "R$ 14.500,00" } },
        { r: 3, c: 0, v: { v: "PAT-2026-002" } },
        { r: 3, c: 1, v: { v: "Ar Condicionado Split 60.000 BTUs" } },
        { r: 3, c: 2, v: { v: "Templo Principal" } },
        { r: 3, c: 3, v: { v: "Ótimo" } },
        { r: 3, c: 4, v: { v: 8900.00, m: "R$ 8.900,00" } },
        { r: 4, c: 0, v: { v: "PAT-2026-003" } },
        { r: 4, c: 1, v: { v: "Projetor Multimídia 5000 Lumens" } },
        { r: 4, c: 2, v: { v: "Galeria Superior" } },
        { r: 4, c: 3, v: { v: "Bom" } },
        { r: 4, c: 4, v: { v: 3800.00, m: "R$ 3.800,00" } },
        { r: 5, c: 0, v: { v: "PAT-2026-004" } },
        { r: 5, c: 1, v: { v: "Piano de Cauda Elétrico Yamaha" } },
        { r: 5, c: 2, v: { v: "Altar de Louvor" } },
        { r: 5, c: 3, v: { v: "Excelente" } },
        { r: 5, c: 4, v: { v: 12000.00, m: "R$ 12.000,00" } },
        { r: 6, c: 0, v: { v: "TOTAL", bl: 1, bg: "#f1f5f9" } },
        { r: 6, c: 1, v: { v: "AVALIAÇÃO TOTAL PATRIMÔNIO", bl: 1, bg: "#f1f5f9" } },
        { r: 6, c: 2, v: { v: "-", bg: "#f1f5f9" } },
        { r: 6, c: 3, v: { v: "-", bg: "#f1f5f9" } },
        { r: 6, c: 4, v: { f: "=SUM(E3:E6)", bl: 1, bg: "#ccfbf1", fc: "#0f766e" } },
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
      if (!currentSheet) {
        addToast("Sem dados para imprimir na planilha.", "warning");
        return;
      }

      const cells = getSheetCells(currentSheet);
      if (cells.length === 0) {
        addToast("A planilha está vazia. Adicione dados antes de imprimir.", "warning");
        return;
      }

      const config = currentSheet.config || {};
      const mergeConfig = config.merge || {};
      const columnlen = config.columnlen || {};
      const rowlen = config.rowlen || {};

      const cellMap = new Map<string, any>();
      let maxR = 0;
      let maxC = 0;

      cells.forEach((cell: any) => {
        const r = cell.r;
        const c = cell.c;
        if (r > maxR) maxR = r;
        if (c > maxC) maxC = c;
        cellMap.set(`${r}_${c}`, cell.v);
      });

      // Include merged ranges in maxR and maxC
      const mergeOriginsMap = new Map<string, { rs: number; cs: number }>();
      const coveredCellsSet = new Set<string>();

      Object.values(mergeConfig).forEach((m: any) => {
        if (m && typeof m.r === 'number' && typeof m.c === 'number') {
          const rs = m.rs || 1;
          const cs = m.cs || 1;
          const endR = m.r + rs - 1;
          const endC = m.c + cs - 1;
          if (endR > maxR) maxR = endR;
          if (endC > maxC) maxC = endC;

          mergeOriginsMap.set(`${m.r}_${m.c}`, { rs, cs });
          for (let r = m.r; r <= endR; r++) {
            for (let c = m.c; c <= endC; c++) {
              if (r !== m.r || c !== m.c) {
                coveredCellsSet.add(`${r}_${c}`);
              }
            }
          }
        }
      });

      const bordersMap = buildCellBordersMap(currentSheet);

      let colGroupHtml = '<colgroup>';
      for (let c = 0; c <= maxC; c++) {
        const w = columnlen[c] || 100;
        colGroupHtml += `<col style="width: ${w}px;" />`;
      }
      colGroupHtml += '</colgroup>';

      let tableHtml = `<table style="border-collapse: collapse; width: 100%; table-layout: fixed; font-family: Arial, sans-serif; font-size: 11pt;">${colGroupHtml}<tbody>`;

      for (let r = 0; r <= maxR; r++) {
        const h = rowlen[r] || 26;
        tableHtml += `<tr style="height: ${h}px;">`;

        for (let c = 0; c <= maxC; c++) {
          const key = `${r}_${c}`;
          if (coveredCellsSet.has(key)) {
            continue; // Skip covered cell in merged span
          }

          const merge = mergeOriginsMap.get(key);
          const spanAttrs = merge ? `rowspan="${merge.rs}" colspan="${merge.cs}"` : '';
          const endR = merge ? r + merge.rs - 1 : r;
          const endC = merge ? c + merge.cs - 1 : c;

          const cellObj = cellMap.get(key);
          let cellText = '';
          if (cellObj) {
            if (cellObj.m !== undefined && cellObj.m !== null) cellText = String(cellObj.m);
            else if (cellObj.v !== undefined && cellObj.v !== null) cellText = String(cellObj.v);
            else if (cellObj.f) cellText = String(cellObj.f);
          }

          const topB = bordersMap.get(key)?.top;
          const leftB = bordersMap.get(key)?.left;
          const bottomB = bordersMap.get(`${endR}_${c}`)?.bottom || bordersMap.get(key)?.bottom;
          const rightB = bordersMap.get(`${r}_${endC}`)?.right || bordersMap.get(key)?.right;

          const topCss = topB !== undefined ? borderStyleToCss(topB?.style, topB?.color) : '1px solid #cbd5e1';
          const bottomCss = bottomB !== undefined ? borderStyleToCss(bottomB?.style, bottomB?.color) : '1px solid #cbd5e1';
          const leftCss = leftB !== undefined ? borderStyleToCss(leftB?.style, leftB?.color) : '1px solid #cbd5e1';
          const rightCss = rightB !== undefined ? borderStyleToCss(rightB?.style, rightB?.color) : '1px solid #cbd5e1';

          const styleRules: string[] = [
            `border-top: ${topCss}`,
            `border-bottom: ${bottomCss}`,
            `border-left: ${leftCss}`,
            `border-right: ${rightCss}`,
            'padding: 4px 8px',
            'box-sizing: border-box',
            'overflow: hidden'
          ];

          if (cellObj) {
            if (cellObj.bg) styleRules.push(`background-color: ${cellObj.bg}`);
            if (cellObj.fc) styleRules.push(`color: ${cellObj.fc}`);
            if (cellObj.bl == 1) styleRules.push('font-weight: bold');
            if (cellObj.it == 1) styleRules.push('font-style: italic');
            if (cellObj.fs) styleRules.push(`font-size: ${cellObj.fs}pt`);
            if (cellObj.ff) styleRules.push(`font-family: ${String(cellObj.ff)}`);

            if (cellObj.ht === 0 || cellObj.ht === "0") styleRules.push('text-align: center');
            else if (cellObj.ht === 2 || cellObj.ht === "2") styleRules.push('text-align: right');
            else if (cellObj.ht === 1 || cellObj.ht === "1") styleRules.push('text-align: left');

            if (cellObj.vt === 0 || cellObj.vt === "0") styleRules.push('vertical-align: middle');
            else if (cellObj.vt === 1 || cellObj.vt === "1") styleRules.push('vertical-align: top');
            else if (cellObj.vt === 2 || cellObj.vt === "2") styleRules.push('vertical-align: bottom');

            const decs: string[] = [];
            if (cellObj.un == 1) decs.push('underline');
            if (cellObj.cl == 1) decs.push('line-through');
            if (decs.length > 0) styleRules.push(`text-decoration: ${decs.join(' ')}`);

            if (cellObj.tb === 2 || cellObj.tb === "2") {
              styleRules.push('white-space: pre-wrap', 'word-break: break-word');
            } else {
              styleRules.push('white-space: nowrap');
            }
          }

          tableHtml += `<td ${spanAttrs} style="${styleRules.join('; ')}">${cellText || '&nbsp;'}</td>`;
        }
        tableHtml += `</tr>`;
      }
      tableHtml += `</tbody></table>`;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${fileName} - Relatório de Impressão</title>
              <style>
                @page { 
                  margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm; 
                  size: ${pageSize === 'full' ? 'A4' : pageSize} ${orientation}; 
                }
                body { 
                  margin: 0;
                  padding: 10px;
                  font-family: Arial, sans-serif; 
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 20px; 
                  border-bottom: 2px solid #2563eb; 
                  padding-bottom: 10px; 
                }
                .header h2 { margin: 0; color: #1e3a8a; font-size: 18pt; font-weight: bold; }
                .header p { margin: 4px 0 0 0; color: #64748b; font-size: 10pt; }
                .gipp-planilhas-print { page-break-inside: avoid; break-inside: avoid; }
                .gipp-planilhas-print table { border-collapse: collapse !important; width: 100%; }
                .gipp-planilhas-print table td, .gipp-planilhas-print table th { border: 1px solid black !important; padding: 4px !important; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; break-inside: avoid; page-break-after: auto; }
              </style>
            </head>
            <body class="gipp-planilhas-print">
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
        const cells = getSheetCells(sheet);
        const bordersMap = buildCellBordersMap(sheet);

        cells.forEach((cell: any) => {
          const r = cell.r;
          const c = cell.c;
          const v = cell.v;
          if (!wsData[r]) wsData[r] = [];
          let cellValue: any = { t: "s", v: "" };
          if (v) {
            if (v.f) {
              const cleanFormula = normalizeFormula(String(v.f));
              const formulaStr = cleanFormula.startsWith("=") ? cleanFormula.substring(1) : cleanFormula;
              cellValue = { f: formulaStr };
              if (v.v !== undefined && v.v !== null) {
                cellValue.v = v.v;
                if (typeof v.v === 'number') cellValue.t = "n";
                else if (typeof v.v === 'boolean') cellValue.t = "b";
                else cellValue.t = "s";
              }
            } else if (v.v !== undefined && v.v !== null) {
              const num = Number(v.v);
              if (!isNaN(num) && String(v.v).trim() !== "") {
                cellValue = { t: "n", v: num };
              } else {
                cellValue = { t: "s", v: String(v.m !== undefined ? v.m : v.v) };
              }
            } else if (v.m !== undefined) {
              cellValue = { t: "s", v: String(v.m) };
            }

            const styleObj: any = {};
            if (v.bg) {
              let hex = String(v.bg).replace("#", "");
              if (hex.length === 6) hex = "FF" + hex;
              styleObj.fill = { fgColor: { rgb: hex } };
            }

            const fontObj: any = {};
            if (v.fc) {
              let hex = String(v.fc).replace("#", "");
              if (hex.length === 6) hex = "FF" + hex;
              fontObj.color = { rgb: hex };
            }
            if (v.bl == 1) fontObj.bold = true;
            if (v.it == 1) fontObj.italic = true;
            if (v.cl == 1) fontObj.strike = true;
            if (v.un == 1) fontObj.underline = true;
            if (v.fs) fontObj.sz = v.fs;
            if (v.ff) fontObj.name = String(v.ff);
            if (Object.keys(fontObj).length > 0) styleObj.font = fontObj;

            const alignObj: any = {};
            if (v.ht === 0 || v.ht === "0") alignObj.horizontal = "center";
            else if (v.ht === 1 || v.ht === "1") alignObj.horizontal = "left";
            else if (v.ht === 2 || v.ht === "2") alignObj.horizontal = "right";

            if (v.vt === 0 || v.vt === "0") alignObj.vertical = "center";
            else if (v.vt === 1 || v.vt === "1") alignObj.vertical = "top";
            else if (v.vt === 2 || v.vt === "2") alignObj.vertical = "bottom";

            if (v.tb === 2 || v.tb === "2") alignObj.wrapText = true;

            if (Object.keys(alignObj).length > 0) styleObj.alignment = alignObj;

            if (Object.keys(styleObj).length > 0) {
              cellValue.s = styleObj;
            }
          }
          wsData[r][c] = cellValue;
        });

        // Apply borders from bordersMap to wsData
        bordersMap.forEach((borderInfo, key) => {
          const [r, c] = key.split('_').map(Number);
          if (!wsData[r]) wsData[r] = [];
          if (!wsData[r][c]) wsData[r][c] = { t: "z", s: {} };
          if (!wsData[r][c].s) wsData[r][c].s = {};

          const borderObjXLSX: any = {};
          if (borderInfo.top && borderInfo.top.style !== "none") {
            borderObjXLSX.top = { style: borderStyleToXLSX(borderInfo.top.style), color: { rgb: formatHexForXLSX(borderInfo.top.color) } };
          }
          if (borderInfo.bottom && borderInfo.bottom.style !== "none") {
            borderObjXLSX.bottom = { style: borderStyleToXLSX(borderInfo.bottom.style), color: { rgb: formatHexForXLSX(borderInfo.bottom.color) } };
          }
          if (borderInfo.left && borderInfo.left.style !== "none") {
            borderObjXLSX.left = { style: borderStyleToXLSX(borderInfo.left.style), color: { rgb: formatHexForXLSX(borderInfo.left.color) } };
          }
          if (borderInfo.right && borderInfo.right.style !== "none") {
            borderObjXLSX.right = { style: borderStyleToXLSX(borderInfo.right.style), color: { rgb: formatHexForXLSX(borderInfo.right.color) } };
          }

          if (Object.keys(borderObjXLSX).length > 0) {
            wsData[r][c].s.border = borderObjXLSX;
          }
        });

        for (let i = 0; i < wsData.length; i++) {
          if (!wsData[i]) wsData[i] = [];
          for (let j = 0; j < wsData[i].length; j++) {
            if (wsData[i][j] === undefined) {
              wsData[i][j] = { t: "z" };
            }
          }
        }
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        ws["!views"] = [{ showGridLines: true }];

        if (sheet.config?.merge) {
          const merges: XLSX.Range[] = [];
          Object.values(sheet.config.merge).forEach((m: any) => {
            if (m && typeof m.r === "number" && typeof m.c === "number") {
              merges.push({
                s: { r: m.r, c: m.c },
                e: { r: m.r + (m.rs || 1) - 1, c: m.c + (m.cs || 1) - 1 },
              });
            }
          });
          if (merges.length > 0) ws["!merges"] = merges;
        }

        if (sheet.config?.columnlen) {
          const cols: any[] = [];
          Object.keys(sheet.config.columnlen).forEach((colIdx) => {
            const c = Number(colIdx);
            const px = sheet.config.columnlen[colIdx];
            cols[c] = { wpx: px };
          });
          if (cols.length > 0) ws["!cols"] = cols;
        }

        if (sheet.config?.rowlen) {
          const rows: any[] = [];
          Object.keys(sheet.config.rowlen).forEach((rowIdx) => {
            const r = Number(rowIdx);
            const px = sheet.config.rowlen[rowIdx];
            rows[r] = { hpx: px };
          });
          if (rows.length > 0) ws["!rows"] = rows;
        }

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
                  const rawFormula = normalizeFormula(String(cell.f).trim());
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
        <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md p-1">
          <GippSheetsIcon size={22} />
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
        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mr-1 shrink-0 shadow-sm p-1.5">
          <GippSheetsIcon size={26} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="font-medium text-slate-800 text-lg bg-transparent border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white border rounded px-2 py-0.5 outline-none transition-colors w-full max-w-md truncate"
            placeholder="Nome da planilha"
          />
          <div className="flex items-center space-x-1 mt-0.5 text-[13px] text-slate-700 gipp-planilhas-menu-container relative z-[100]">
            {/* ARQUIVO */}
            <div className="relative">
              <button 
                className={`px-2.5 py-1 rounded transition-colors ${activeMenu === 'arquivo' ? 'bg-slate-200 font-semibold text-slate-900' : 'hover:bg-slate-100'}`}
                onClick={() => setActiveMenu(activeMenu === 'arquivo' ? null : 'arquivo')}
                onMouseEnter={() => activeMenu && setActiveMenu('arquivo')}
              >
                Arquivo
              </button>
              {activeMenu === 'arquivo' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-[200] text-xs font-sans text-slate-700 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                  <div className="py-1">
                    <button onClick={() => { 
                      setSheetData([{ name: "Página 1", id: "1", status: 1, celldata: [] }]); 
                      setFileName('Planilha sem título'); 
                      setSheetKey(k => k + 1); 
                      setActiveMenu(null); 
                    }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2.5"><FileSpreadsheet size={15} className="text-emerald-600" /> Nova Planilha</span>
                      <span className="text-[10px] text-slate-400 font-mono">Ctrl+N</span>
                    </button>
                    <button onClick={() => { triggerFileOpen(); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2.5"><FolderOpen size={15} className="text-amber-600" /> Abrir Arquivo...</span>
                      <span className="text-[10px] text-slate-400 font-mono">Ctrl+O</span>
                    </button>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { handleSaveFile(); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2.5"><Save size={15} className="text-emerald-600" /> Salvar (.GPLAN)</span>
                      <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
                    </button>
                    <button onClick={() => { handleExportXLSX(); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2.5"><Download size={15} className="text-blue-600" /> Exportar para Excel (.XLSX)</span>
                    </button>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { handlePrintSheet(); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2.5"><Printer size={15} className="text-slate-600" /> Imprimir Planilha...</span>
                      <span className="text-[10px] text-slate-400 font-mono">Ctrl+P</span>
                    </button>
                    <button onClick={() => { setShowMargins(true); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2.5"><Settings size={15} className="text-slate-600" /> Configurar Tela & Dimensões</span>
                    </button>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { setView('dashboard'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-rose-50 hover:text-rose-700 flex items-center justify-between transition-colors text-rose-600 font-medium">
                      <span className="flex items-center gap-2.5"><X size={15} /> Fechar / Sair</span>
                      <span className="text-[10px] text-rose-400 font-mono">Alt+F4</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* EDITAR */}
            <div className="relative">
              <button 
                className={`px-2.5 py-1 rounded transition-colors ${activeMenu === 'editar' ? 'bg-slate-200 font-semibold text-slate-900' : 'hover:bg-slate-100'}`}
                onClick={() => setActiveMenu(activeMenu === 'editar' ? null : 'editar')}
                onMouseEnter={() => activeMenu && setActiveMenu('editar')}
              >
                Editar
              </button>
              {activeMenu === 'editar' && (
                <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-[200] text-xs font-sans text-slate-700 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                  <div className="py-1">
                    <button onClick={() => { handleOpenFormatModal(); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors font-medium">
                      <Paintbrush size={15} className="text-emerald-600" /> Formatar Células Selecionadas...
                    </button>
                  </div>
                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temas de Tabela</div>
                    <button onClick={() => { applyThemeToSheet('azul'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors">
                      <span className="w-3 h-3 rounded-full bg-blue-700 inline-block"></span> Estilo Azul Executivo
                    </button>
                    <button onClick={() => { applyThemeToSheet('verde'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors">
                      <span className="w-3 h-3 rounded-full bg-emerald-700 inline-block"></span> Estilo Verde Esmeralda
                    </button>
                    <button onClick={() => { applyThemeToSheet('purpura'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 transition-colors">
                      <span className="w-3 h-3 rounded-full bg-purple-700 inline-block"></span> Estilo Púrpura Imperial
                    </button>
                    <button onClick={() => { applyThemeToSheet('cinza'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 hover:text-slate-800 flex items-center gap-2.5 transition-colors">
                      <span className="w-3 h-3 rounded-full bg-slate-700 inline-block"></span> Estilo Cinza Corporativo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* EXIBIR */}
            <div className="relative">
              <button 
                className={`px-2.5 py-1 rounded transition-colors ${activeMenu === 'exibir' ? 'bg-slate-200 font-semibold text-slate-900' : 'hover:bg-slate-100'}`}
                onClick={() => setActiveMenu(activeMenu === 'exibir' ? null : 'exibir')}
                onMouseEnter={() => activeMenu && setActiveMenu('exibir')}
              >
                Exibir
              </button>
              {activeMenu === 'exibir' && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-[200] text-xs font-sans text-slate-700 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                  <div className="py-1">
                    <button onClick={() => { handleZoomIn(); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2.5"><Plus size={15} /> Aumentar Zoom</span>
                      <span className="text-[10px] text-slate-400 font-mono">+10%</span>
                    </button>
                    <button onClick={() => { handleZoomOut(); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2.5"><Minus size={15} /> Diminuir Zoom</span>
                      <span className="text-[10px] text-slate-400 font-mono">-10%</span>
                    </button>
                    <button onClick={() => { setZoom(100); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2.5"><Maximize size={15} /> Resetar Zoom (100%)</span>
                    </button>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { setShowMargins(!showMargins); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2.5"><Settings size={15} /> Dimensões da Tela ({showMargins ? 'Visível' : 'Oculto'})</span>
                    </button>
                    <button onClick={() => { setIsFullscreen(!isFullscreen); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors">
                      <span className="flex items-center gap-2.5"><Maximize size={15} /> {isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">F11</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* INSERIR / FÓRMULAS */}
            <div className="relative">
              <button 
                className={`px-2.5 py-1 rounded transition-colors ${activeMenu === 'inserir' ? 'bg-slate-200 font-semibold text-slate-900' : 'hover:bg-slate-100'}`}
                onClick={() => setActiveMenu(activeMenu === 'inserir' ? null : 'inserir')}
                onMouseEnter={() => activeMenu && setActiveMenu('inserir')}
              >
                Fórmulas
              </button>
              {activeMenu === 'inserir' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-[200] text-xs font-sans text-slate-700 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                  <div className="py-1">
                    <button onClick={() => { setShowFormulaModal(true); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-indigo-50 hover:text-indigo-800 flex items-center gap-2.5 transition-colors font-medium">
                      <span className="font-serif italic font-bold text-indigo-600">fx</span> Guia de Fórmulas & Funções (SOMA, SE, PROCV...)
                    </button>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { handleOpenFormatModal(); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors">
                      <Paintbrush size={15} className="text-emerald-600" /> Formatar Números, Moedas e Porcentagem
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* FORMATAR */}
            <div className="relative">
              <button 
                className={`px-2.5 py-1 rounded transition-colors ${activeMenu === 'formatar' ? 'bg-slate-200 font-semibold text-slate-900' : 'hover:bg-slate-100'}`}
                onClick={() => setActiveMenu(activeMenu === 'formatar' ? null : 'formatar')}
                onMouseEnter={() => activeMenu && setActiveMenu('formatar')}
              >
                Formatar
              </button>
              {activeMenu === 'formatar' && (
                <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-[200] text-xs font-sans text-slate-700 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                  <div className="py-1">
                    <button onClick={() => { handleOpenFormatModal(); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors font-medium">
                      <Paintbrush size={15} className="text-emerald-600" /> Formatar Células (Fonte, Borda, Alinhamento)
                    </button>
                  </div>
                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estilos de Tabela</div>
                    <button onClick={() => { applyThemeToSheet('azul'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors">
                      <span>🔷 Azul Executivo</span>
                    </button>
                    <button onClick={() => { applyThemeToSheet('verde'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors">
                      <span>🟢 Verde Esmeralda</span>
                    </button>
                    <button onClick={() => { applyThemeToSheet('purpura'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 transition-colors">
                      <span>🟣 Púrpura Imperial</span>
                    </button>
                    <button onClick={() => { applyThemeToSheet('cinza'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 hover:text-slate-800 flex items-center gap-2.5 transition-colors">
                      <span>🩶 Cinza Corporativo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MODELOS */}
            <div className="relative">
              <button 
                className={`px-2.5 py-1 rounded transition-colors ${activeMenu === 'modelos' ? 'bg-slate-200 font-semibold text-slate-900' : 'hover:bg-slate-100'}`}
                onClick={() => setActiveMenu(activeMenu === 'modelos' ? null : 'modelos')}
                onMouseEnter={() => activeMenu && setActiveMenu('modelos')}
              >
                Modelos
              </button>
              {activeMenu === 'modelos' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-[200] text-xs font-sans text-slate-700 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                  <div className="py-1">
                    <button onClick={() => { loadSheetTemplate('fluxo_caixa'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors font-medium">
                      <span>💰 Relatório de Fluxo de Caixa</span>
                    </button>
                    <button onClick={() => { loadSheetTemplate('dizimos'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors font-medium">
                      <span>📜 Controle de Dízimos e Ofertas</span>
                    </button>
                    <button onClick={() => { loadSheetTemplate('escala'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors font-medium">
                      <span>📅 Escala de Cultos e Louvor</span>
                    </button>
                    <button onClick={() => { loadSheetTemplate('ebd_frequencia'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors font-medium">
                      <span>📚 Chamada e Frequência EBD</span>
                    </button>
                    <button onClick={() => { loadSheetTemplate('patrimonio'); setActiveMenu(null); }} className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors font-medium">
                      <span>🏷️ Inventário de Patrimônio</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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

          <button
            onClick={() => setShowFormulaModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm"
            title="Guia de Fórmulas e Funções da Planilha"
          >
            <span className="font-serif italic font-bold">fx</span> Fórmulas
          </button>

          <button
            onClick={handleOpenFormatModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm"
            title="Formatar Células: Fontes, Números, Moedas, Percentual e Bordas (Excel)"
          >
            <Paintbrush size={16} /> Formatar Células
          </button>

          <select 
            onChange={(e) => {
              if (e.target.value) {
                applyThemeToSheet(e.target.value as any);
                e.target.value = '';
              }
            }}
            className="h-8 border border-indigo-300 bg-indigo-50 text-indigo-900 font-bold rounded-lg px-2 outline-none text-xs hover:bg-indigo-100 transition-all cursor-pointer shadow-sm"
          >
            <option value="">🎨 Estilos de Tabela...</option>
            <option value="azul">🔷 Azul Executivo</option>
            <option value="verde">🟢 Verde Esmeralda</option>
            <option value="purpura">🟣 Púrpura Imperial</option>
            <option value="cinza">🩶 Cinza Corporativo</option>
          </select>

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
            <option value="ebd_frequencia">📚 Chamada e Frequência EBD</option>
            <option value="patrimonio">🏷️ Inventário de Patrimônio</option>
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
                currency="R$"
                showToolbar={true}
                showSheetTabs={true}
                showFormulaBar={true}
                onChange={(data) => setSheetData(data)}
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
                  currency="R$"
                  showToolbar={true}
                  showSheetTabs={true}
                  showFormulaBar={true}
                  onChange={(data) => setSheetData(data)}
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

      {/* Modal de Guia de Fórmulas */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-entrance flex flex-col max-h-[85vh]">
            <div className="p-4 bg-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                <span className="font-serif italic text-xl text-indigo-300">fx</span> Guia de Fórmulas e Funções
              </div>
              <button 
                onClick={() => setShowFormulaModal(false)}
                className="p-1 hover:bg-indigo-800 rounded text-slate-300 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 bg-indigo-50/50 flex gap-2">
              <button 
                onClick={() => setSelectedFormulaCategory('all')} 
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedFormulaCategory === 'all' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
              >
                Todas (8)
              </button>
              <button 
                onClick={() => setSelectedFormulaCategory('fin')} 
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedFormulaCategory === 'fin' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
              >
                💰 Financeiro
              </button>
              <button 
                onClick={() => setSelectedFormulaCategory('stats')} 
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedFormulaCategory === 'stats' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
              >
                📊 Estatísticas
              </button>
              <button 
                onClick={() => setSelectedFormulaCategory('logic')} 
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedFormulaCategory === 'logic' ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
              >
                ⚡ Lógica e Busca
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar text-xs">
              {(selectedFormulaCategory === 'all' || selectedFormulaCategory === 'fin') && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between font-mono font-bold text-indigo-700 text-sm mb-1">
                    <span>=SUM(intervalo) ou =SOMA(intervalo)</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('=SUM(B2:B10)');
                        addToast("Fórmula =SUM(B2:B10) copiada!", "success");
                      }}
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-sans font-bold"
                    >
                      Copiar
                    </button>
                  </div>
                  <p className="text-slate-600 mb-1">Soma todos os números nas células do intervalo especificado.</p>
                  <div className="bg-white p-1.5 rounded border border-slate-200 font-mono text-[11px] text-slate-500">Exemplo: =SUM(D2:D20) — calcula o total de dízimos ou saídas.</div>
                </div>
              )}

              {(selectedFormulaCategory === 'all' || selectedFormulaCategory === 'fin') && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between font-mono font-bold text-indigo-700 text-sm mb-1">
                    <span>=AVERAGE(intervalo) ou =MÉDIA(intervalo)</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('=AVERAGE(B2:B12)');
                        addToast("Fórmula =AVERAGE(B2:B12) copiada!", "success");
                      }}
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-sans font-bold"
                    >
                      Copiar
                    </button>
                  </div>
                  <p className="text-slate-600 mb-1">Calcula a média aritmética dos valores do intervalo.</p>
                  <div className="bg-white p-1.5 rounded border border-slate-200 font-mono text-[11px] text-slate-500">Exemplo: =AVERAGE(C2:C13) — calcula a arrecadação média mensal.</div>
                </div>
              )}

              {(selectedFormulaCategory === 'all' || selectedFormulaCategory === 'stats') && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between font-mono font-bold text-indigo-700 text-sm mb-1">
                    <span>=COUNTIF(intervalo, critério)</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('=COUNTIF(C2:C50, "Ativo")');
                        addToast('Fórmula =COUNTIF(C2:C50, "Ativo") copiada!', "success");
                      }}
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-sans font-bold"
                    >
                      Copiar
                    </button>
                  </div>
                  <p className="text-slate-600 mb-1">Conta quantas células atendem a uma determinada condição.</p>
                  <div className="bg-white p-1.5 rounded border border-slate-200 font-mono text-[11px] text-slate-500">Exemplo: =COUNTIF(D2:D100, "Membro Ativo") — totaliza membros ativos.</div>
                </div>
              )}

              {(selectedFormulaCategory === 'all' || selectedFormulaCategory === 'logic') && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between font-mono font-bold text-indigo-700 text-sm mb-1">
                    <span>=IF(teste, valor_verdadeiro, valor_falso)</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('=IF(D5>0, "Superávit", "Déficit")');
                        addToast('Fórmula =IF(...) copiada!', "success");
                      }}
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-sans font-bold"
                    >
                      Copiar
                    </button>
                  </div>
                  <p className="text-slate-600 mb-1">Avalia uma condição lógica e retorna o valor correspondente.</p>
                  <div className="bg-white p-1.5 rounded border border-slate-200 font-mono text-[11px] text-slate-500">Exemplo: =IF(E10&gt;=0, "Positivo", "Atenção") — balanço financeiro.</div>
                </div>
              )}

              {(selectedFormulaCategory === 'all' || selectedFormulaCategory === 'logic') && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between font-mono font-bold text-indigo-700 text-sm mb-1">
                    <span>=VLOOKUP(valor, matriz, col_idx, [exato])</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('=VLOOKUP(A2, Membros!A:E, 2, FALSE)');
                        addToast("Fórmula =VLOOKUP(...) copiada!", "success");
                      }}
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-sans font-bold"
                    >
                      Copiar
                    </button>
                  </div>
                  <p className="text-slate-600 mb-1">Procura um valor na primeira coluna de uma tabela e retorna o valor de outra coluna.</p>
                  <div className="bg-white p-1.5 rounded border border-slate-200 font-mono text-[11px] text-slate-500">Exemplo: =VLOOKUP(Rol_001, Membros!A:D, 2, FALSE) — busca o nome do dízimista.</div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 text-right">
              <button 
                onClick={() => setShowFormulaModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-1.5 rounded-lg text-xs shadow-md transition-colors"
              >
                Entendi / Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formatação de Células (Excel Style) */}
      {showFormatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-entrance flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-700 rounded-xl shadow-xs">
                  <Paintbrush size={22} className="text-emerald-200" />
                </span>
                <div>
                  <h3 className="font-bold text-base leading-tight">Formatar Células & Bordas</h3>
                  <p className="text-xs text-emerald-200 font-medium">Estilos de números, fontes, moedas e bordas estilo Excel</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFormatModal(false)}
                className="p-1.5 hover:bg-emerald-700 rounded-lg text-emerald-200 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Range Input & Presets Bar */}
            <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <Grid size={14} className="text-emerald-700" /> Células / Intervalo:
                </label>
                <input 
                  type="text" 
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="Ex: A1:D10 ou B2"
                  className="bg-white border border-slate-300 font-mono font-bold text-emerald-800 px-3 py-1 rounded-lg w-28 text-center outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 shadow-2xs uppercase"
                />
                <span className="text-[10px] text-slate-500 font-medium">(Ex: A1, B2:E10)</span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
                <span className="font-bold text-slate-500 text-[10px] uppercase mr-1">Atalhos:</span>
                <button
                  type="button"
                  onClick={() => handleApplyCellFormatting({ overrideBg: '#1e3a8a', overrideFc: '#ffffff', overrideBold: true })}
                  className="bg-blue-900 text-white font-bold px-2 py-1 rounded hover:bg-blue-950 text-[10px] transition-all shadow-2xs"
                  title="Aplicar Cabeçalho Azul"
                >
                  🔷 Azul
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCellFormatting({ overrideBg: '#065f46', overrideFc: '#ffffff', overrideBold: true })}
                  className="bg-emerald-800 text-white font-bold px-2 py-1 rounded hover:bg-emerald-900 text-[10px] transition-all shadow-2xs"
                  title="Aplicar Cabeçalho Verde"
                >
                  🟢 Verde
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCellFormatting({ overrideNumberFormat: 'currency_brl', overrideBg: '#dcfce7', overrideFc: '#166534', overrideBold: true })}
                  className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-1 rounded hover:bg-emerald-200 text-[10px] transition-all shadow-2xs"
                  title="Aplicar Destaque de Moeda R$"
                >
                  💵 Moeda R$
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCellFormatting({ overrideBg: '#f1f5f9', overrideFc: '#0f172a', overrideBold: true })}
                  className="bg-slate-200 text-slate-800 font-bold px-2 py-1 rounded hover:bg-slate-300 text-[10px] transition-all shadow-2xs"
                  title="Aplicar Estilo Totalizacao"
                >
                  📊 Total
                </button>
              </div>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2 gap-2 text-xs font-bold">
              <button 
                onClick={() => setFormatTab('number')} 
                className={`py-2.5 px-4 rounded-t-xl transition-all border-t border-x flex items-center gap-1.5 ${formatTab === 'number' ? 'bg-white border-slate-200 text-emerald-700 shadow-2xs font-extrabold border-b-transparent -mb-px' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <DollarSign size={15} /> Número & Moeda
              </button>
              <button 
                onClick={() => setFormatTab('font')} 
                className={`py-2.5 px-4 rounded-t-xl transition-all border-t border-x flex items-center gap-1.5 ${formatTab === 'font' ? 'bg-white border-slate-200 text-emerald-700 shadow-2xs font-extrabold border-b-transparent -mb-px' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <Type size={15} /> Fonte & Cores
              </button>
              <button 
                onClick={() => setFormatTab('align')} 
                className={`py-2.5 px-4 rounded-t-xl transition-all border-t border-x flex items-center gap-1.5 ${formatTab === 'align' ? 'bg-white border-slate-200 text-emerald-700 shadow-2xs font-extrabold border-b-transparent -mb-px' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <AlignCenter size={15} /> Alinhamento
              </button>
              <button 
                onClick={() => setFormatTab('border')} 
                className={`py-2.5 px-4 rounded-t-xl transition-all border-t border-x flex items-center gap-1.5 ${formatTab === 'border' ? 'bg-white border-slate-200 text-emerald-700 shadow-2xs font-extrabold border-b-transparent -mb-px' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <Grid size={15} /> Bordas da Célula
              </button>
            </div>

            {/* Modal Body / Tab Contents */}
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4 text-xs">

              {/* TAB 1: NÚMERO E MOEDA */}
              {formatTab === 'number' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Select Category */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700 uppercase tracking-wide text-[11px]">Categoria do Formato:</label>
                      <div className="space-y-1.5">
                        {[
                          { id: 'currency_brl', label: 'Moeda Real (R$ 1.250,50)', icon: '💵', desc: 'Formatação contábil padrão do Brasil com símbolo R$' },
                          { id: 'currency_usd', label: 'Moeda Dólar ($ 1,250.50)', icon: '💲', desc: 'Formatação financeira em dólares americanos' },
                          { id: 'percent', label: 'Porcentagem (15,00%)', icon: '📊', desc: 'Multiplica por 100 e exibe com o símbolo %' },
                          { id: 'decimal', label: 'Número Decimal (1.250,50)', icon: '🔢', desc: 'Exibe valores numéricos com casas decimais configuráveis' },
                          { id: 'date', label: 'Data (DD/MM/AAAA)', icon: '📅', desc: 'Formatação para datas e calendários' },
                          { id: 'text', label: 'Texto Puro', icon: '📝', desc: 'Trata o conteúdo estritamente como texto sem cálculos' },
                          { id: 'general', label: 'Geral (Sem Formato)', icon: '⚙️', desc: 'Remover formatação específica da célula' },
                        ].map((fmt) => (
                          <div 
                            key={fmt.id}
                            onClick={() => setNumberFormat(fmt.id as any)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${numberFormat === fmt.id ? 'bg-emerald-50/90 border-emerald-500 ring-1 ring-emerald-400' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                          >
                            <span className="text-lg">{fmt.icon}</span>
                            <div className="flex-1">
                              <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                                <span>{fmt.label}</span>
                                {numberFormat === fmt.id && <Check size={14} className="text-emerald-600" />}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">{fmt.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Options & Live Preview */}
                    <div className="space-y-4">
                      {(numberFormat === 'decimal' || numberFormat === 'percent' || numberFormat === 'currency_brl' || numberFormat === 'currency_usd') && (
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                          <label className="block font-bold text-slate-700 text-xs">Casas Decimais:</label>
                          <div className="flex items-center gap-2">
                            {[0, 1, 2, 3, 4].map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setDecimals(d)}
                                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${decimals === d ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Live Preview Box */}
                      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-4 rounded-2xl shadow-md space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">Exemplo de Exibição / Prévia</span>
                        <div className="bg-white/10 p-3 rounded-xl border border-white/20 font-mono font-bold text-lg text-emerald-200 text-center tracking-wide">
                          {numberFormat === 'currency_brl' && "R$ 1.250,50"}
                          {numberFormat === 'currency_usd' && "$ 1,250.50"}
                          {numberFormat === 'percent' && `${(0.155 * 100).toFixed(decimals)}%`}
                          {numberFormat === 'decimal' && (1250.5).toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                          {numberFormat === 'date' && "2026-07-22"}
                          {numberFormat === 'text' && "Texto de Exemplo"}
                          {numberFormat === 'general' && "1250.5"}
                        </div>
                        <p className="text-[11px] text-slate-300 text-center font-medium">
                          Este formato será aplicado às células no intervalo selecionado ({rangeInput.toUpperCase()}).
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: FONTE E CORES */}
              {formatTab === 'font' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Font Selector */}
                    <div className="space-y-3 bg-slate-50 p-3.5 border border-slate-200 rounded-xl">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Família da Fonte:</label>
                        <select 
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-800 bg-white outline-none focus:border-emerald-600"
                        >
                          <option value="Arial">Arial (Padrão)</option>
                          <option value="Calibri">Calibri</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Courier New">Courier New (Monospaced)</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Trebuchet MS">Trebuchet MS</option>
                          <option value="Consolas">Consolas</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tamanho da Fonte (px):</label>
                        <div className="flex flex-wrap gap-1.5">
                          {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setFontSize(sz)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${fontSize === sz ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Style Toggles */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Estilos de Texto:</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setIsBold(!isBold)}
                            className={`flex-1 py-1.5 font-black text-sm rounded-lg border transition-all ${isBold ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                          >
                            N (Negrito)
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsItalic(!isItalic)}
                            className={`flex-1 py-1.5 italic font-bold text-sm rounded-lg border transition-all ${isItalic ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                          >
                            I (Itálico)
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsUnderline(!isUnderline)}
                            className={`flex-1 py-1.5 underline font-bold text-sm rounded-lg border transition-all ${isUnderline ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                          >
                            S (Sublinhado)
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsStrike(!isStrike)}
                            className={`flex-1 py-1.5 line-through font-bold text-sm rounded-lg border transition-all ${isStrike ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                          >
                            T (Tachado)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Colors & Fill */}
                    <div className="space-y-3 bg-slate-50 p-3.5 border border-slate-200 rounded-xl">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Cor do Texto (Fonte):</label>
                        <div className="flex items-center gap-2 mb-2">
                          <input 
                            type="color" 
                            value={fontColor} 
                            onChange={(e) => setFontColor(e.target.value)}
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white" 
                          />
                          <span className="font-mono font-bold text-xs uppercase text-slate-700">{fontColor}</span>
                        </div>
                        {/* Quick Palette Text */}
                        <div className="flex flex-wrap gap-1.5">
                          {['#000000', '#ffffff', '#1e3a8a', '#065f46', '#991b1b', '#6b21a8', '#334155', '#2563eb'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setFontColor(c)}
                              style={{ backgroundColor: c }}
                              className={`w-6 h-6 rounded-md border ${fontColor === c ? 'ring-2 ring-emerald-500 scale-110' : 'border-slate-300'}`}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-slate-700">Cor de Fundo (Preenchimento):</label>
                          <button
                            type="button"
                            onClick={() => setBgColor('')}
                            className="text-[10px] font-bold text-rose-600 hover:underline"
                          >
                            Remover Fundo
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <input 
                            type="color" 
                            value={bgColor || '#ffffff'} 
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white" 
                          />
                          <span className="font-mono font-bold text-xs uppercase text-slate-700">{bgColor || 'Transparente'}</span>
                        </div>
                        {/* Quick Palette Background */}
                        <div className="flex flex-wrap gap-1.5">
                          {['#ffffff', '#f1f5f9', '#dcfce7', '#e0f2fe', '#fee2e2', '#fef3c7', '#f3e8ff', '#1e3a8a', '#065f46'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setBgColor(c)}
                              style={{ backgroundColor: c }}
                              className={`w-6 h-6 rounded-md border ${bgColor === c ? 'ring-2 ring-emerald-500 scale-110' : 'border-slate-300'}`}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: ALINHAMENTO */}
              {formatTab === 'align' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Horizontal Alignment */}
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                      <label className="block font-bold text-slate-700 text-xs">Alinhamento Horizontal:</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setHorizontalAlign(1)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${horizontalAlign === 1 ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                        >
                          <AlignLeft size={20} />
                          <span className="text-[11px]">Esquerda</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setHorizontalAlign(0)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${horizontalAlign === 0 ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                        >
                          <AlignCenter size={20} />
                          <span className="text-[11px]">Centro</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setHorizontalAlign(2)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${horizontalAlign === 2 ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                        >
                          <AlignRight size={20} />
                          <span className="text-[11px]">Direita</span>
                        </button>
                      </div>
                    </div>

                    {/* Vertical Alignment */}
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                      <label className="block font-bold text-slate-700 text-xs">Alinhamento Vertical:</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setVerticalAlign(1)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${verticalAlign === 1 ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                        >
                          <span className="text-base font-bold">⬆️</span>
                          <span className="text-[11px]">Superior</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVerticalAlign(0)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${verticalAlign === 0 ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                        >
                          <span className="text-base font-bold">↕️</span>
                          <span className="text-[11px]">Centro</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVerticalAlign(2)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${verticalAlign === 2 ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                        >
                          <span className="text-base font-bold">⬇️</span>
                          <span className="text-[11px]">Inferior</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 4: BORDAS DA CÉLULA */}
              {formatTab === 'border' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Border Options */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700 uppercase tracking-wide text-[11px]">Tipo de Borda:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'border-all', label: 'Todas as Bordas', icon: '🔳', desc: 'Grades internas e externas' },
                          { id: 'border-outside', label: 'Contorno Externo', icon: '🔲', desc: 'Borda apenas ao redor da seleção' },
                          { id: 'border-top', label: 'Borda Superior', icon: '⬆️', desc: 'Borda apenas na parte superior' },
                          { id: 'border-bottom', label: 'Borda Inferior', icon: '⬇️', desc: 'Borda apenas na parte inferior' },
                          { id: 'border-double-bottom', label: 'Dupla Inferior', icon: '⏹️', desc: 'Linha dupla para totais contábeis' },
                          { id: 'none', label: 'Sem Bordas', icon: '🚫', desc: 'Remover bordas da seleção' },
                        ].map((b) => (
                          <div 
                            key={b.id}
                            onClick={() => setBorderType(b.id)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2 ${borderType === b.id ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                          >
                            <span className="text-lg">{b.icon}</span>
                            <div className="flex-1">
                              <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                                <span>{b.label}</span>
                                {borderType === b.id && <Check size={14} className="text-emerald-600" />}
                              </div>
                              <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{b.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Border Line Style & Colors */}
                    <div className="space-y-3 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Cor da Linha da Borda:</label>
                        <div className="flex items-center gap-2 mb-2">
                          <input 
                            type="color" 
                            value={borderColor} 
                            onChange={(e) => setBorderColor(e.target.value)}
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white" 
                          />
                          <span className="font-mono font-bold text-xs uppercase text-slate-700">{borderColor}</span>
                        </div>
                        {/* Quick Border Colors */}
                        <div className="flex flex-wrap gap-1.5">
                          {['#000000', '#1e3a8a', '#065f46', '#991b1b', '#64748b', '#cbd5e1', '#2563eb'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setBorderColor(c)}
                              style={{ backgroundColor: c }}
                              className={`w-6 h-6 rounded-md border ${borderColor === c ? 'ring-2 ring-emerald-500 scale-110' : 'border-slate-300'}`}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <label className="block font-bold text-slate-700 mb-1">Espessura / Estilo do Traço:</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setBorderStyle('1')}
                            className={`p-2 rounded-lg border font-bold text-xs text-center transition-all ${borderStyle === '1' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300 text-slate-700'}`}
                          >
                            Fina (1px)
                          </button>
                          <button
                            type="button"
                            onClick={() => setBorderStyle('2')}
                            className={`p-2 rounded-lg border font-bold text-xs text-center transition-all ${borderStyle === '2' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300 text-slate-700'}`}
                          >
                            Média (2px)
                          </button>
                          <button
                            type="button"
                            onClick={() => setBorderStyle('3')}
                            className={`p-2 rounded-lg border font-bold text-xs text-center transition-all ${borderStyle === '3' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300 text-slate-700'}`}
                          >
                            Grossa (3px)
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-medium">
                Aplicação no intervalo: <strong className="text-emerald-800 font-mono font-bold uppercase">{rangeInput}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setShowFormatModal(false)}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => handleApplyCellFormatting()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check size={16} /> Aplicar Formatação
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      <div className="h-8 bg-slate-100 border-t border-slate-200 shrink-0 flex items-center px-4 justify-between text-xs text-slate-600 font-medium relative select-none">
        <div className="flex items-center gap-3">
          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">GIPP Planilhas v1.0</span>
          <span className="hidden sm:inline border-l border-slate-300 pl-3">
            📊 Modo Células Livres • Fórmulas Excel Habilitadas
          </span>
        </div>
        <div className="flex items-center gap-4 mr-6">
          <span className="truncate max-w-[160px] font-semibold text-slate-700">{fileName}</span>
          {lastSavedTime ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
              <FileCheck size={12} /> Salvo ({lastSavedTime.toLocaleTimeString()})
            </span>
          ) : (
            <span className="text-slate-500">Salvo localmente</span>
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

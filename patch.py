import re

with open('src/components/ModuleGippPlanilhas.tsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace('import { ChurchContext } from "../App";', '''import { ChurchContext } from "../App";
import * as XLSX from "xlsx";
import { Download, LayoutTemplate } from "lucide-react";''')

# Add state variables
content = content.replace('const [sheetData, setSheetData] = useState<any[]>([', '''
  const [showMargins, setShowMargins] = useState(false);
  const [marginType, setMarginType] = useState('padrao'); // padrao, moderado, estreito

  const [sheetData, setSheetData] = useState<any[]>([
''')

# Add handleExportXLSX function
export_func = '''
  const handleExportXLSX = () => {
    if (!workbookRef.current) return;
    try {
        const data = workbookRef.current.getAllSheets();
        const wb = XLSX.utils.book_new();
        data.forEach(sheet => {
            const wsData: any[][] = [];
            if (sheet.celldata) {
                sheet.celldata.forEach((cell: any) => {
                    const r = cell.r;
                    const c = cell.c;
                    const v = cell.v;
                    if (!wsData[r]) wsData[r] = [];
                    let cellValue: any = { t: 's', v: '' };
                    if (v) {
                        if (v.f) {
                            cellValue = { t: 'n', f: v.f.startsWith('=') ? v.f.substring(1) : v.f };
                            // Add value if available
                            if (v.v !== undefined) {
                                cellValue.v = v.v;
                            }
                        } else if (v.v !== undefined && v.v !== null) {
                            const num = Number(v.v);
                            if (!isNaN(num) && v.v !== '') {
                                cellValue = { t: 'n', v: num };
                            } else {
                                cellValue = { t: 's', v: String(v.m || v.v) };
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
                        wsData[i][j] = { t: 'z' };
                    }
                }
            }
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const margins = marginType === 'padrao' ? { left: 0.75, right: 0.75, top: 1.0, bottom: 1.0, header: 0.5, footer: 0.5 } 
                          : marginType === 'moderado' ? { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
                          : { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 };
            ws['!margins'] = margins;
            XLSX.utils.book_append_sheet(wb, ws, sheet.name || "Planilha 1");
        });
        XLSX.writeFile(wb, `${fileName}.xlsx`);
        addToast("Planilha exportada para Excel com sucesso!", "success");
    } catch (error) {
        console.error("Error exporting to XLSX:", error);
        addToast("Erro ao exportar a planilha.", "error");
    }
  };
'''

content = content.replace('const handleOpenFile', export_func + '\n  const handleOpenFile')

# Add export button and margins button
buttons = '''
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
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Margens de Exportação</h4>
                    <div className="space-y-1">
                        <button onClick={() => { setMarginType('padrao'); setShowMargins(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded ${marginType === 'padrao' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}>Padrão</button>
                        <button onClick={() => { setMarginType('moderado'); setShowMargins(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded ${marginType === 'moderado' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}>Moderado</button>
                        <button onClick={() => { setMarginType('estreito'); setShowMargins(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded ${marginType === 'estreito' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}>Estreito</button>
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
'''

content = content.replace('<button\n            onClick={handleSaveFile}', buttons + '\n          <button\n            onClick={handleSaveFile}')

with open('src/components/ModuleGippPlanilhas.tsx', 'w') as f:
    f.write(content)


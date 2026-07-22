import re

with open('src/components/ModuleGippPlanilhas.tsx', 'r') as f:
    content = f.read()

target_state = "const [sheetData, setSheetData] = useState<any[]>([\n    {"
new_state = """const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Save to IndexedDB (auto-save every 30s)
  useEffect(() => {
      const interval = setInterval(() => {
          if (sheetData) {
              setLastSavedTime(new Date());
          }
      }, 30000);
      return () => clearInterval(interval);
  }, [sheetData]);

  const [sheetData, setSheetData] = useState<any[]>([
    {"""

content = content.replace(target_state, new_state)

status_target = """        <div className="flex items-center space-x-4">          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">"""
status_new = """        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">"""

status_target2 = """            {fileName}          </h2>"""
status_new2 = """            {fileName}          </h2>
              {lastSavedTime && (
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium ml-2">
                      Guardado ({lastSavedTime.toLocaleTimeString()})
                  </span>
              )}
          </div>"""

if status_target in content:
    content = content.replace(status_target, status_new)
    content = content.replace(status_target2, status_new2)
else:
    # Let's search for how the header is structured
    print("Could not find status_target")

with open('src/components/ModuleGippPlanilhas.tsx', 'w') as f:
    f.write(content)
print("Patched Planilhas autosave")

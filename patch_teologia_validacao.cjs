const fs = require('fs');
let data = fs.readFileSync('src/components/ModuleTeologia.tsx', 'utf8');

// 1. Add 'validacao' to activeTab state
data = data.replace(
  /const \[activeTab, setActiveTab\] = useState<'grade' \| 'ai_generator' \| 'notes' \| 'diretoria'>\('grade'\);/,
  "const [activeTab, setActiveTab] = useState<'grade' | 'ai_generator' | 'notes' | 'diretoria' | 'validacao'>('grade');"
);

// 2. Add the button for 'validacao' in the tab navigation
const tabButtonCode = `
                <button
                    onClick={() => { playMenuSound(); setActiveTab('validacao'); }}
                    className={\`pb-3 px-3 relative text-xs sm:text-sm font-black transition-all \${
                        activeTab === 'validacao' ? 'text-indigo-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                    }\`}
                >
                    <span className="flex items-center gap-1.5 justify-center">
                        <Sparkles size={14} className="text-amber-500" /> Validação Doutrinária
                    </span>
                    {activeTab === 'validacao' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-fadeIn" />
                    )}
                </button>
`;

const targetButtonHtml = `                    <span className="flex items-center gap-1.5 justify-center">
                        <ClipboardList size={14} /> Painel Docente & Diretoria
                    </span>
                    {activeTab === 'diretoria' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-fadeIn" />
                    )}
                </button>`;

if (data.includes(targetButtonHtml)) {
  data = data.replace(targetButtonHtml, targetButtonHtml + '\n' + tabButtonCode);
}

fs.writeFileSync('src/components/ModuleTeologia.tsx', data, 'utf8');
console.log("Patched tab successfully");

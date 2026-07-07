const fs = require('fs');
let data = fs.readFileSync('src/App.tsx', 'utf8');

const newButton = `
                <button onClick={() => setView('portal_revistas_interativas')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all flex flex-col items-start group">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm transform group-hover:-translate-y-1"><BookOpen size={24}/></div>
                    <span className="font-black text-slate-800 text-base mb-1">Revistas IA</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oficiais & Resumos</span>
                </button>
`;

const lines = data.split('\n');
const insertIndex = lines.findIndex(line => line.includes("setView('portal_ebd')") && line.includes("Estudo EBD"));
if (insertIndex > -1) {
    // find the closing button tag
    let endIndex = insertIndex;
    while(endIndex < lines.length && !lines[endIndex].includes("</button>")) {
        endIndex++;
    }
    
    lines.splice(endIndex + 1, 0, newButton);
    fs.writeFileSync('src/App.tsx', lines.join('\n'), 'utf8');
    console.log("Patched PortalHome successfully by line index");
} else {
    console.log("Could not find line index");
}

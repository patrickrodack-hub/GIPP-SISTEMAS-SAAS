const fs = require('fs');
let data = fs.readFileSync('src/App.tsx', 'utf8');

const newButton = `
                    <button onClick={() => setView('portal_revistas_interativas')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all flex flex-col items-start group">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">Revistas Interativas</h3>
                        <p className="text-[10px] text-slate-500 mt-1 text-left">Lições oficiais e resumos gerados por IA.</p>
                    </button>
`;

const insertPoint = `                    <button onClick={() => setView('portal_ebd')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col items-start group">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <BookOpenText size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">Escola Bíblica (EBD)</h3>
                        <p className="text-[10px] text-slate-500 mt-1 text-left">Suas turmas e lições.</p>
                    </button>`;

if (data.includes(insertPoint)) {
    data = data.replace(insertPoint, insertPoint + newButton);
    fs.writeFileSync('src/App.tsx', data, 'utf8');
    console.log("Patched PortalHome successfully");
} else {
    console.log("Could not find insert point in PortalHome");
}

const fs = require('fs');
let data = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                {allowedModulesHome.includes('portal_ebd') && (
                    <>
                    <button onClick={() => setView('portal_ebd')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col items-start group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm transform group-hover:-translate-y-1"><BookOpenText size={24}/></div>
                        <span className="font-black text-slate-800 text-base mb-1">Estudo EBD</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lições Interativas</span>
                    </button>
                    <button onClick={() => setView('portal_revistas_interativas')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all flex flex-col items-start group">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm transform group-hover:-translate-y-1"><BookOpen size={24}/></div>
                        <span className="font-black text-slate-800 text-base mb-1">Revistas IA</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oficiais & Resumos</span>
                    </button>
                    </>
                )}
                    <button onClick={() => setView('portal_professor_ebd')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all flex flex-col items-start group col-span-2 md:col-span-1">
                        <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-violet-500 group-hover:text-white transition-all shadow-sm transform group-hover:scale-110"><GraduationCap size={24}/></div>
                        <span className="font-black text-slate-800 text-base mb-1">Sala do Professor</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EBD Painel</span>
                    </button>
                )}`;

const replacement = `                {allowedModulesHome.includes('portal_ebd') && (
                    <>
                    <button onClick={() => setView('portal_ebd')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col items-start group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm transform group-hover:-translate-y-1"><BookOpenText size={24}/></div>
                        <span className="font-black text-slate-800 text-base mb-1">Estudo EBD</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lições Interativas</span>
                    </button>
                    <button onClick={() => setView('portal_revistas_interativas')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all flex flex-col items-start group">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm transform group-hover:-translate-y-1"><BookOpen size={24}/></div>
                        <span className="font-black text-slate-800 text-base mb-1">Revistas IA</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oficiais & Resumos</span>
                    </button>
                    </>
                )}
                {isProfessor && (
                    <button onClick={() => setView('portal_professor_ebd')} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all flex flex-col items-start group col-span-2 md:col-span-1">
                        <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-violet-500 group-hover:text-white transition-all shadow-sm transform group-hover:scale-110"><GraduationCap size={24}/></div>
                        <span className="font-black text-slate-800 text-base mb-1">Sala do Professor</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EBD Painel</span>
                    </button>
                )}`;

data = data.replace(target, replacement);
fs.writeFileSync('src/App.tsx', data, 'utf8');

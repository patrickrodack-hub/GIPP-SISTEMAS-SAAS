const fs = require('fs');
let content = fs.readFileSync('src/components/ModuleRevistasInterativas.tsx', 'utf8');

const targetSlider = `<div className="flex items-center gap-4">
                        <div className="flex items-center bg-stone-100 rounded-full p-1 border border-stone-200">
                            <button onClick={handleZoomOut} className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-full transition-colors" title="Reduzir Zoom"><ZoomOut size={16} /></button>
                            <button onClick={handleZoomReset} className="px-3 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors" title="Zoom Original">{Math.round(zoomLevel * 100)}%</button>
                            <button onClick={handleZoomIn} className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-full transition-colors" title="Aumentar Zoom"><ZoomIn size={16} /></button>
                        </div>`;

const replacementSlider = `<div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-stone-100 rounded-full px-4 py-2 border border-stone-200">
                            <ZoomOut size={16} className="text-stone-500" />
                            <input 
                                type="range" 
                                min="0.5" max="1.5" step="0.05" 
                                value={zoomLevel} 
                                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                                className="w-24 accent-stone-700 cursor-pointer"
                                title="Ajustar Zoom"
                            />
                            <ZoomIn size={16} className="text-stone-500" />
                            <button onClick={handleZoomReset} className="ml-2 px-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors border-l border-stone-300" title="Zoom Original">{Math.round(zoomLevel * 100)}%</button>
                        </div>`;

content = content.replace(targetSlider, replacementSlider);

const targetCap = `{/* Introdução com Drop Cap */}
                            {licao.introducao && (
                                <div className="mb-16">
                                    <h3 className="text-stone-900 font-sans font-black text-sm mb-8 uppercase tracking-[0.3em] border-b border-stone-200 pb-4 inline-block">Introdução</h3>
                                    <p className="text-stone-800 text-xl leading-[2.2] font-serif text-justify"
                                       style={{
                                           textIndent: '0',
                                       }}>
                                        <span className="float-left text-8xl font-black text-indigo-900 leading-[0.8] pr-4 pt-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                                            {licao.introducao.charAt(0)}
                                        </span>
                                        {licao.introducao.substring(1)}
                                    </p>
                                </div>
                            )}`;

const replacementCap = `{/* Introdução com Drop Cap */}
                            {licao.introducao && (
                                <div className="mb-16">
                                    <h3 className="text-stone-900 font-sans font-black text-sm mb-8 uppercase tracking-[0.3em] border-b border-stone-200 pb-4 inline-block">Introdução</h3>
                                    <p className="text-stone-800 text-xl leading-[2.2] font-serif text-justify first-letter:text-7xl first-letter:font-black first-letter:text-indigo-900 first-letter:float-left first-letter:mr-4 first-letter:mt-2"
                                       style={{
                                           textIndent: '0',
                                           fontFamily: '"Playfair Display", "Merriweather", serif'
                                       }}>
                                        {licao.introducao}
                                    </p>
                                </div>
                            )}`;

content = content.replace(targetCap, replacementCap);

const targetPlaceholder = `{/* Stylized Visual Placeholder for Topic Image */}
                                        <div className="w-full h-[250px] md:h-[350px] bg-stone-100 border border-stone-200 mb-10 flex flex-col items-center justify-center text-stone-400 relative overflow-hidden group">
                                            <ImageIcon size={48} className="mb-3 opacity-40 group-hover:scale-110 transition-transform" />
                                            <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] opacity-50">Espaço para Arte Gráfica</span>
                                            {/* Simulate an image for now */}
                                            <img 
                                                src={\`https://picsum.photos/seed/\${encodeURIComponent(topico.titulo || 'topic')}/800/400\`} 
                                                alt="Topic"
                                                className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-multiply grayscale"
                                            />
                                        </div>`;

const replacementPlaceholder = `{/* Stylized Visual Placeholder for Topic Image */}
                                        <div className="w-full h-[250px] md:h-[350px] bg-stone-50 border-2 border-dashed border-stone-300 mb-10 flex flex-col items-center justify-center text-stone-400 relative overflow-hidden group transition-all hover:bg-stone-100 hover:border-indigo-300">
                                            <ImageIcon size={48} className="mb-3 opacity-50 group-hover:scale-110 transition-transform text-indigo-400" />
                                            <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] opacity-60 text-stone-500">
                                                Espaço Reservado - Imagem Gerada por IA
                                            </span>
                                            <div className="absolute inset-0 bg-stone-200/20 animate-pulse pointer-events-none"></div>
                                        </div>`;

content = content.replace(targetPlaceholder, replacementPlaceholder);

fs.writeFileSync('src/components/ModuleRevistasInterativas.tsx', content, 'utf8');
console.log("Updated slider, cap, and placeholder.");

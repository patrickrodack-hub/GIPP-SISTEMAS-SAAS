const fs = require('fs');

let content = fs.readFileSync('src/components/ModuleRevistasInterativas.tsx', 'utf8');

// 1. Add motion import
content = content.replace(
    "import { BookOpen, RefreshCw", 
    "import { motion, AnimatePresence } from 'motion/react';\nimport { BookOpen, RefreshCw"
);

// 2. Add direction state
content = content.replace(
    "const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);",
    "const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);\n    const [direction, setDirection] = useState<number>(0);"
);

// 3. Update pagination buttons to set direction
const oldBtnLeft = `<button 
                                onClick={() => setActiveLessonIdx(Math.max(0, activeLessonIdx - 1))}
                                disabled={activeLessonIdx === 0}
                                className="p-2 rounded-full hover:bg-stone-200 text-stone-700 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>`;
const newBtnLeft = `<button 
                                onClick={() => {
                                    setDirection(-1);
                                    setActiveLessonIdx(Math.max(0, activeLessonIdx - 1));
                                }}
                                disabled={activeLessonIdx === 0}
                                className="p-2 rounded-full hover:bg-stone-200 text-stone-700 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>`;
content = content.replace(oldBtnLeft, newBtnLeft);

const oldBtnRight = `<button 
                                onClick={() => setActiveLessonIdx(Math.min((viewingRevista.licoes?.length || 1) - 1, activeLessonIdx + 1))}
                                disabled={activeLessonIdx === (viewingRevista.licoes?.length || 1) - 1}
                                className="p-2 rounded-full hover:bg-stone-200 text-stone-700 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>`;
const newBtnRight = `<button 
                                onClick={() => {
                                    setDirection(1);
                                    setActiveLessonIdx(Math.min((viewingRevista.licoes?.length || 1) - 1, activeLessonIdx + 1));
                                }}
                                disabled={activeLessonIdx === (viewingRevista.licoes?.length || 1) - 1}
                                className="p-2 rounded-full hover:bg-stone-200 text-stone-700 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>`;
content = content.replace(oldBtnRight, newBtnRight);

// 4. Wrap Magazine Layout in AnimatePresence and motion.div
const oldLayoutStart = `{/* Magazine Layout */}
                {licao ? (
                    <div 
                        className="max-w-6xl mx-auto mt-12 px-6 md:px-12 transition-transform duration-300 ease-in-out origin-top"
                        style={{ transform: \`scale(\${zoomLevel})\` }}
                    >`;

const newLayoutStart = `{/* Magazine Layout */}
                {licao ? (
                    <div 
                        className="max-w-6xl mx-auto mt-12 px-6 md:px-12 transition-transform duration-300 ease-in-out origin-top perspective-[2000px]"
                        style={{ transform: \`scale(\${zoomLevel})\` }}
                    >
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={activeLessonIdx}
                                custom={direction}
                                initial={{ opacity: 0, rotateY: direction > 0 ? 90 : -90, transformOrigin: direction > 0 ? 'right center' : 'left center' }}
                                animate={{ opacity: 1, rotateY: 0, transformOrigin: direction > 0 ? 'right center' : 'left center' }}
                                exit={{ opacity: 0, rotateY: direction > 0 ? -90 : 90, transformOrigin: direction > 0 ? 'left center' : 'right center' }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="w-full h-full"
                            >`;
content = content.replace(oldLayoutStart, newLayoutStart);

// Now we need to close the AnimatePresence and motion.div at the end of licao wrap
// Since there's an outer div we're wrapping, let's find the end of it.
const searchBlock = `                            {licao.conclusao && (
                                <div className="mt-24 bg-stone-50 p-12 border-t-4 border-b-4 border-stone-200">
                                    <h3 className="text-stone-900 font-sans font-black text-sm mb-6 uppercase tracking-[0.3em] text-center">Conclusão</h3>
                                    <p className="text-stone-800 text-xl leading-[2.2] font-serif text-center max-w-4xl mx-auto italic">
                                        {licao.conclusao}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (`;

const replaceBlock = `                            {licao.conclusao && (
                                <div className="mt-24 bg-stone-50 p-12 border-t-4 border-b-4 border-stone-200">
                                    <h3 className="text-stone-900 font-sans font-black text-sm mb-6 uppercase tracking-[0.3em] text-center">Conclusão</h3>
                                    <p className="text-stone-800 text-xl leading-[2.2] font-serif text-center max-w-4xl mx-auto italic">
                                        {licao.conclusao}
                                    </p>
                                </div>
                            )}
                        </div>
                        </motion.div>
                        </AnimatePresence>
                    </div>
                ) : (`;

content = content.replace(searchBlock, replaceBlock);

fs.writeFileSync('src/components/ModuleRevistasInterativas.tsx', content, 'utf8');
console.log("Animation added successfully.");

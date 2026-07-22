import re

with open('/tmp/docs_orig.tsx', 'r') as f:
    content = f.read()

# Make TextEditor
content = content.replace("export default function ModuleGippDocs() {", "function TextEditor({ fileToLoad, onReset }: { fileToLoad?: File | null, onReset?: () => void }) {")

# We need to add the imports for SpreadsheetEditor, framer-motion, Dropzone, etc.
imports = """import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, FileSpreadsheet as FileSpreadsheetIcon, FileText as FileTextIcon } from 'lucide-react';
import SpreadsheetEditor from './ModuleGippPlanilhas';
"""

content = re.sub(r"import React.*?from 'react';", imports, content, flags=re.DOTALL)

# Add validateFile utility
validate_file = """
export const validateFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const whitelist = ['xlsx', 'xls', 'docx', 'doc', 'gdoc', 'gplan', 'txt', 'html', 'json', 'csv', 'rtf'];
    if (!whitelist.includes(ext || '')) {
        throw new Error(`O tipo de arquivo .${ext} não é suportado.`);
    }
    return ext;
};
"""

content = content.replace("function TextEditor", validate_file + "\nfunction TextEditor")

# Now, we need to modify TextEditor to use the fileToLoad prop if it's passed.
# Since TextEditor currently uses globalOpenFile, we can bypass globalOpenFile if fileToLoad is provided, or just let TextEditor use its processFile.
# Actually, the user says "Implement a state-based view switcher in the GIPP Docs module...".
# I'll create a default export ModuleGippDocs at the end.

module_docs = """
export default function ModuleGippDocs() {
    const { addToast, globalOpenFile, setGlobalOpenFile, osTheme } = useContext(ChurchContext);
    const [currentView, setCurrentView] = useState<'dropzone' | 'text' | 'spreadsheet'>('dropzone');
    const [loadedFile, setLoadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (globalOpenFile && globalOpenFile.type === 'docs') {
            setLoadedFile(globalOpenFile.file);
            setCurrentView('text');
        } else if (globalOpenFile && globalOpenFile.type === 'sheets') {
            setLoadedFile(globalOpenFile.file);
            setCurrentView('spreadsheet');
        }
    }, [globalOpenFile]);

    const handleFile = (file: File) => {
        try {
            const ext = validateFile(file);
            setLoadedFile(file);
            
            if (['xlsx', 'xls', 'csv', 'gplan', 'json'].includes(ext || '')) {
                // If the app sets view globally, we might want to also set it here
                // but since we render SpreadsheetEditor inline, we just set state.
                setGlobalOpenFile({ file, type: 'sheets' });
                setCurrentView('spreadsheet');
            } else {
                setGlobalOpenFile({ file, type: 'docs' });
                setCurrentView('text');
            }
        } catch (error: any) {
            addToast(error.message, "error");
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const getFullscreenClasses = () => {
        // match the styling of the docs editor
        if (osTheme === 'linux') return 'fixed left-0 right-0 bottom-16 top-8 z-[100] rounded-none';
        if (osTheme === 'win11') return 'fixed left-0 right-0 top-0 bottom-12 z-[100] rounded-none';
        if (osTheme === 'macos_tahoe') return 'fixed left-0 right-0 bottom-20 top-6 z-[100] rounded-none';
        return 'h-full min-h-[600px] rounded-2xl relative z-10'; // default fullscreen-ish
    };

    return (
        <AnimatePresence mode="wait">
            {currentView === 'dropzone' && (
                <motion.div 
                    key="dropzone"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className={`flex flex-col bg-[#f8f9fa] overflow-hidden shadow-2xl border border-slate-200 animate-entrance font-sans items-center justify-center p-8 ${getFullscreenClasses()}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <div className={`w-full max-w-2xl border-4 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center transition-colors duration-300 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}`}>
                        <div className="flex gap-4 mb-6 text-slate-400">
                            <FileTextIcon size={64} className={isDragging ? 'text-blue-500 animate-bounce' : ''} />
                            <FileSpreadsheetIcon size={64} className={isDragging ? 'text-emerald-500 animate-bounce delay-75' : ''} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-700 mb-2">Arraste e solte seus arquivos aqui</h2>
                        <p className="text-slate-500 mb-8 max-w-md">
                            GIPP Docs suporta arquivos Word (.docx, .doc) e planilhas Excel (.xlsx, .xls). O editor correto será carregado automaticamente.
                        </p>
                        
                        <label className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 cursor-pointer flex items-center gap-2">
                            <UploadCloud size={20} />
                            Procurar Arquivo
                            <input 
                                type="file" 
                                className="hidden" 
                                accept=".docx,.doc,.xlsx,.xls,.csv,.gdoc,.gplan,.txt,.html,.json,.rtf"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        handleFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </motion.div>
            )}
            
            {currentView === 'text' && (
                <motion.div 
                    key="text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full absolute inset-0"
                >
                    <TextEditor />
                </motion.div>
            )}

            {currentView === 'spreadsheet' && (
                <motion.div 
                    key="spreadsheet"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full absolute inset-0"
                >
                    <SpreadsheetEditor />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
"""

content = content + "\n\n" + module_docs

with open('src/components/ModuleGippDocs.tsx', 'w') as f:
    f.write(content)

print("Patched!")

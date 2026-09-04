import re

with open('src/components/ModuleGippDocs.tsx', 'r') as f:
    content = f.read()

target = """    useEffect(() => {
        if (globalOpenFile && globalOpenFile.type === 'docs') {
            const file = globalOpenFile.file;
            setGlobalOpenFile(null);
            
            const reader = new FileReader();
            reader.onload = (event) => {
                if (editorRef.current && event.target?.result) {
                    editorRef.current.innerHTML = event.target.result as string;
                    setFileName(file.name.replace(/\.[^/.]+$/, ""));
                    addToast("Documento aberto com sucesso!", "success");
                }
            };
            reader.readAsText(file);
        }
    }, [globalOpenFile]);"""

replacement = """    const processFile = async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        
        if (ext === 'docx' || ext === 'doc') {
            try {
                const mammoth = await import('mammoth');
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                if (editorRef.current) {
                    editorRef.current.innerHTML = result.value;
                    setFileName(file.name.replace(/\.[^/.]+$/, ""));
                    addToast("Documento do Word aberto com sucesso!", "success");
                }
            } catch (error) {
                console.error("Erro ao ler DOCX:", error);
                addToast("Erro ao abrir arquivo do Word.", "error");
            }
        } else {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (editorRef.current && event.target?.result) {
                    editorRef.current.innerHTML = event.target.result as string;
                    setFileName(file.name.replace(/\.[^/.]+$/, ""));
                    addToast("Documento aberto com sucesso!", "success");
                }
            };
            reader.readAsText(file);
        }
    };

    useEffect(() => {
        if (globalOpenFile && globalOpenFile.type === 'docs') {
            const file = globalOpenFile.file;
            setGlobalOpenFile(null);
            processFile(file);
        }
    }, [globalOpenFile]);"""

content = content.replace(target, replacement)

with open('src/components/ModuleGippDocs.tsx', 'w') as f:
    f.write(content)

print("Patched Docs 2")

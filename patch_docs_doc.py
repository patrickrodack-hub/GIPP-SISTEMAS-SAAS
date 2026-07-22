import re

with open('src/components/ModuleGippDocs.tsx', 'r') as f:
    content = f.read()

target = """    const processFile = async (file: File) => {
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
        } else {"""

replacement = """    const processFile = async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        
        if (ext === 'doc') {
            addToast("O formato .doc antigo não é suportado. Por favor, salve como .docx e tente novamente.", "error");
            return;
        }

        if (ext === 'docx') {
            try {
                const mammoth = await import('mammoth');
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                if (editorRef.current) {
                    editorRef.current.innerHTML = result.value;
                    setFileName(file.name.replace(/\.[^/.]+$/, ""));
                    addToast("Documento do Word aberto com sucesso!", "success");
                }
            } catch (error: any) {
                console.error("Erro ao ler DOCX:", error);
                addToast(error.message || "Erro ao abrir arquivo do Word.", "error");
            }
        } else {"""

content = content.replace(target, replacement)

with open('src/components/ModuleGippDocs.tsx', 'w') as f:
    f.write(content)

print("Patched Docs DOC error")

import re

with open('src/components/ModuleGippDocs.tsx', 'r') as f:
    content = f.read()

target = """    const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const ext = file.name.split('.').pop()?.toLowerCase();
        
        if (['xlsx', 'xls', 'csv', 'gplan', 'json'].includes(ext || '')) {
            setGlobalOpenFile({ file, type: 'sheets' });
            setView('sheets_editor');
        } else {
            setGlobalOpenFile({ file, type: 'docs' });
        }
        
        if (fileInputRef.current) fileInputRef.current.value = "";
    };"""

replacement = """    const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const ext = file.name.split('.').pop()?.toLowerCase();
        
        if (['xlsx', 'xls', 'csv', 'gplan', 'json'].includes(ext || '')) {
            setGlobalOpenFile({ file, type: 'sheets' });
            setView('sheets_editor');
        } else {
            processFile(file);
        }
        
        if (fileInputRef.current) fileInputRef.current.value = "";
    };"""

content = content.replace(target, replacement)

with open('src/components/ModuleGippDocs.tsx', 'w') as f:
    f.write(content)

print("Patched Docs 3")

import re

with open('src/components/ModuleGippPlanilhas.tsx', 'r') as f:
    content = f.read()

target = """  const handleOpenFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (['docx', 'doc', 'gdoc', 'html', 'txt', 'rtf'].includes(ext || '')) {
        setGlobalOpenFile({ file, type: 'docs' });
        setView('docs_editor');
    } else {
        setGlobalOpenFile({ file, type: 'sheets' });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };"""

replacement = """  const handleOpenFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (['docx', 'doc', 'gdoc', 'html', 'txt', 'rtf'].includes(ext || '')) {
        setGlobalOpenFile({ file, type: 'docs' });
        setView('docs_editor');
    } else {
        processFile(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };"""

content = content.replace(target, replacement)

with open('src/components/ModuleGippPlanilhas.tsx', 'w') as f:
    f.write(content)

print("Patched Planilhas 2")

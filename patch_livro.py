import re
with open('src/components/ModuleLivroAtas.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const { db, dbFirestore, appId, addToast, user, setPrintMode, setPrintData, setPreviewOpen, setConfirmDialog } = useContext(ChurchContext);",
    "const { db, dbFirestore, appId, addToast, user, setPrintMode, setPrintData, setPreviewOpen, setConfirmDialog, callGeminiAI } = useContext(ChurchContext);"
)
content = content.replace("const { callGeminiAI: contextCallGemini } = await import('../App');", "const contextCallGemini = callGeminiAI;")

with open('src/components/ModuleLivroAtas.tsx', 'w') as f:
    f.write(content)
print("Patched LivroAtas")

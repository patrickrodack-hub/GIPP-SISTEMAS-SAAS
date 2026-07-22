import re
with open('src/components/ModuleTeologia.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const { db, user, addToast, setPrintMode, setPrintData, setPreviewOpen, setConfirmDialog } = useContext(ChurchContext);",
    "const { db, user, addToast, setPrintMode, setPrintData, setPreviewOpen, setConfirmDialog, callGeminiAI } = useContext(ChurchContext);"
)
content = content.replace("const { callGeminiAI } = await import('../App');", "")

with open('src/components/ModuleTeologia.tsx', 'w') as f:
    f.write(content)
print("Patched Teologia")

import re

with open('src/components/ModuleGippDocs.tsx', 'r') as f:
    docs_content = f.read()

docs_content = docs_content.replace("setView('sheets_editor');", "")

with open('src/components/ModuleGippDocs.tsx', 'w') as f:
    f.write(docs_content)

with open('src/components/ModuleGippPlanilhas.tsx', 'r') as f:
    planilhas_content = f.read()

planilhas_content = planilhas_content.replace("setView('docs_editor');", "")

with open('src/components/ModuleGippPlanilhas.tsx', 'w') as f:
    f.write(planilhas_content)
    
print("Fixed views")

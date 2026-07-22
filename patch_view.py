import re

with open('src/components/ModuleGippDocs.tsx', 'r') as f:
    content = f.read()

target = "const [currentView, setCurrentView] = useState<'dropzone' | 'text' | 'spreadsheet'>('dropzone');"
new_val = "const [currentView, setCurrentView] = useState<'dropzone' | 'text' | 'spreadsheet'>('text');"

content = content.replace(target, new_val)

with open('src/components/ModuleGippDocs.tsx', 'w') as f:
    f.write(content)
print("Patched default view to text")

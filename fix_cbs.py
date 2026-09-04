import re

with open('src/components/ModuleGippDocs.tsx', 'r') as f:
    content = f.read()

# Wrap handleFile in useCallback
# const handleFile = (file: File) => { ... }
# -> const handleFile = useCallback((file: File) => { ... }, [addToast, setGlobalOpenFile, setCurrentView]);

content = content.replace("const handleFile = (file: File) => {", "const handleFile = useCallback((file: File) => {")

# We need to find the end of handleFile and add the dependency array.
# It ends with:
#         } catch (error: any) {
#             addToast(error.message, "error");
#         }
#     };
# Let's replace that.

content = content.replace('        } catch (error: any) {\n            addToast(error.message, "error");\n        }\n    };', '        } catch (error: any) {\n            addToast(error.message, "error");\n        }\n    }, [addToast, setGlobalOpenFile]);')

# Now fix the drag handlers to have correct dependencies.
content = content.replace('    const handleDragOver = useCallback((e: React.DragEvent) => {\n        e.preventDefault();\n        setIsDragging(true);\n    }, [handleFile]);', '    const handleDragOver = useCallback((e: React.DragEvent) => {\n        e.preventDefault();\n        setIsDragging(true);\n    }, []);')

content = content.replace('    const handleDragLeave = useCallback((e: React.DragEvent) => {\n        e.preventDefault();\n        setIsDragging(false);\n    }, [handleFile]);', '    const handleDragLeave = useCallback((e: React.DragEvent) => {\n        e.preventDefault();\n        setIsDragging(false);\n    }, []);')

with open('src/components/ModuleGippDocs.tsx', 'w') as f:
    f.write(content)
print("Fixed callbacks")

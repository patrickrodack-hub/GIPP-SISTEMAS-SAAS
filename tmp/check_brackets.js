const fs = require('fs');
const content = fs.readFileSync('src/components/ModuleMissoes.tsx', 'utf8');

const stack = [];
let inString = false;
let stringChar = null;
let lines = content.split('\n');

for (let r = 0; r < lines.length; r++) {
    const line = lines[r];
    for (let c = 0; c < line.length; c++) {
        const char = line[c];
        
        // Skip escaped characters
        if (char === '\\' && inString) {
            c++;
            continue;
        }
        
        // Handle strings & template literals
        if ((char === '"' || char === "'" || char === '`') && !inString) {
            inString = true;
            stringChar = char;
            continue;
        }
        if (inString && char === stringChar) {
            inString = false;
            stringChar = null;
            continue;
        }
        
        if (inString) continue;
        
        // Push opening brackets with location
        if (char === '(' || char === '{' || char === '[') {
            stack.push({ char, line: r + 1, col: c + 1 });
        }
        
        // Pop and check matching closing brackets
        if (char === ')' || char === '}' || char === ']') {
            if (stack.length === 0) {
                console.log(`Unmatched closing ${char} at line ${r + 1}, col ${c + 1}`);
                continue;
            }
            const top = stack.pop();
            const matches = {
                ')': '(',
                '}': '{',
                ']': '['
            };
            if (top.char !== matches[char]) {
                console.log(`Mismatch: opened ${top.char} at line ${top.line}, col ${top.col} but closed ${char} at line ${r + 1}, col ${c + 1}`);
            }
        }
    }
}

if (stack.length > 0) {
    console.log(`Unmatched opening brackets left:`);
    stack.forEach(item => {
        console.log(`Opened ${item.char} at line ${item.line}, col ${item.col}`);
    });
} else {
    console.log("All brackets are perfectly matched!");
}

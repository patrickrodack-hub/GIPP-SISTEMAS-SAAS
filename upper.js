const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const lines = code.split('\n');
const newLines = lines.map(line => {
    if (line.includes('onChange={e') || line.includes('onChange={(e)')) {
        if ((line.includes('<input') || line.includes('<textarea')) && !line.includes('FormInput')) {
            if (line.includes('type="password"') || line.includes('type="email"') || line.includes('type="file"') || line.includes('type="date"') || line.includes('type="time"') || line.includes('type="color"') || line.includes('type="number"') || line.includes('type="checkbox"') || line.includes('type="range"')) {
                // Do nothing
            } else {
                line = line.replace(/e\.target\.value(?!(\.toUpperCase|\.toLowerCase))/g, '(e.target.value || "").toUpperCase()');
            }
        }
    }
    return line;
});

fs.writeFileSync('src/App.tsx', newLines.join('\n'));

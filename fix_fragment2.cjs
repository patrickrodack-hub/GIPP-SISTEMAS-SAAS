const fs = require('fs');
let data = fs.readFileSync('src/App.tsx', 'utf8');
let lines = data.split('\n');

lines.splice(11275, 0, '                    <>');
lines.splice(11285, 0, '                    </>');

fs.writeFileSync('src/App.tsx', lines.join('\n'), 'utf8');
console.log("Fixed via array");

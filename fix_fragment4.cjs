const fs = require('fs');
let data = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{allowedModulesHome.includes('portal_ebd') && (
                {allowedModulesHome.includes('portal_ebd') && (`;
if (data.includes(target)) {
    data = data.replace(target, "{allowedModulesHome.includes('portal_ebd') && (");
    fs.writeFileSync('src/App.tsx', data, 'utf8');
}

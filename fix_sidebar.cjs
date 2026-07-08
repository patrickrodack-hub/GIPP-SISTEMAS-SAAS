const fs = require('fs');
let data = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{hasPermission('access_ebd') && checkPlan('secretaria_ebd') && <MenuItem id="secretaria_ebd" icon={GraduationCap} label="Gestão EBD" />}`;
const replacement = `{hasPermission('access_ebd') && checkPlan('secretaria_ebd') && <MenuItem id="secretaria_ebd" icon={GraduationCap} label="Gestão EBD" />}
                        {hasPermission('access_ebd') && checkPlan('secretaria_ebd') && <MenuItem id="revistas_interativas" icon={BookOpen} label="Revistas Interativas" />}`;

if (data.includes(target)) {
    data = data.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', data, 'utf8');
    console.log("Fixed sidebar");
} else {
    console.log("Target not found");
}

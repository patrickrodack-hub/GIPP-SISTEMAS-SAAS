const fs = require('fs');
let data = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!data.includes('import ModuleRevistasInterativas')) {
    data = data.replace(
        "import ModuleAssistenteAI from './components/ModuleAssistenteAI';",
        "import ModuleAssistenteAI from './components/ModuleAssistenteAI';\nimport ModuleRevistasInterativas from './components/ModuleRevistasInterativas';"
    );
}

// Add to MODULE_REGISTRY (Admin)
if (!data.includes("'revistas_interativas': {")) {
    data = data.replace(
        "'secretaria_ebd': { component: ModuleEBD, access: 'access_ebd' },",
        "'secretaria_ebd': { component: ModuleEBD, access: 'access_ebd' },\n        'revistas_interativas': { component: ModuleRevistasInterativas, access: 'access_ebd' },"
    );
}

// Add to Sidebar
if (!data.includes('view: "revistas_interativas"')) {
    data = data.replace(
        '{ label: "Escola Bíblica Dominical (EBD)", view: "secretaria_ebd", category: "Navegação", icon: BookOpenText },',
        '{ label: "Escola Bíblica Dominical (EBD)", view: "secretaria_ebd", category: "Navegação", icon: BookOpenText },\n          { label: "Revistas Interativas (IA)", view: "revistas_interativas", category: "Navegação", icon: BookOpen },'
    );
}

// Add to Member portal views (portal_revistas_interativas)
if (!data.includes("case 'portal_revistas_interativas':")) {
    data = data.replace(
        "case 'portal_ebd': return <PortalEBD user={user} db={db} />;",
        "case 'portal_ebd': return <PortalEBD user={user} db={db} />;\n            case 'portal_revistas_interativas': return <ModuleRevistasInterativas db={db} isPortal={true} />;"
    );
}

fs.writeFileSync('src/App.tsx', data, 'utf8');
console.log("Patched App.tsx for Revistas Interativas");

const fs = require('fs');

function limpiar(obj) {
    if (typeof obj === 'string') return obj.trim();
    if (Array.isArray(obj)) return obj.map(limpiar);
    if (typeof obj === 'object' && obj !== null) {
        const limpio = {};
        for (const [k, v] of Object.entries(obj)) {
            limpio[k.trim()] = limpiar(v);
        }
        return limpio;
    }
    return obj;
}

try {
    const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    fs.writeFileSync('db.json', JSON.stringify(limpiar(db), null, 2));
    console.log('✅ db.json limpiado');
} catch (e) {
    console.log('❌ Error db.json:', e.message);
}

try {
    const n8n = JSON.parse(fs.readFileSync('Alertas Mantenimiento Flota.json', 'utf8'));
    fs.writeFileSync('Alertas Mantenimiento Flota.json', JSON.stringify(limpiar(n8n), null, 2));
    console.log('✅ Workflow limpiado');
} catch (e) {
    console.log('❌ Error workflow:', e.message);
}
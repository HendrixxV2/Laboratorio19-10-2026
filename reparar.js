const fs = require('fs');

// 1. Generar db.json perfecto desde cero
const dbData = {
  "vehicles": [
    { "id": 1, "plate": "ABC-123", "model": "Ford Transit", "status": "Active", "lastServiceKm": 10000, "currentKm": 15000, "city": "San Jose" },
    { "id": 2, "plate": "DEF-456", "model": "Toyota Hilux", "status": "Active", "lastServiceKm": 0, "currentKm": 12000, "city": "Alajuela" },
    { "id": 3, "plate": "GHI-789", "model": "Chevrolet NHR", "status": "Active", "lastServiceKm": 5000, "currentKm": 8000, "city": "Kuwait City" },
    { "id": 4, "plate": "JKL-012", "model": "Hyundai H100", "status": "Active", "lastServiceKm": 1000, "currentKm": 15000, "city": "Kuwait City" },
    { "id": 5, "plate": "MNO-345", "model": "Kia K2700", "status": "Inactive", "lastServiceKm": 0, "currentKm": 20000, "city": "Heredia" },
    { "id": 6, "plate": "PQR-678", "model": "Mazda BT50", "status": "Active", "lastServiceKm": 5000, "currentKm": 8000, "city": "" },
    { "id": 7, "plate": "STU-901", "model": "Nissan NP300", "status": "Active", "lastServiceKm": 10000, "currentKm": 15000, "city": "Yakutsk" }
  ]
};

fs.writeFileSync('db.json', JSON.stringify(dbData, null, 2));
console.log('✅ db.json reparado y sin espacios.');

// 2. Generar businessLogic.js perfecto
const logicCode = `class Vehicle {
    constructor(id, plate, model, status, lastServiceKm, currentKm, city) {
        this.id = id;
        this.plate = plate;
        this.model = model;
        this.status = status;
        this.lastServiceKm = lastServiceKm;
        this.currentKm = currentKm;
        this.city = city;
        this.alertLevel = "None";
    }
    needsMaintenance() { return (this.currentKm - this.lastServiceKm) > 10000; }
    hasValidLocation() { return this.city && typeof this.city === 'string' && this.city.trim() !== ""; }
    updateAlert(level) { this.alertLevel = level; }
}
class FleetManager {
    constructor(weatherData) { this.weatherData = weatherData || { temp: null }; }
    isClimateRisk(t) { if (t === null || t === undefined) return false; return t > 35 || t < -5; }
    evaluateVehicle(v) {
        if (v.status !== 'Active') { v.updateAlert("Inactivo"); return v; }
        if (!v.hasValidLocation()) { v.updateAlert("Error Ubicación"); return v; }
        const mant = v.needsMaintenance();
        const clim = this.isClimateRisk(this.weatherData.temp);
        if (mant && clim) v.updateAlert("CRÍTICO");
        else if (mant) v.updateAlert("Mantenimiento");
        else if (clim) v.updateAlert("Riesgo Climático");
        else v.updateAlert("OK");
        return v;
    }
}
module.exports = { Vehicle, FleetManager };`;

fs.writeFileSync('businessLogic.js', logicCode);
console.log('✅ businessLogic.js reparado.');
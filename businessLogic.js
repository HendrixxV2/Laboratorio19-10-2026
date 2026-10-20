class Vehicle {
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
module.exports = { Vehicle, FleetManager };
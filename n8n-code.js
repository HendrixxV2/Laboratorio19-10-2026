class Vehicle {
    constructor(id, plate, model, status, lastServiceKm, currentKm, city) {
        this.id = id;
        this.plate = plate;
        this.model = model;
        this.status = status;
        this.lastServiceKm = lastServiceKm;
        this.currentKm = currentKm;
        this.city = city;
        this.alertLevel = 'None';
    }
    needsMaintenance() {
        return (this.currentKm - this.lastServiceKm) > 10000;
    }
    hasValidLocation() {
        return typeof this.city === 'string' && this.city.trim() !== '';
    }
    updateAlert(level) {
        this.alertLevel = level;
    }
}
class FleetManager {
    constructor(weatherData) {
        this.weatherData = weatherData || {};
    }
    isClimateRisk(tempCelsius) {
        if (typeof tempCelsius !== 'number' || !Number.isFinite(tempCelsius)) return false;
        return tempCelsius > 35 || tempCelsius < -5;
    }
    evaluateVehicle(vehicle) {
        if (vehicle.status !== 'Active') {
            vehicle.updateAlert('Inactivo - Sin Monitoreo');
            return vehicle;
        }
        if (!vehicle.hasValidLocation()) {
            vehicle.updateAlert('Error: Ubicación no válida');
            return vehicle;
        }
        const maintenanceNeeded = vehicle.needsMaintenance();
        const climateRisk = this.isClimateRisk(this.weatherData.temp);
        if (maintenanceNeeded && climateRisk) {
            vehicle.updateAlert('CRÍTICO: Parada Inmediata');
        } else if (maintenanceNeeded) {
            vehicle.updateAlert('Mantenimiento Requerido');
        } else if (climateRisk) {
            vehicle.updateAlert('Riesgo Climático');
        } else {
            vehicle.updateAlert('OK');
        }
        return vehicle;
    }
}

const vehicleData = $('1. Obtener Vehículos (JSON Server)').item.json;
const weatherData = $json.main || {};
const vehicle = new Vehicle(
    vehicleData.id,
    vehicleData.plate,
    vehicleData.model,
    vehicleData.status,
    vehicleData.lastServiceKm,
    vehicleData.currentKm,
    vehicleData.city
);
const manager = new FleetManager(weatherData);
return { json: manager.evaluateVehicle(vehicle) };

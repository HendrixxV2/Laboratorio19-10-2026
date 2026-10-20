// Clase 1: Representa el Vehículo y su estado mecánico
class Vehicle {
    constructor(id, plate, model, status, lastServiceKm, currentKm, city) {
        this.id = id;
        this.plate = plate;
        this.model = model;
        this.status = status; // 'Active', 'Inactive'
        this.lastServiceKm = lastServiceKm;
        this.currentKm = currentKm;
        this.city = city;
        this.alertLevel = "None";
    }

    // Regla de Negocio 1: Cálculo de desgaste
    needsMaintenance() {
        const kmSinceService = this.currentKm - this.lastServiceKm;
        return kmSinceService > 10000;
    }

    hasValidLocation() {
        return typeof this.city === 'string' && this.city.trim() !== "";
    }

    // Método auxiliar para actualizar estado
    updateAlert(level) {
        this.alertLevel = level;
    }
}

// Clase 2: Gestiona las condiciones externas y toma decisiones
class FleetManager {
    constructor(weatherData) {
        this.weatherData = weatherData || {};
    }

    // Regla de Negocio 2: Evaluación climática
    isClimateRisk(tempCelsius) {
        if (typeof tempCelsius !== 'number' || !Number.isFinite(tempCelsius)) return false;
        return tempCelsius > 35 || tempCelsius < -5;
    }

    // Regla de Negocio 3 y 5: Decisión final integrada
    evaluateVehicle(vehicle) {
        if (vehicle.status !== 'Active') {
            vehicle.updateAlert("Inactivo - Sin Monitoreo");
            return vehicle;
        }

        if (!vehicle.hasValidLocation()) {
            vehicle.updateAlert("Error: Ubicación no válida");
            return vehicle;
        }

        const maintenanceNeeded = vehicle.needsMaintenance();
        const climateRisk = this.isClimateRisk(this.weatherData.temp);

        if (maintenanceNeeded && climateRisk) {
            vehicle.updateAlert("CRÍTICO: Parada Inmediata");
        } else if (maintenanceNeeded) {
            vehicle.updateAlert("Mantenimiento Requerido");
        } else if (climateRisk) {
            vehicle.updateAlert("Riesgo Climático");
        } else {
            vehicle.updateAlert("OK");
        }
        
        return vehicle;
    }
}

module.exports = { Vehicle, FleetManager };
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

    // Método auxiliar para actualizar estado
    updateAlert(level) {
        this.alertLevel = level;
    }
}

// Clase 2: Gestiona las condiciones externas y toma decisiones
class FleetManager {
    constructor(weatherData) {
        this.weatherData = weatherData; // Objeto con temp, condition, etc.
    }

    // Regla de Negocio 2: Evaluación climática
    isClimateRisk(tempCelsius) {
        return tempCelsius > 35 || tempCelsius < -5;
    }

    // Regla de Negocio 3 y 5: Decisión final integrada
    evaluateVehicle(vehicle) {
        if (vehicle.status !== 'Active') {
            vehicle.updateAlert("Inactive - No Monitor");
            return vehicle;
        }

        const maintenanceNeeded = vehicle.needsMaintenance();
        const climateRisk = this.isClimateRisk(this.weatherData.temp);

        if (maintenanceNeeded && climateRisk) {
            vehicle.updateAlert("CRITICAL: Stop Immediately");
        } else if (maintenanceNeeded) {
            vehicle.updateAlert("Maintenance Required");
        } else if (climateRisk) {
            vehicle.updateAlert("Climate Risk Warning");
        } else {
            vehicle.updateAlert("OK");
        }
        
        return vehicle;
    }
}
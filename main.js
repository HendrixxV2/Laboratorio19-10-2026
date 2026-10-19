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

    // Regla 1: Cálculo de desgaste mecánico
    needsMaintenance() {
        const kmSinceService = this.currentKm - this.lastServiceKm;
        return kmSinceService > 10000;
    }

    // Regla 4: Validación de datos de ubicación
    hasValidLocation() {
        return this.city && typeof this.city === 'string' && this.city.trim() !== "";
    }

    updateAlert(level) {
        this.alertLevel = level;
    }
}

class FleetManager {
    constructor(weatherData) {
        // Manejo de Error 1: Si la API de clima falla, weatherData puede ser null o incompleto
        this.weatherData = weatherData || { temp: null }; 
    }

    // Regla 2: Evaluación de riesgo climático
    isClimateRisk(tempCelsius) {
        if (tempCelsius === null || tempCelsius === undefined) return false;
        return tempCelsius > 35 || tempCelsius < -5;
    }

    // Reglas 3, 4 y 5: Decisión final integrada
    evaluateVehicle(vehicle) {
        // Regla 5: Solo vehículos activos se monitorean
        if (vehicle.status !== 'Active') {
            vehicle.updateAlert("Inactivo - Sin Monitoreo");
            return vehicle;
        }

        // Regla 4: Manejo de Error 2 (Dato incompleto: falta ciudad)
        if (!vehicle.hasValidLocation()) {
            vehicle.updateAlert("Error: Ubicación no válida");
            return vehicle;
        }

        const maintenanceNeeded = vehicle.needsMaintenance();
        const temp = this.weatherData.temp;
        const climateRisk = this.isClimateRisk(temp);

        // Regla 3: Combinación de riesgos
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

// ==========================================
// PRUEBAS (Simulación de datos reales)
// ==========================================

console.log("--- INICIO DE PRUEBAS POO ---\n");

// Caso 1: Vehículo OK (Todo normal)
const climaNormal = { temp: 25 };
const v1 = new Vehicle(1, "ABC-123", "Ford Transit", "Active", 5000, 10000, "San Jose");
const manager1 = new FleetManager(climaNormal);
console.log("Caso 1 (OK):", manager1.evaluateVehicle(v1).alertLevel);

// Caso 2: Solo Mantenimiento Requerido (Supera 10k km, clima normal)
const v2 = new Vehicle(2, "DEF-456", "Toyota Hilux", "Active", 2000, 15000, "Alajuela");
const manager2 = new FleetManager(climaNormal);
console.log("Caso 2 (Mantenimiento):", manager2.evaluateVehicle(v2).alertLevel);

// Caso 3: Solo Riesgo Climático (Kilometraje OK, temperatura extrema)
const climaExtremo = { temp: 38 };
const v3 = new Vehicle(3, "GHI-789", "Chevrolet NHR", "Active", 8000, 12000, "Liberia");
const manager3 = new FleetManager(climaExtremo);
console.log("Caso 3 (Clima):", manager3.evaluateVehicle(v3).alertLevel);

// Caso 4: CRÍTICO (Mantenimiento + Clima Extremo)
const v4 = new Vehicle(4, "JKL-012", "Hyundai H100", "Active", 1000, 12000, "Puntarenas");
const manager4 = new FleetManager(climaExtremo);
console.log("Caso 4 (CRÍTICO):", manager4.evaluateVehicle(v4).alertLevel);

// Caso 5: Vehículo Inactivo (Regla 5)
const v5 = new Vehicle(5, "MNO-345", "Kia K2700", "Inactive", 0, 5000, "Heredia");
const manager5 = new FleetManager(climaNormal);
console.log("Caso 5 (Inactivo):", manager5.evaluateVehicle(v5).alertLevel);

// Caso 6: Error de dato - Sin ciudad (Regla 4 / Manejo de Error)
const v6 = new Vehicle(6, "PQR-678", "Mazda BT50", "Active", 5000, 8000, "");
const manager6 = new FleetManager(climaNormal);
console.log("Caso 6 (Error Dato):", manager6.evaluateVehicle(v6).alertLevel);

// Caso 7: Error de API - Clima no responde (Manejo de Error 1)
const climaFallido = null; // Simula que la API externa cayó
const v7 = new Vehicle(7, "STU-901", "Nissan Frontier", "Active", 2000, 15000, "Yakutsk");
const manager7 = new FleetManager(climaFallido);
console.log("Caso 7 (API Caída):", manager7.evaluateVehicle(v7).alertLevel);

console.log("\n--- FIN DE PRUEBAS POO ---");
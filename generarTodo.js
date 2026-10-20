const fs = require('fs');
const path = require('path');

const projectPath = (fileName) => path.join(__dirname, fileName);

// ==========================================
// 1. GENERAR db.json LIMPIO DESDE CERO
// ==========================================
const dbContent = {
  vehicles: [
    { id: 1, plate: "ABC-123", model: "Ford Transit", status: "Active", lastServiceKm: 10000, currentKm: 15000, city: "San Jose" },
    { id: 2, plate: "DEF-456", model: "Toyota Hilux", status: "Active", lastServiceKm: 0, currentKm: 12000, city: "Alajuela" },
    { id: 3, plate: "GHI-789", model: "Chevrolet NHR", status: "Active", lastServiceKm: 5000, currentKm: 8000, city: "Kuwait City" },
    { id: 4, plate: "JKL-012", model: "Hyundai H100", status: "Active", lastServiceKm: 1000, currentKm: 15000, city: "Kuwait City" },
    { id: 5, plate: "MNO-345", model: "Kia K2700", status: "Inactive", lastServiceKm: 0, currentKm: 20000, city: "Heredia" },
    { id: 6, plate: "PQR-678", model: "Mazda BT50", status: "Active", lastServiceKm: 5000, currentKm: 8000, city: "" },
    { id: 7, plate: "STU-901", model: "Nissan NP300", status: "Active", lastServiceKm: 10000, currentKm: 15000, city: "Yakutsk" }
  ]
};

fs.writeFileSync(projectPath('db.json'), JSON.stringify(dbContent, null, 2));
console.log('✅ db.json generado desde cero (sin espacios)');

// ==========================================
// 2. GENERAR WORKFLOW DE N8N LIMPIO DESDE CERO
// ==========================================
const workflowContent = {
  name: "Alertas Mantenimiento Flota",
  nodes: [
    {
      parameters: {
        path: "fleet-alert",
        httpMethod: "POST",
        responseMode: "responseNode",
        options: {}
      },
      id: "8df0ded2-7362-4e87-9cd5-32871d394704",
      name: "Webhook Trigger",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1.1,
      position: [-1200, -144],
      webhookId: "fleet-webhook-123"
    },
    {
      parameters: {
        url: "http://localhost:3000/vehicles",
        options: {}
      },
      id: "2f090bfb-924c-4922-b374-a4aff206e92b",
      name: "1. Obtener Vehículos (JSON Server)",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [-976, 160]
    },
    {
      parameters: {
        url: "={{ 'https://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent($json.city || '') + '&appid=a16d5c290d04cccc8e5eede6d8d75b55&units=metric' }}",
        options: {
          response: {
            response: {
              neverError: true
            }
          }
        }
      },
      id: "db341251-d2fc-436b-b36d-736c9674f28b",
      name: "2. Obtener Clima (API Externa)",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [-816, -144],
      onError: "continueRegularOutput"
    },
    {
      parameters: {
        mode: "runOnceForEachItem",
        jsCode: "class Vehicle {\n    constructor(id, plate, model, status, lastServiceKm, currentKm, city) {\n        this.id = id;\n        this.plate = plate;\n        this.model = model;\n        this.status = status;\n        this.lastServiceKm = lastServiceKm;\n        this.currentKm = currentKm;\n        this.city = city;\n        this.alertLevel = 'None';\n    }\n    needsMaintenance() {\n        return (this.currentKm - this.lastServiceKm) > 10000;\n    }\n    hasValidLocation() {\n        return this.city && typeof this.city === 'string' && this.city.trim() !== '';\n    }\n    updateAlert(level) {\n        this.alertLevel = level;\n    }\n}\nclass FleetManager {\n    constructor(weatherData) {\n        this.weatherData = weatherData || { temp: null };\n    }\n    isClimateRisk(tempCelsius) {\n        if (tempCelsius === null || tempCelsius === undefined) return false;\n        return tempCelsius > 35 || tempCelsius < -5;\n    }\n    evaluateVehicle(vehicle) {\n        if (vehicle.status !== 'Active') {\n            vehicle.updateAlert('Inactivo - Sin Monitoreo');\n            return vehicle;\n        }\n        if (!vehicle.hasValidLocation()) {\n            vehicle.updateAlert('Error: Ubicación no válida');\n            return vehicle;\n        }\n        const maintenanceNeeded = vehicle.needsMaintenance();\n        const temp = this.weatherData.temp;\n        const climateRisk = this.isClimateRisk(temp);\n        if (maintenanceNeeded && climateRisk) {\n            vehicle.updateAlert('CRÍTICO: Parada Inmediata');\n        } else if (maintenanceNeeded) {\n            vehicle.updateAlert('Mantenimiento Requerido');\n        } else if (climateRisk) {\n            vehicle.updateAlert('Riesgo Climático');\n        } else {\n            vehicle.updateAlert('OK');\n        }\n        return vehicle;\n    }\n}\nconst vehicleData = $json;\nlet weatherData = {};\ntry {\n    weatherData = $node['2. Obtener Clima (API Externa)'].json.main;\n} catch (error) {\n    weatherData = { temp: null };\n}\nconst vehicle = new Vehicle(vehicleData.id, vehicleData.plate, vehicleData.model, vehicleData.status, vehicleData.lastServiceKm, vehicleData.currentKm, vehicleData.city);\nconst manager = new FleetManager(weatherData);\nconst evaluatedVehicle = manager.evaluateVehicle(vehicle);\nreturn { json: evaluatedVehicle };"
      },
      id: "d59424b5-bc9c-4874-b9f5-5c1656397b9e",
      name: "3. Lógica POO (Code Node)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [-592, 176]
    },
    {
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: "",
            typeValidation: "strict"
          },
          conditions: [
            {
              id: "condition-1",
              leftValue: "={{ $json.alertLevel }}",
              rightValue: "OK",
              operator: {
                type: "string",
                operation: "notEquals",
                singleValue: true
              }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      id: "if-node-12345",
      name: "4. Filtrar Alertas (IF)",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [-368, 176]
    },
    {
      parameters: {
        method: "PATCH",
        url: "=http://localhost:3000/vehicles/{{ $json.id }}",
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ JSON.stringify({ alertLevel: $json.alertLevel }) }}",
        options: {}
      },
      id: "68b06fdd-6eca-488b-b938-3e8ef180edf7",
      name: "5. Actualizar JSON Server",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [-160, 0]
    },
    {
      parameters: {
        respondWith: "allIncomingItems",
        options: {}
      },
      id: "ad88a270-1be3-452b-8434-6b670045825e",
      name: "6. Responder Webhook",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [64, 176]
    }
  ],
  pinData: {},
  connections: {
    "Webhook Trigger": {
      main: [[{ node: "1. Obtener Vehículos (JSON Server)", type: "main", index: 0 }]]
    },
    "1. Obtener Vehículos (JSON Server)": {
      main: [[{ node: "2. Obtener Clima (API Externa)", type: "main", index: 0 }]]
    },
    "2. Obtener Clima (API Externa)": {
      main: [[{ node: "3. Lógica POO (Code Node)", type: "main", index: 0 }]]
    },
    "3. Lógica POO (Code Node)": {
      main: [[{ node: "4. Filtrar Alertas (IF)", type: "main", index: 0 }]]
    },
    "4. Filtrar Alertas (IF)": {
      main: [
        [{ node: "5. Actualizar JSON Server", type: "main", index: 0 }],
        [{ node: "6. Responder Webhook", type: "main", index: 0 }]
      ]
    },
    "5. Actualizar JSON Server": {
      main: [[{ node: "6. Responder Webhook", type: "main", index: 0 }]]
    }
  },
  active: false,
  settings: {
    executionOrder: "v1"
  },
  versionId: "9f068ff7-9b32-434b-b4d1-e8b82d0de054",
  meta: {
    instanceId: "300340c3b60925eab5abeb5c7ad39bf2967f0aea7416cc7da47b070090bf463d"
  },
  nodeGroups: [],
  id: "yAEvWV1drdM2PJS2",
  tags: []
};

const codeNode = workflowContent.nodes.find((node) => node.name === "3. Lógica POO (Code Node)");
codeNode.parameters.jsCode = fs.readFileSync(projectPath('n8n-code.js'), 'utf8').trim();
workflowContent.nodes.find((node) => node.name === "5. Actualizar JSON Server").parameters.jsonBody =
  "={{ { alertLevel: $json.alertLevel } }}";

fs.writeFileSync(projectPath('AlertasMantenimientoFlota.json'), JSON.stringify(workflowContent, null, 2));
console.log('✅ AlertasMantenimientoFlota.json generado desde cero (sin espacios)');

console.log('\n🎉 Archivos generados correctamente. Ahora:');
console.log('1. Inicia JSON Server: npm run start:json-server');
console.log('2. Importa AlertasMantenimientoFlota.json en n8n (Ctrl+O)');
console.log('3. Ejecuta el webhook de prueba desde Postman: POST http://localhost:5678/webhook-test/fleet-alert');
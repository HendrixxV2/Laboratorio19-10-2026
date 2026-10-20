const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { Vehicle, FleetManager } = require('./businessLogic');

function evaluateVehicle(data, weatherData = {}) {
    const vehicle = new Vehicle(
        data.id,
        data.plate,
        data.model,
        data.status,
        data.lastServiceKm,
        data.currentKm,
        data.city
    );
    return new FleetManager(weatherData).evaluateVehicle(vehicle);
}

test('calcula la alerta combinada de mantenimiento y clima extremo', () => {
    const result = evaluateVehicle({
        id: 1,
        plate: 'ABC-123',
        model: 'Ford Transit',
        status: 'Active',
        lastServiceKm: 1000,
        currentKm: 15000,
        city: 'San Jose'
    }, { temp: 38 });

    assert.equal(result.alertLevel, 'CRÍTICO: Parada Inmediata');
});

test('no calcula riesgo climático si falta la temperatura', () => {
    const result = evaluateVehicle({
        id: 2,
        plate: 'DEF-456',
        model: 'Toyota Hilux',
        status: 'Active',
        lastServiceKm: 0,
        currentKm: 12000,
        city: 'Alajuela'
    });

    assert.equal(result.alertLevel, 'Mantenimiento Requerido');
});

test('no monitorea vehículos inactivos ni ubicaciones inválidas', () => {
    const inactive = evaluateVehicle({
        id: 3,
        plate: 'GHI-789',
        model: 'Chevrolet NHR',
        status: 'Inactive',
        lastServiceKm: 0,
        currentKm: 20000,
        city: 'Heredia'
    });
    const invalidLocation = evaluateVehicle({
        id: 4,
        plate: 'JKL-012',
        model: 'Hyundai H100',
        status: 'Active',
        lastServiceKm: 0,
        currentKm: 20000,
        city: ' '
    });

    assert.equal(inactive.alertLevel, 'Inactivo - Sin Monitoreo');
    assert.equal(invalidLocation.alertLevel, 'Error: Ubicación no válida');
});

test('el Code node conserva el vehículo y genera un objeto de actualización válido', () => {
    const workflow = JSON.parse(fs.readFileSync('AlertasMantenimientoFlota.json', 'utf8'));
    const webhookNode = workflow.nodes.find((node) => node.name === 'Webhook Trigger');
    const codeNode = workflow.nodes.find((node) => node.name === '3. Lógica POO (Code Node)');
    const patchNode = workflow.nodes.find((node) => node.name === '5. Actualizar JSON Server');
    const vehicleData = {
        id: 12,
        plate: 'XYZ-123',
        model: 'Test',
        status: 'Active',
        lastServiceKm: 0,
        currentKm: 12000,
        city: 'San Jose'
    };
    const result = vm.runInNewContext(`(() => { ${codeNode.parameters.jsCode} })()`, {
        $: () => ({ item: { json: vehicleData } }),
        $json: { main: { temp: 25 } }
    });

    assert.equal(webhookNode.parameters.httpMethod, 'POST');
    assert.equal(result.json.id, vehicleData.id);
    assert.equal(result.json.alertLevel, 'Mantenimiento Requerido');
    assert.match(patchNode.parameters.url, /\{\{ \$json\.id \}\}/);
    assert.equal(patchNode.parameters.jsonBody, '={{ { alertLevel: $json.alertLevel } }}');
});

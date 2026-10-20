# Alertas de mantenimiento de flota

## Requisitos

- Node.js instalado.
- n8n ejecutándose en `http://localhost:5678`.
- Una clave válida de OpenWeatherMap configurada en el nodo **2. Obtener Clima (API Externa)**.

## Preparar y ejecutar

1. Instala las dependencias con `npm install`.
2. Inicia JSON Server desde esta carpeta con `npm run start:json-server`.
3. Comprueba en Postman que `GET http://localhost:3000/vehicles` devuelve los vehículos.
4. Importa `AlertasMantenimientoFlota.json` en n8n y guarda el flujo.
5. Para probarlo, pulsa **Listen for test event** en el nodo Webhook y envía desde Postman:
   `POST http://localhost:5678/webhook-test/fleet-alert`
6. Para producción, activa el flujo y usa:
   `POST http://localhost:5678/webhook/fleet-alert`

El nodo de clima conserva la relación con el vehículo recibido por JSON Server. El nodo de código usa ese vehículo y la respuesta del clima; luego **5. Actualizar JSON Server** envía `alertLevel` como un objeto JSON a `PATCH /vehicles/{id}`.

Si n8n corre en Docker Desktop y JSON Server corre en Windows, `localhost` dentro del contenedor apunta al contenedor, no a Windows. En los nodos **1. Obtener Vehículos (JSON Server)** y **5. Actualizar JSON Server**, cambia `localhost` por `host.docker.internal`. Ambos servicios deben poder comunicarse por el puerto 3000.

## Regenerar y probar

- `npm run generate` regenera `db.json` y el flujo importable.
- `npm test` ejecuta las pruebas de las reglas de negocio.

El generador sobrescribe `db.json` con los datos de ejemplo. No lo ejecutes si quieres conservar cambios propios en esa base de datos.

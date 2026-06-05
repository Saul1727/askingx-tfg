# Registro de Implementación: Caso de Uso 10 (Gestión de Expiración)

**Objetivo:** Implementar la caducidad automática de peticiones y permitir a los autores descartarlas o republicarlas ajustando la cantidad restante requerida.

## 1. Automatización del Backend (Cron Job)
*   **Problema:** La base de datos requiere un disparador activo para mutar estados basándose en el tiempo.
*   **Solución:** Integración de `node-cron`. Se creó `cronService.js` (inicializado desde `server.js`) para ejecutar diariamente (a medianoche) una tarea programada.
*   **Eficiencia:** Se utiliza la operación atómica de Prisma `updateMany` con el filtro `status IN ['OPEN', 'MATCHED']` y `dueDate < now`, delegando el procesamiento al motor PostgreSQL (garantizando velocidad O(1) en la solicitud sin saturar la RAM de Node.js).

## 2. Endpoints y Lógica de Negocio (Clean Architecture)
Se desarrollaron dos rutas en `askRoutes.js` protegidas por el middleware `roleMiddleware(['AUTHOR', 'ADMIN'])`:

*   **Ruta `PUT /api/asks/:id/discard`**: Transiciona de manera definitiva una petición `EXPIRED` a `CANCELLED`, insertando un `cancellationReason` auditable.
*   **Ruta `POST /api/asks/:id/republish`**:
    *   **Inmutabilidad:** En lugar de modificar el registro caducado, se crea una nueva instancia (`CREATED`). Esto garantiza que el historial de auditoría y las estadísticas de la plataforma no se vean corrompidas.
    *   **Cálculo Dinámico de Remanente:** Previo a la republicación, el sistema suma todas las entregas parciales asociadas (`fulfillments`) a la petición antigua. La nueva petición se crea solicitando *únicamente* la diferencia restante, previniendo la duplicación de solicitudes.

## 3. Frontend y React-Hook-Form
*   **Servicios:** Se actualizaron los métodos de `askService.js` en el cliente para consumir los nuevos endpoints.
*   **Componente Modal:** Se creó `RepublishAskModal.jsx`. 
*   **Validación Estricta:** Uso de `@hookform/resolvers/zod` para bloquear envíos si el campo `newDueDate` está vacío o referencia fechas pasadas, mostrando feedback visual reactivo.
*   **Integración UI (`Asks.jsx`):** Se añadió el estado `EXPIRED` a la tabla y filtros. El botón de edición estándar es reemplazado condicionalmente por el botón de republicación (`RefreshCw`) cuando la petición caduca.
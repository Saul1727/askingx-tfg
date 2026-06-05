# Implementación del Tablero Kanban (Connector)

Este documento detalla los cambios realizados para habilitar y corregir la funcionalidad del Tablero de Conexiones (Kanban) para el rol de **Connector**.

## 1. Correcciones de Errores (Bug Fixes)
- **Error de Importación:** Se corrigió el error `Failed to resolve import "../services/userService"` en `ConnectorKanban.jsx`.
    - **Causa:** El archivo de servicio se llamaba `userServices.js` pero se importaba como `userService.js`.
    - **Solución:** Se renombró `frontend/src/services/userServices.js` a `userService.js` para mantener la consistencia con el resto de servicios.
- **Transiciones de Estado:** Se actualizó la lógica en `ConnectorKanban.jsx` para permitir la transición a `MATCHED` tanto desde el estado `OPEN` como desde `CREATED`.

## 2. Mejoras de Coherencia y Flujo
(Anteriormente documentado...)

## 3. Gestión Avanzada de Voluntarios (Multi-Giver Match)

Se ha implementado una de las funcionalidades más complejas y críticas del sistema: la capacidad de asignar múltiples donantes (Givers) a una única petición de forma simultánea.

### 3.1. Justificación Técnica y de Negocio
*   **Multiplicidad N:N:** Según el modelo PickingX, una necesidad (ej. "100 mantas") puede no ser cubierta por un único donante. El sistema permite ahora que un Connector coordine a varios Givers para una misma Ask.
*   **Sincronización Atómica:** En el backend, se utiliza la operación `set` de Prisma. Esto garantiza que la lista de voluntarios se actualice en un solo paso (añadiendo nuevos y eliminando los desmarcados), manteniendo la integridad referencial sin duplicados.

### 3.2. Lógica de UI/UX en el Tablero
*   **Modal Polimórfico:** El modal de asignación ahora detecta si la petición ya tiene Givers previos y los pre-selecciona en una lista de *checkboxes*.
*   **Menú de Acciones (3 Puntos):** Implementación de un menú contextual en cada tarjeta usando `useRef` y `useEffect` para detectar clics fuera del menú. Permite gestionar voluntarios sin mover la tarjeta de la columna "ASIGNADA".
*   **Indicadores de Urgencia Dinámicos:** Las tarjetas calculan en tiempo real la diferencia de días hasta la `dueDate`. Si el plazo es inferior a 7 días, se inyecta visualmente un badge de "URGENTE".
*   **Visualización de Avatares:** Uso de un mapa de iniciales para renderizar avatares circulares tanto en la cabecera de la columna como en el cuerpo de la tarjeta, permitiendo una trazabilidad visual inmediata de quién está asignado a cada tarea.

### 3.3. Control de Estado Inteligente
Se ha programado un "trigger" lógico en la capa de servicio: si un Connector elimina a todos los Givers de una petición asignada, el sistema interpreta que la gestión ha fallado o se ha cancelado, y revierte automáticamente el estado de la petición de `MATCHED` a `OPEN`, devolviéndola a la bolsa de trabajo global.

---

## 4. Resumen Técnico (Actualizado)
| Funcionalidad | Implementación | Valor TFG |
|--- |--- |--- |
| **Multi-Match** | Prisma `set` (N:N) | Complejidad en integridad de datos. |
| **Urgencia Dinámica** | Lógica de fechas en JS | Mejora de la eficiencia operacional. |
| **Gestión Contextual** | Menús `useRef` (React) | Excelencia en UX/UI. |
| **Seguridad de Estado** | Trigger Automático | Robustez de la lógica de negocio. |

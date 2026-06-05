# Registro de Implementación: Caso de Uso 11 (Donación Parcial y Cierre Inteligente)

**Objetivo:** Permitir el registro de entregas parciales (Fulfillments) manteniendo abierta la petición original hasta alcanzar el 100% de los recursos solicitados, proveyendo feedback visual del progreso y permitiendo cierres manuales anticipados.

## 1. Arquitectura de Backend (Cierre Inteligente)

El sistema original cerraba la petición automáticamente (`MATCHED`) en el primer registro de `Fulfillment`. Para el CU-11, dado que una petición puede tener múltiples `Givers` (1..N), se ha refactorizado la lógica en `fulfillmentService.js`.

*   **Agregación Dinámica (`_sum`):** Cuando un Connector o Admin registra una entrega de tipo `THINGS` o `TIME`, el servicio consulta la base de datos realizando una suma de todas las entregas previas asociadas a esa petición.
*   **Transacción Atómica (`$transaction`):** Se ha envuelto la creación de la nueva entrega y el cambio de estado en una transacción. 
*   **Trigger de Cierre:** Tras sumar la entrega actual con el histórico, si la cantidad alcanza exactamente la `quantityRequested` o las `estimatedHours` objetivo, el sistema actualiza automáticamente el estado del `Ask` a `FULFILLED`. 
*   **Excepciones de Tipado:** Para peticiones cualitativas (`EXPERTISE` y `SERVICES`), que no son fraccionables, la primera entrega registrada fuerza siempre el cierre inmediato.

## 2. Feedback Visual Frontend (Barra de Progreso)

Para dar coherencia a las entregas múltiples, se implementó una interfaz de monitorización unificada para todos los perfiles (`ADMIN`, `AUTHOR`, `CONNECTOR`).

*   **Componentes Modificados:** `ViewAskModal.jsx` (Vista General) y `ConnectorViewAskModal.jsx` (Vista del Kanban).
*   **Lógica de Renderizado:** El componente evalúa en cliente (`isQuantifiable`) si el tipo de petición soporta cantidades. De ser así, itera sobre el array anidado `ask.fulfillments` para sumar la cantidad entregada actual y calcular el porcentaje.
*   **Feedback de Color:** La barra de progreso utiliza una escala de colores de Tailwind (azul mientras esté en progreso, verde al alcanzar el 100%), desapareciendo de la UI cuando el flujo se cancela o expira.

## 3. Cierre Manual Anticipado (Force Complete)

En escenarios reales, una ONG puede darse por satisfecha con un porcentaje menor al 100%. Se ha provisto al `CONNECTOR` y al `ADMIN` de una herramienta para finalizar el ciclo anticipadamente.

*   **Implementación:** En el Kanban de Connectors, dentro del `ConnectorViewAskModal`, se ha habilitado un botón verde "Forzar Cierre (Éxito)".
*   **Seguridad UI:** Este botón solo es visible si la petición sigue en estado `MATCHED`. Al accionarlo, salta un prompt de confirmación (`window.confirm`) advirtiendo de que no se ha alcanzado la cuota.
*   **Delegación de Eventos:** El evento invoca a `onForceComplete` (proporcionado por el componente padre `ConnectorKanban.jsx`), que despacha un parche HTTP a `/api/asks/:id/status` con el payload `FULFILLED`, finalizando la petición y actualizando las columnas del tablero en tiempo real.
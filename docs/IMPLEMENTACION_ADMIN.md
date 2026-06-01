# Registro de Implementación Detallada

## 1. Introducción
Este documento detalla la implementación técnica de dos funcionalidades principales: el **Modal de Detalles de Petición** para el perfil de *Connector* y el **Panel de Administración** completo. El objetivo es proporcionar una guía clara y exhaustiva del trabajo realizado.

---

## 2. Implementación del Modal de Detalles de Petición (Connector)
Esta funcionalidad permite a un usuario *Connector* visualizar los detalles de una petición (`Ask`) desde el tablero Kanban.

### 2.1. Creación del Componente y Lógica Inicial
- **Componente Creado**: `/frontend/src/components/asks/ConnectorViewAskModal.jsx`
- **Propósito**: Mostrar una vista detallada de una petición (`Ask`) en un modal.
- **Lógica Inicial**: Se creó el componente con una estructura de UI basada en la imagen proporcionada, incluyendo secciones para "Datos de la Petición", "Asignación de Givers" e "Historial de Estado". El historial se implementó con datos de ejemplo (`mock`) a la espera de la funcionalidad del backend.

### 2.2. Integración en el Kanban del Connector
- **Fichero Modificado**: `/frontend/src/pages/ConnectorKanban.jsx`
- **Lógica de Integración**:
  1.  Se importó el nuevo componente `ConnectorViewAskModal`.
  2.  Se añadieron dos estados para controlar el modal: `isViewModalOpen` (booleano para visibilidad) y `selectedAskForView` (para almacenar los datos de la petición seleccionada).
  3.  Se creó una función `handleViewAskDetails(ask)` que actualiza estos estados.
  4.  Se pasó esta función como `prop` (`onViewDetails`) al subcomponente `AskCard`.
  5.  En el componente `AskCard`, se añadió un manejador `onClick` al `div` principal que llama a `onViewDetails`, haciendo que toda la tarjeta sea clicable.
  6.  Finalmente, se renderizó `<ConnectorViewAskModal />` en el componente principal, pasándole los `props` necesarios (`isOpen`, `onClose`, `ask`).

### 2.3. Iteración 1: Correcciones y Funcionalidad
Tras el primer feedback, se realizaron las siguientes mejoras:
1.  **Corrección de "N/A" en Organización**:
    - **Problema**: El modal mostraba "N/A" para la organización.
    - **Solución**: Se actualizó el JSX en `ConnectorViewAskModal.jsx` para usar la misma lógica de fallback que la `AskCard`: `ask.asker?.organizationName || ask.asker?.contactPerson || 'ONG Local'`.
2.  **Búsqueda de Givers (Frontend)**:
    - **Problema**: La barra de búsqueda de givers no era funcional.
    - **Solución**:
        - Se pasó la lista completa de `givers` desde `ConnectorKanban.jsx` al modal.
        - En `ConnectorViewAskModal.jsx`, se añadió un estado `searchTerm`.
        - Se implementó una lógica de filtrado (`givers.filter(...)`) para mostrar una lista de givers cuyo nombre coincidiera con el término de búsqueda.
3.  **Botón de Cancelar Petición**:
    - **Problema**: El botón "Cerrar por caducidad/cancelación" no hacía nada.
    - **Backend**: Se verificó que el backend ya soportaba cambiar el estado a `CANCELLED` a través del endpoint `PATCH /api/asks/:id/status`.
    - **Frontend**:
        - Se creó una nueva función `handleCancelAsk(askId)` en `ConnectorKanban.jsx`.
        - Esta función muestra una ventana de confirmación (`window.confirm`) y, si se acepta, llama al servicio `updateAskStatus(askId, 'CANCELLED')`.
        - Tras el éxito, refresca los datos del Kanban (`fetchData()`) y cierra el modal.
        - La función se pasó como `prop` (`onCancelAsk`) al modal, donde se conectó al `onClick` del botón.

### 2.4. Iteración 2: Refactorización de la Reasignación de Givers
- **Problema**: El botón "Reasignar Givers" y la funcionalidad de añadir (`+`) en la búsqueda de givers no estaban conectados y eran redundantes, ya que existía un modal funcional para ello.
- **Solución (Refactorización)**:
  1.  En `ConnectorKanban.jsx`, se creó una nueva función `handleReassignGivers(ask)`. Su lógica es simple: cierra el modal de vista (`setIsViewModalOpen(false)`) y abre el modal de asignación ya existente (`handleEditGivers(ask)`).
  2.  Esta función se pasó como `prop` (`onReassignGivers`) a `ConnectorViewAskModal`.
  3.  En `ConnectorViewAskModal.jsx`, se conectó esta `prop` al `onClick` del botón "Reasignar Givers".
  4.  Se eliminó la barra de búsqueda de givers y la lista de resultados del JSX del `ConnectorViewAskModal` para evitar duplicidad y confusión, simplificando el modal a una vista de solo lectura con acciones claras.

---

# Implementación del Perfil de Administrador

## 1. Introducción
Este documento detalla la implementación técnica de las funcionalidades del perfil de Administrador, abarcando desde la creación de endpoints en el backend hasta la construcción de componentes de interfaz de usuario en el frontend. El objetivo es proporcionar una guía clara y completa del trabajo realizado para cumplir con los casos de uso CU-07, CU-08, CU-13 y CU-15.

---

## 2. Implementación del Backend
Se han añadido y modificado varios ficheros en el backend para dar soporte a las nuevas funcionalidades de administración.

### 2.1. Gestión de Usuarios (CU-07 y CU-15)

#### **Servicio (`/backend/src/services/userService.js`)**
Se añadieron dos nuevas funciones para manejar la obtención y actualización de usuarios.

- **`getAllUsers()`**:
  - **Propósito**: Obtener una lista de todos los usuarios registrados en el sistema.
  - **Lógica**: Utiliza Prisma (`prisma.user.findMany`) para consultar la base de datos. Se usa la cláusula `select` para excluir explícitamente el campo `passwordHash` por seguridad. Los resultados se ordenan por fecha de creación (`createdAt: 'desc'`).

- **`updateUser(userId, dataToUpdate)`**:
  - **Propósito**: Actualizar la información de un usuario específico. Se utiliza para la desactivación.
  - **Lógica**: Primero, busca al usuario por su `userId` para asegurarse de que existe. Si no, lanza un error 404. Luego, utiliza `prisma.user.update` para aplicar los cambios (`dataToUpdate`), que en el caso de la desactivación es `{ isActive: false }`.

#### **Controlador (`/backend/src/controllers/userController.js`)**
Se crearon los controladores para exponer la lógica de los servicios a través de la API.

- **`getAllUsersController()`**:
  - **Propósito**: Manejar las peticiones `GET` para obtener todos los usuarios.
  - **Lógica**: Llama a `userService.getAllUsers()` y devuelve los datos con un estado 200.

- **`updateUserController()`**:
  - **Propósito**: Manejar las peticiones `PATCH` para actualizar un usuario.
  - **Lógica**: Extrae el `id` del usuario de los parámetros de la ruta. Utiliza `zod` para validar que el cuerpo de la petición solo contenga el campo `isActive` de tipo booleano, garantizando que esta ruta solo pueda usarse para activar/desactivar usuarios. Finalmente, llama a `userService.updateUser` y devuelve el usuario actualizado (sin el hash de la contraseña).

#### **Rutas (`/backend/src/routes/userRoutes.js`)**
Se añadieron nuevas rutas protegidas para la gestión de usuarios.

- **`GET /api/users`**:
  - **Propósito**: Endpoint para obtener la lista completa de usuarios.
  - **Protección**: Se le aplican los middlewares `authMiddleware` (verifica el token JWT) y `roleMiddleware(['ADMIN'])` para asegurar que solo los administradores puedan acceder.

- **`PATCH /api/users/:id`**:
  - **Propósito**: Endpoint para actualizar un usuario.
  - **Protección**: También está protegido para que solo los administradores puedan modificar a otros usuarios.

### 2.2. Gestión de Dominios (CU-08)

#### **Servicio (`/backend/src/services/domainService.js`)**
Se añadieron funciones para crear y eliminar dominios.

- **`createDomain(domainData)`**:
  - **Propósito**: Crear un nuevo dominio.
  - **Lógica**: Utiliza `prisma.domain.create` para añadir un nuevo registro a la tabla de dominios con el nombre y la descripción proporcionados.

- **`deleteDomain(domainId)`**:
  - **Propósito**: Eliminar un dominio de forma segura.
  - **Lógica**: Antes de eliminar, realiza una consulta (`prisma.ask.count`) para verificar si alguna petición (`Ask`) está utilizando este dominio. Si el contador es mayor que cero, lanza un error de conflicto (409) para prevenir la eliminación y mantener la integridad de los datos. Si no hay peticiones asociadas, procede a eliminar el dominio con `prisma.domain.delete`.

#### **Controlador (`/backend/src/controllers/domainController.js`)**
- **`createDomainController()`**: Valida con `zod` que el `name` del dominio exista y tenga una longitud mínima antes de llamar al servicio de creación.
- **`deleteDomainController()`**: Extrae el `id` de los parámetros de la ruta y llama al servicio de eliminación.

#### **Rutas (`/backend/src/routes/domainRoutes.js`)**
- **`POST /api/domains`**: Endpoint protegido con `authMiddleware` y `roleMiddleware(['ADMIN'])` para la creación de dominios.
- **`DELETE /api/domains/:id`**: Endpoint protegido con `authMiddleware` y `roleMiddleware(['ADMIN'])` para la eliminación de dominios.

### 2.3. Panel de Estadísticas (CU-13)
Se creó un conjunto completo de servicio, controlador y ruta para las estadísticas.

#### **Servicio (`/backend/src/services/statsService.js`)**
- **`getDashboardStats()`**:
  - **Propósito**: Realizar múltiples consultas a la base de datos para agregar las métricas del dashboard en una sola llamada.
  - **Lógica**:
    1.  **Completadas este mes**: Calcula el rango de fechas del mes actual y cuenta las peticiones (`Ask`) con estado `FULFILLED` dentro de ese rango.
    2.  **Pendientes**: Cuenta las peticiones con estado `OPEN` o `CREATED`.
    3.  **Caducadas**: Cuenta las peticiones con estado `EXPIRED`.
    4.  **Connectors más activos**: Utiliza una consulta avanzada de Prisma para encontrar los 5 usuarios con rol `CONNECTOR`, ordenándolos de forma descendente por el número de peticiones que tienen asociadas (`asksConnected`).

#### **Servicio (`/backend/src/services/askerService.js`)**
Se implementó una política de "Modo Dios" (God Mode) en la obtención de organizaciones:
- **`getAskersByAuthor(authorId, userRole)`**: Si el `userRole` es `ADMIN`, Prisma ignora el filtro de `askAuthorId` y devuelve el 100% de las organizaciones y particulares de la base de datos, garantizando que el administrador tenga visibilidad global sin alterar la ruta base.

#### **Controlador y Ruta (`askerController.js`, `askerRoutes.js`)**
- Se creó `getDashboardStatsController` para llamar al servicio.
- Se creó la ruta `GET /api/stats/summary`, protegida para administradores, que expone este controlador.
- Se registró el `statsRoutes` en el fichero principal `app.js`.

---

## 3. Implementación del Frontend

### 3.1. Estructura Principal y Navegación
- **Routing (`/frontend/src/App.jsx`)**:
  - Se añadieron dos nuevas rutas dentro de `ProtectedRoute`:
    - `/admin/configuration`: Renderiza el nuevo componente `AdminConfiguration`.
    - `/admin/dashboard`: Se actualizó para que renderice el nuevo componente `AdminDashboard` en lugar de un placeholder.
- **Página de Configuración (`/frontend/src/pages/Admin/Configuration.jsx`)**:
  - **Propósito**: Actúa como el contenedor principal para la gestión de usuarios y dominios.
  - **Lógica**: Implementa un layout de dos columnas. Una barra lateral secundaria permite navegar entre el panel de usuarios y el de dominios usando un estado `activeTab`. El panel activo se renderiza en el área de contenido principal.

### 3.2. Panel de Gestión de Usuarios (`UserManagementPanel`)
Componente implementado dentro de `AdminConfiguration.jsx`.

- **Lógica del Componente**:
  - Utiliza `useState` para manejar los estados `users`, `isLoading` y `error`.
  - Emplea un `useEffect` junto con `useCallback` para llamar a la función `getAllUsers` del servicio al montar el componente y para poder refrescar la lista cuando sea necesario.
  - Controla la visibilidad del modal de creación con el estado `isCreateModalOpen`.
- **Componente de Tabla (`/frontend/src/components/admin/UserTable.jsx`)**:
  - **Propósito**: Componente reutilizable que muestra la lista de usuarios.
  - **Lógica**: Recibe `users` como prop y los mapea para crear las filas de la tabla. Incluye una función `handleDeactivate` que se activa al pulsar el botón de "Desactivar". Esta función muestra un `window.confirm` para la confirmación del admin y, si se acepta, llama al servicio `updateUser` para cambiar el estado `isActive` a `false`. Finalmente, ejecuta la función `onUserUpdate` (recibida por props) para refrescar la lista.
- **Modal de Creación (`/frontend/src/components/admin/CreateUserModal.jsx`)**:
  - **Propósito**: Proporcionar un formulario para crear nuevos usuarios.
  - **Lógica**: Gestiona el estado de los campos del formulario (`fullName`, `email`, etc.). Al enviar (`handleSubmit`), realiza validaciones básicas, llama al servicio `createUser` y, si tiene éxito, ejecuta el callback `onUserCreated` para refrescar la tabla de usuarios y cierra el modal.
- **Servicios (`/frontend/src/services/userService.js`)**:
  - **`getAllUsers()`**: Realiza una petición `GET` al nuevo endpoint `/api/users`.
  - **`createUser()`**: Realiza una petición `POST` a `/api/users/register` con los datos del nuevo usuario.
  - **`updateUser()`**: Realiza una petición `PATCH` a `/api/users/:id` con `{ isActive: false }`.
  - Todas las funciones utilizan el helper `getAuthHeader` para incluir el token de autenticación.

### 3.3. Panel de Gestión de Dominios (`DomainManagementPanel`)
Componente implementado dentro de `AdminConfiguration.jsx`.

- **Lógica del Componente**:
  - Similar al panel de usuarios, usa `useState` y `useEffect` para obtener y mostrar la lista de dominios a través del servicio `getDomains`.
  - **`handleCreateDomain()`**: Se activa al enviar el formulario de nuevo dominio. Llama al servicio `createDomain` y refresca la lista.
  - **`handleDeleteDomain()`**: Se activa al pulsar el botón de eliminar en un dominio. Muestra una confirmación y llama al servicio `deleteDomain`.
- **Servicios (`/frontend/src/services/askService.js`)**:
  - Se añadieron `createDomain` (`POST /api/domains`) y `deleteDomain` (`DELETE /api/domains/:id`).

### 3.4. Panel de Estadísticas (`/frontend/src/pages/Admin/Dashboard.jsx`)
- **Propósito**: Página dedicada a mostrar las métricas de la plataforma.
- **Lógica del Componente**:
  - Utiliza `useEffect` para llamar a un nuevo servicio `getDashboardStats` al cargar la página.
  - Muestra un estado de carga (`Loader2`) mientras se obtienen los datos.
  - **`StatCard`**: Se creó un subcomponente reutilizable para mostrar cada métrica individual en una "tarjeta".
  - Los datos (`completedThisMonth`, `pendingAsks`, `expiredAsks`) se muestran en las tarjetas.
  - La lista de `activeConnectors` se muestra en una sección separada, indicando su ranking, nombre y número de peticiones gestionadas.
- **Servicio (`/frontend/src/services/statsService.js`)**:
  - Se creó un nuevo fichero de servicio para encapsular la lógica de las estadísticas.
  - **`getDashboardStats()`**: Realiza una única petición `GET` a `/api/stats/summary` para obtener todos los datos del dashboard.

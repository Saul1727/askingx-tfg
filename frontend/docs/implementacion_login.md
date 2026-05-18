# Documentación Técnica del Proyecto: AskingX (Frontend)

Este documento centraliza todas las decisiones de diseño, arquitectura e implementación tomadas durante el desarrollo del frontend de AskingX, sirviendo como base técnica para la memoria del Trabajo de Fin de Grado (TFG).

---

## 1. Arquitectura General y Tecnologías

El proyecto se ha construido bajo una arquitectura modular basada en componentes de **React (v19)**, priorizando la separación de responsabilidades y la escalabilidad.

- **Frontend Core:** React + Vite.
- **Estilizado:** Tailwind CSS v3 (Utility-first).
- **Enrutamiento:** React Router Dom v7.
- **Iconografía:** Lucide React.
- **Comunicación API:** Fetch API con servicios asíncronos.

---

## 2. Implementación de la Interfaz de Inicio de Sesión (Login)

### 2.1. Diseño Visual y UX

- **Estética:** Se ha replicado fielmente la identidad visual de la UPV, utilizando un fondo degradado suave y una tarjeta central con sombras profundas para focalizar la atención.
- **Interactividad:** Implementación de visibilidad dinámica de contraseña y estados de carga (_loading states_).
- **Accesibilidad:** Contraste garantizado con fondos blancos y texto oscuro en los inputs.

### 2.2. Lógica de Negocio y API (`src/services/authService.js`)

- Creación de una capa de servicios (`authService`) para abstraer las peticiones HTTP. Gestión de comunicación con `/api/users/login` y manejo de errores robusto.

### 2.3. Gestión del Estado y Navegación (`src/pages/Login.jsx`)

- **Persistencia:** Almacenamiento del JWT (Token) en `localStorage`.
- **Redirección Inteligente:** Uso de un mapa de roles para redirigir a los usuarios a sus paneles (ADMIN, AUTHOR, CONNECTOR, GIVER).

---

## 3. Arquitectura de Layout y Panel de Control (Dashboard)

Se ha implementado un sistema de **Layouts y Outlets** para separar la estructura persistente de la aplicación del contenido dinámico.

### 3.1. Estructura Global (`src/components/layout/`)

- **`MainLayout.jsx`**: Orquestador principal que mantiene `Sidebar` y `Topbar` fijos.
- **`Sidebar.jsx`**: Barra lateral con **lógica de roles integrada**.
- **`Topbar.jsx`**: Incluye buscador global y acceso al perfil.

### 3.2. Panel Principal (`src/pages/Dashboard.jsx`)

Vista centralizada que actúa como centro de mando:

- **KPI Cards:** Tarjetas visuales de métricas clave.
- **Gestión de Datos:** Tabla interactiva con estados de peticiones.
- **Acciones:** Control de estado para la apertura del modal `CreateAskModal`.

---

## 4. Caso de Uso 01: Creación de Peticiones (CU-01)

Se ha implementado el flujo completo (Frontend-Backend) para el registro de nuevas peticiones de ayuda, utilizando un componente modal avanzado.

### 4.1. Componente `CreateAskModal.jsx`

- **Ubicación:** `src/components/asks/CreateAskModal.jsx`.
- **Carga Dinámica de Datos:** Mediante el hook `useEffect`, el componente consume las APIs de `Askers` y `Domains` al montarse, hidratando los campos `select` del formulario con datos reales de la base de datos de PostgreSQL.
- **Patrón STI (Single Table Inheritance):** El formulario muta y adapta sus campos dinámicamente según el tipo de recurso seleccionado (`THINGS`, `TIME`, `EXPERTISE`, `SERVICES`), formateando y "limpiando" el payload antes del envío.
- **Gestión de Fechas (Timezones):** Incorporación del campo opcional `dueDate`. Se ha implementado un cálculo en tiempo real de la zona horaria local del navegador para bloquear la selección de fechas pasadas en el HTML5, garantizando posteriormente la transformación a ISO 8601 (`toISOString()`) para su inserción en Prisma.
- **Protección UX (Programación Defensiva):** El renderizado de listas y mapeo de datos incluye validadores estructurales (`Array.isArray`) que evitan interrupciones fatales ("crashes") en la interfaz en caso de recibir payloads inesperados del backend.

---

## 5. Principios de Ingeniería y Clean Code Aplicados

- **Responsabilidad Única (SRP):** Descomposición en sub-componentes especializados.
- **DRY (Don't Repeat Yourself):** Reutilización de componentes UI.
- **Código Declarativo:** Uso de estructuras de datos (Maps y Arrays) para generar menús.
- **Programación Defensiva:** Validación de respuestas del servidor antes del renderizado de componentes.
- **Feedback Visual:** Uso de animaciones de entrada y manejo de errores visible y amigable (toasts/alerts) para informar al usuario de los estados de sus peticiones a la API.

---

_Este documento es la "fuente de verdad" del proyecto y se actualiza con cada hito de implementación técnica._

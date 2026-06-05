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
- **Helpers de Sesión:** Implementación de funciones exportables (`getToken`, `getUser`, `logout`, `isAuthenticated`) para estandarizar el acceso seguro al `localStorage` en toda la aplicación, previniendo errores de parseo (ej. capturando excepciones de `JSON.parse` que antes causaban pantallas blancas).

### 2.3. Gestión del Estado y Navegación (`src/pages/Login.jsx`)

- **Persistencia:** Almacenamiento tanto del JWT (Token) como del objeto de usuario en `localStorage` tras el inicio de sesión.
- **Redirección Inteligente:** Redirección centralizada al panel de control tras un login exitoso.

---

## 3. Arquitectura de Layout y Panel de Control (Dashboard)

Se ha implementado un sistema de **Layouts y Outlets** para separar la estructura persistente de la aplicación del contenido dinámico, reforzado con seguridad perimetral.

### 3.1. Seguridad de Rutas (`src/components/layout/ProtectedRoute.jsx`)

- **Patrón Higher-Order Component (HOC):** Se ha desarrollado un componente `ProtectedRoute` que envuelve todas las rutas privadas de la aplicación.
- **Lógica:** Al intentar acceder a cualquier ruta del Dashboard, el componente verifica la existencia de una sesión válida mediante `isAuthenticated()`. Si el usuario no está logueado, es interceptado y redirigido automáticamente a la pantalla de `/login` mediante el componente `<Navigate />` de React Router.

### 3.2. Estructura Global (`src/components/layout/`)

- **`MainLayout.jsx`**: Orquestador principal que mantiene `Sidebar` y `Topbar` fijos.
- **`Sidebar.jsx`**: Barra lateral con **lógica de roles integrada**.
- **`Topbar.jsx`**: Incluye buscador global y acceso al perfil.

### 3.2. Panel Principal (`src/pages/Dashboard.jsx`)

Vista centralizada que actúa como centro de mando:

- **Refactorización Mobile-First:** El dashboard fue reconstruido utilizando CSS Grid (`grid-cols-1 md:grid-cols-3` o `grid-cols-5` para Admin), garantizando que las métricas y gráficas se apilen en dispositivos móviles, eliminando por completo cualquier scroll horizontal no deseado.
- **MetricCard (DRY):** Las tarjetas visuales de métricas clave fueron extraídas a un componente reutilizable (`src/components/common/MetricCard.jsx`) para limpiar el código principal.
- **Gestión de Datos:** Tabla interactiva con estados de peticiones y gráficas interactivas (`Chart.js`).
- **Acciones:** Control de estado para la apertura del modal `CreateAskModal`.

---

## 4. Gestión Integral de Peticiones ("Peticiones de Ayuda")

Se ha implementado el flujo completo (Frontend-Backend) para el registro, búsqueda multi-dimensional y modificación de peticiones de ayuda, utilizando componentes modales avanzados.

### 4.1. Componente `CreateAskModal.jsx` (Polimorfismo y Máquina de Estados)

- **Ubicación:** `src/components/asks/CreateAskModal.jsx`.
- **Modos de Operación:** Mediante la prop `askToEdit`, el componente cambia dinámicamente entre modo **Registro** (POST) y modo **Edición** (PUT).
- **Máquina de Estados en UI:** El selector de "Estado" solo aparece en modo Edición e incluye transiciones explícitas (`CREATED`, `OPEN`, `MATCHED`, `FULFILLED`, `CANCELLED`), apoyándose en la estricta validación del backend que rechaza saltos de estado no permitidos.
- **Carga Dinámica de Datos:** Mediante el hook `useEffect`, el componente consume las APIs de `Askers` y `Domains` al montarse.
- **Patrón STI (Single Table Inheritance):** El formulario muta y adapta sus campos dinámicamente según el tipo de recurso seleccionado (`THINGS`, `TIME`, `EXPERTISE`, `SERVICES`).
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

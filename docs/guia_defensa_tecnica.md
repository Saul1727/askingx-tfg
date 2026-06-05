# Guía de Defensa Técnica: Proyecto AskingX (Frontend)

Este documento ha sido diseñado específicamente para la preparación de la defensa del TFG. Explica la estructura, las decisiones tecnológicas y la lógica detrás de cada parte del código en la carpeta `src`.

---

## 1. Justificación de la Stack Tecnológica

Si te preguntan **"¿Por qué estas tecnologías?"**, aquí tienes los argumentos:

- **Vite:** Elegido frente a _Create React App_ por su velocidad extrema en el desarrollo (HMR instantáneo) y su optimización en el bundle final utilizando Rollup.
- **React (v19) + Functional Components:** Es el estándar de la industria. Permite el uso de **Hooks** para una gestión del estado más limpia y lógica que las antiguas clases.
- **Tailwind CSS:** Se eligió para evitar archivos CSS gigantescos y difíciles de mantener. Tailwind permite un diseño "utility-first", asegurando que el diseño sea coherente y facilitando cambios rápidos sin efectos secundarios en otros componentes.
- **Lucide React:** Una librería de iconos ligera, personalizable y que soporta Tree-shaking (solo se carga el icono que usas).

---

## 2. Análisis de la Carpeta `src/` (Arquitectura)

### 2.1. `src/main.jsx`

- **Función:** Punto de entrada de la aplicación.
- **Decisión:** Aquí se envuelve la aplicación en `<BrowserRouter>` para habilitar el sistema de rutas y en `<StrictMode>` para detectar problemas potenciales durante el desarrollo.

### 2.2. `src/App.jsx`

- **Función:** Definición del sistema de rutas (`react-router-dom`).
- **Lógica:** Separa las rutas públicas (Login) de las privadas (protegidas por el `MainLayout`).
- **Estructura de Roles:** Se han implementado rutas específicas para cada rol de usuario (`/admin/dashboard`, `/author/asks`, `/connector/matches`, `/giver/history`) para asegurar que el sistema de redirección post-login funcione correctamente.

### 2.3. `src/services/` (Capa de Infraestructura)

- **`authService.js` y `askService.js`**: Contienen la lógica de comunicación HTTP con el backend.
- **Decisión Estándar (`fetch` nativo)**: Se decidió unificar todas las llamadas HTTP bajo la API nativa `fetch`, prescindiendo de librerías externas como `axios` o wrappers personalizados. Esto reduce el peso del bundle, estandariza el código y simplifica la inyección del token JWT.
- **¿Por qué?**: **Principio de Separación de Concernimientos (SoC)**. Si el endpoint de la API cambia mañana, solo modificas este archivo, no todos los componentes visuales de React.

### 2.4. `src/pages/` (Componentes de Página)

- **`Login.jsx`**: Gestiona el acceso.
  - **Técnica:** Uso de `useNavigate` para redirección y `localStorage` para persistencia del token.
- **`Dashboard.jsx`**: El panel principal.
  - **Técnica:** Componentización avanzada. Para evitar código monolítico, las tarjetas de métricas se extrajeron a un componente común reutilizable `MetricCard.jsx`, limpiando significativamente la vista principal.

### 2.5. `src/components/layout/` (Componentes Estructurales)

- **`MainLayout.jsx`**: Contenedor maestro. Usa `<Outlet />`, bloquea el desbordamiento horizontal (`overflow-x-hidden`) y gestiona el estado móvil de los menús.
- **`Sidebar.jsx`**: El cerebro de la navegación.
  - **Decisión de Diseño:** Uso de un **Mapa de Roles**. La visibilidad de los elementos es condicional (`isAdmin`, `isAuthor`). Implementa lógica Mobile-First para ocultarse lateralmente en pantallas pequeñas.
- **`Topbar.jsx`**: Gestión de utilidades globales (idioma, perfil, búsqueda y botón hamburguesa en móviles).

---

## 3. Explicación de Funcionalidades Clave (Para la defensa)

### A. Gestión de Estados y Efectos (Hooks)

- **`useState`**: Usado para datos interactivos (formularios, loadings, modales, menú móvil).
- **`useEffect`**: Fundamental en modales como `CreateAskModal` para lanzar peticiones asíncronas a la API (GET de Organizaciones y Dominios) exactamente en el momento en que el componente se monta/abre en pantalla.
- **`useNavigate`**: Usado para enrutamiento SPA (Single Page Application).

### B. Lógica STI (Single Table Inheritance) y Reutilización en Formularios

- **Reutilización del Modal:** El `CreateAskModal` ha sido diseñado para ser polimórfico. Mediante la prop `askToEdit`, el mismo componente es capaz de funcionar en modo **Creación** (POST) o modo **Edición** (PUT). Esto reduce la duplicidad de código y centraliza la lógica de validación de campos complejos (STI) en un único punto.
- **Mutación Dinámica:** El formulario muta dinámicamente según el tipo de recurso seleccionado (Cosas, Tiempo, etc.). Esto demuestra un diseño frontend que se adapta perfectamente a una arquitectura de base de datos eficiente, enviando únicamente los campos (payload) requeridos por cada tipo.

### C. Gestión de Fechas y Zonas Horarias

- **El reto de la UX:** Se implementó una lógica de zona horaria local (`Date.getFullYear()`, etc.) para bloquear fechas pasadas en los inputs de HTML, evitando el clásico bug de desfase UTC vs Hora Local. Finalmente, se formatea a ISO 8601 (`toISOString()`) para asegurar la compatibilidad con el ORM (Prisma) y PostgreSQL.

### D. Diseño Mobile-First y Responsive

- **El Reto:** Los paneles de administración tienden a colapsar en pantallas pequeñas.
- **La Solución:** Todo el layout de AskingX fue refactorizado con una mentalidad *Mobile-First*. Usando CSS Grid (`grid-cols-1 md:grid-cols-4`), en móviles todos los paneles (`MetricCard`, gráficas) se apilan en una sola columna verticalmente sin generar scrolls horizontales molestos. El Sidebar pasa a ser un menú oculto "off-canvas", y la barra de búsqueda cede su espacio para mantener la legibilidad.

---

## 4. Principios Clean Code y Fiabilidad (El "Sello de Calidad")

Si te preguntan por la **calidad del código y la tolerancia a fallos**:

1.  **Programación Defensiva (Fail-Safe):** En lugar de confiar ciegamente en el backend, el código frontend previene "crasheos" críticos. Por ejemplo, se utiliza `Array.isArray(data)` antes de ejecutar un `.map()` en los desplegables. Si el backend devuelve un error o un formato inesperado, la aplicación maneja el error sin romperse (pantalla en blanco/negro).
2.  **DRY (Don't Repeat Yourself):** Creación de componentes reutilizables como `InputField` y `MetricCard`.
3.  **Single Responsibility Principle (SRP):** Clara separación entre UI (Componentes) y Lógica de Datos (Servicios).
4.  **Búsqueda Compleja Centralizada:** En la pantalla de `Asks.jsx`, el filtrado de búsqueda es multi-dimensional, buscando en tiempo real por título, descripción, tipo, estado, dominio y nombre de la ONG simultáneamente sin ralentizar la UI.
5.  **Extracción Dinámica de JWT:** Uso de decodificación segura del Token (Base64) en el cliente para extraer información del usuario (ej. `authorId`) sin depender de peticiones extra al servidor, optimizando la red.

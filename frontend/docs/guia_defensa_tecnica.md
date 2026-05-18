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
- **¿Por qué?**: **Principio de Separación de Concernimientos (SoC)**. Si el endpoint de la API cambia mañana, solo modificas este archivo, no todos los componentes visuales de React.

### 2.4. `src/pages/` (Componentes de Página)

- **`Login.jsx`**: Gestiona el acceso.
  - **Técnica:** Uso de `useNavigate` para redirección y `localStorage` para persistencia del token.
- **`Dashboard.jsx`**: El panel principal.
  - **Técnica:** Descomposición en sub-componentes internos (StatCard, TableRow). Gestiona el estado de visibilidad (apertura/cierre) del modal de creación de peticiones.

### 2.5. `src/components/layout/` (Componentes Estructurales)

- **`MainLayout.jsx`**: Contenedor maestro. Usa `<Outlet />`, una característica de React Router que permite inyectar diferentes páginas manteniendo el Sidebar y Topbar fijos.
- **`Sidebar.jsx`**: El cerebro de la navegación.
  - **Decisión de Diseño:** Uso de un **Mapa de Roles**. La visibilidad de los elementos es condicional (`isAdmin`, `isAuthor`). Esto es Clean Code: evitamos una maraña de `if/else` dentro del HTML (JSX).
- **`Topbar.jsx`**: Gestión de utilidades globales (idioma, perfil, búsqueda).

---

## 3. Explicación de Funcionalidades Clave (Para la defensa)

### A. Gestión de Estados y Efectos (Hooks)

- **`useState`**: Usado para datos interactivos (formularios, loadings, modales).
- **`useEffect`**: Fundamental en modales como `CreateAskModal` para lanzar peticiones asíncronas a la API (GET de Organizaciones y Dominios) exactamente en el momento en que el componente se monta/abre en pantalla.
- **`useNavigate`**: Usado para enrutamiento SPA (Single Page Application).

### B. Lógica STI (Single Table Inheritance) en Formularios

- En el modal de "Nueva Petición", el formulario muta dinámicamente según el tipo de recurso seleccionado (Cosas, Tiempo, etc.). Esto demuestra un diseño frontend que se adapta perfectamente a una arquitectura de base de datos eficiente, enviando únicamente los campos (payload) requeridos por cada tipo.

### C. Gestión de Fechas y Zonas Horarias

- **El reto de la UX:** Se implementó una lógica de zona horaria local (`Date.getFullYear()`, etc.) para bloquear fechas pasadas en los inputs de HTML, evitando el clásico bug de desfase UTC vs Hora Local. Finalmente, se formatea a ISO 8601 (`toISOString()`) para asegurar la compatibilidad con el ORM (Prisma) y PostgreSQL.

---

## 4. Principios Clean Code y Fiabilidad (El "Sello de Calidad")

Si te preguntan por la **calidad del código y la tolerancia a fallos**:

1.  **Programación Defensiva (Fail-Safe):** En lugar de confiar ciegamente en el backend, el código frontend previene "crasheos" críticos. Por ejemplo, se utiliza `Array.isArray(data)` antes de ejecutar un `.map()` en los desplegables. Si el backend devuelve un error o un formato inesperado, la aplicación maneja el error sin romperse (pantalla en blanco/negro).
2.  **DRY (Don't Repeat Yourself):** Creación de componentes reutilizables como `InputField`.
3.  **Single Responsibility Principle (SRP):** Clara separación entre UI (Componentes) y Lógica de Datos (Servicios).
4.  **Extracción Dinámica de JWT:** Uso de decodificación segura del Token (Base64) en el cliente para extraer información del usuario (ej. `authorId`) sin depender de peticiones extra al servidor, optimizando la red.

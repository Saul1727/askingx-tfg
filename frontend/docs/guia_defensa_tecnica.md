# Guía de Defensa Técnica: Proyecto AskingX (Frontend)

Este documento ha sido diseñado específicamente para la preparación de la defensa del TFG. Explica la estructura, las decisiones tecnológicas y la lógica detrás de cada parte del código en la carpeta `src`.

---

## 1. Justificación de la Stack Tecnológica

Si te preguntan **"¿Por qué estas tecnologías?"**, aquí tienes los argumentos:

- **Vite:** Elegido frente a *Create React App* por su velocidad extrema en el desarrollo (HMR instantáneo) y su optimización en el bundle final utilizando Rollup.
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
- **Lógica:** Separa las rutas públicas (Login) de las privadas (protegidas por el `MainLayout`). Esto facilita la futura implementación de guardias de seguridad (Auth Guards).

### 2.3. `src/services/` (Capa de Infraestructura)
- **`authService.js`**: Contiene la lógica de comunicación con el exterior.
- **¿Por qué?**: **Principio de Separación de Concernimientos**. Si el endpoint de la API cambia mañana, solo modificas este archivo, no todos los componentes que inician sesión.

### 2.4. `src/pages/` (Componentes de Página)
- **`Login.jsx`**: Gestiona el acceso.
    - **Técnica:** Uso de `useNavigate` para redirección y `localStorage` para persistencia del token.
- **`Dashboard.jsx`**: El panel principal.
    - **Técnica:** Descomposición en sub-componentes internos (StatCard, TableRow). Esto hace que el código sea legible y fácil de testear.

### 2.5. `src/components/layout/` (Componentes Estructurales)
- **`MainLayout.jsx`**: Contenedor maestro. Usa `<Outlet />`, una característica de React Router que permite inyectar diferentes páginas manteniendo el Sidebar y Topbar fijos.
- **`Sidebar.jsx`**: El cerebro de la navegación.
    - **Decisión de Diseño:** Uso de un **Mapa de Roles**. La visibilidad de los elementos es condicional (`isAdmin`, `isAuthor`). Esto es Clean Code: evitamos una maraña de `if/else` dentro del HTML (JSX).
- **`Topbar.jsx`**: Gestión de utilidades globales (idioma, perfil, búsqueda).

---

## 3. Explicación de Funcionalidades Clave (Para la defensa)

### A. Gestión de Estados (Hooks)
- **`useState`**: Usado para datos que cambian y deben refrescar la pantalla (como el email del usuario o si el botón de login está cargando).
- **`useNavigate`**: Usado para mover al usuario entre pantallas sin recargar la página (Single Page Application - SPA).

### B. Comunicación Asíncrona (Async/Await)
- Se ha preferido `async/await` sobre `.then()` porque el código resultante se lee de forma síncrona, es más fácil de depurar y manejar errores con bloques `try/catch`.

### C. Responsividad (Tailwind)
- Se han utilizado prefijos como `md:` o `lg:` en las clases de Tailwind. Esto demuestra que la aplicación es **Mobile First**, adaptándose a dispositivos móviles y escritorio sin necesidad de media queries manuales complejas.

### D. Persistencia de Sesión
- El token se guarda en `localStorage`. **Explicación:** Esto permite que si el usuario refresca la página (F5), no pierda la sesión (aunque en una fase más avanzada de seguridad se usarían Cookies HttpOnly).

---

## 4. Principios Clean Code Aplicados (El "Sello de Calidad")

Si te preguntan por la **calidad del código**:

1.  **DRY (Don't Repeat Yourself):** He creado componentes reutilizables como `InputField`. No copio y pego el HTML de un input 5 veces; lo defino una vez y lo llamo con diferentes "props".
2.  **KISS (Keep It Simple, Stupid):** Las funciones son cortas y directas. Si una función hace demasiadas cosas, se divide.
3.  **Single Responsibility Principle (SRP):** Un archivo para la API, un archivo para el Layout, un archivo por cada página. Nada de "archivos monstruo" de 1000 líneas.
4.  **Nombres Semánticos:** En lugar de llamar a una variable `x` o `data`, usamos `userRole`, `isLoading` o `loginUser`. El código se explica a sí mismo.

---
*Esta guía te servirá para responder con seguridad a cualquier pregunta técnica del tribunal sobre el frontend.*

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
- **Estética:** Se ha replicado fielmente la identidad visual de la UPV, utilizando un fondo degradado suave (`bg-gradient-to-br from-blue-50 via-white to-gray-100`) y una tarjeta central con sombras profundas para focalizar la atención del usuario.
- **Interactividad:** Implementación de visibilidad dinámica de contraseña y estados de carga (*loading states*) para evitar envíos duplicados.
- **Accesibilidad y Visibilidad:** Se han forzado fondos blancos (`bg-white`) y texto oscuro (`text-gray-900`) en los inputs del login para garantizar la legibilidad absoluta, independientemente de si el usuario tiene activado el modo oscuro en su sistema.

### 2.2. Lógica de Negocio y API (`src/services/authService.js`)
- Se ha creado una capa de servicios para abstraer las peticiones HTTP.
- **`loginUser(email, password)`**: Gestiona la comunicación con el endpoint `/api/users/login`, incluyendo el manejo de errores robusto basado en las respuestas del servidor.

### 2.3. Gestión del Estado y Navegación (`src/pages/Login.jsx`)
- **Persistencia:** Almacenamiento del JWT (Token) en `localStorage` tras una autenticación exitosa.
- **Redirección Inteligente:** Uso de un objeto `Map()` para redirigir a los usuarios a sus respectivos paneles según su rol (ADMIN, AUTHOR, CONNECTOR, GIVER).

---

## 3. Arquitectura de Layout y Panel de Control (Dashboard)

Se ha implementado un sistema de **Layouts y Outlets** para separar la estructura persistente de la aplicación del contenido dinámico.

### 3.1. Estructura Global (`src/components/layout/`)
- **`MainLayout.jsx`**: Orquestador principal que mantiene el `Sidebar` y el `Topbar` fijos mientras cambia el contenido central.
- **`Sidebar.jsx`**: Barra lateral con **lógica de roles integrada**. Filtra automáticamente los accesos (ej. Secciones de Admin solo visibles para el rol `ADMIN`).
- **`Topbar.jsx`**: Incluye buscador global, selector de idiomas y acceso al perfil del usuario.

### 3.2. Panel Principal (`src/pages/Dashboard.jsx`)
Vista centralizada que actúa como centro de mando para el usuario:
- **KPI Cards:** Tarjetas visuales que resumen métricas clave (Organizaciones totales, peticiones abiertas/completadas).
- **Gestión de Datos:** Tabla interactiva con estados codificados por colores (ABIERTA, COMPLETADA, etc.) y acciones rápidas de edición y visualización.
- **Acciones Principales:** Botón destacado para la creación de nuevas peticiones ("+ Nueva Petición").

---

## 4. Enrutamiento y Seguridad

- **Configuración de Rutas:** Centralizada en `App.jsx`, definiendo rutas públicas (Login) y rutas protegidas bajo el Layout principal.
- **Redirección por Defecto:** El sistema redirige automáticamente al Dashboard tras el login o al Login si no hay una sesión activa detectada.

---

## 5. Principios de Ingeniería y Clean Code Aplicados

- **Responsabilidad Única (SRP):** Descomposición de páginas complejas en sub-componentes especializados (ej. `StatCard`, `InputField`, `TableRow`).
- **DRY (Don't Repeat Yourself):** Reutilización de componentes de UI (botones, inputs, campos de contraseña).
- **Código Declarativo:** Uso de estructuras de datos (Maps y Arrays de configuración) para generar menús y rutas, facilitando la adición de nuevas funcionalidades sin modificar la lógica principal.
- **Feedback Visual:** Uso de animaciones de entrada y transiciones de Tailwind para una experiencia de usuario fluida y profesional.

---
*Este documento es la "fuente de verdad" del proyecto y se actualiza con cada hito de implementación.*

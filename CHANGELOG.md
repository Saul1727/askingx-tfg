# Registro de Cambios (Changelog) - TFG AskingX

## [Sprint 1] - Configuración Base y Usuarios Core (27/04/2026)
- **Añadido:** Inicialización del proyecto Express con arquitectura en capas (Routes, Controllers, Services).
- **Añadido:** Configuración de Prisma ORM y conexión a PostgreSQL.
- **Añadido:** Implementación del middleware global de manejo de errores (`errorHandler`).
- **Seguridad:** Integración de la librería `bcrypt` para el cifrado (hashing) de contraseñas.
- **Seguridad:** Implementación de validación de datos de entrada usando `zod`.
- **Característica:** Endpoint POST `/api/users/admin` para la creación del primer usuario con rol `ADMIN`.
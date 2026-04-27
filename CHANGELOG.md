# Registro de Cambios (Changelog) - TFG AskingX

## [Sprint 1] - Configuración Base y Usuarios Core (27/04/2026)
- **Añadido:** Inicialización del proyecto Express con arquitectura en capas (Routes, Controllers, Services).
- **Añadido:** Configuración de Prisma ORM y conexión a PostgreSQL.
- **Añadido:** Implementación del middleware global de manejo de errores (`errorHandler`).
- **Seguridad:** Integración de la librería `bcrypt` para el cifrado (hashing) de contraseñas.
- **Seguridad:** Implementación de validación de datos de entrada usando `zod`.
- **Característica:** Endpoint POST `/api/users/admin` para la creación del primer usuario con rol `ADMIN`.

- **Arquitectura:** Creación del dominio `Asker` (Routes, Controllers, Services), separándolo del dominio `User` para respetar el Principio de Responsabilidad Única (SRP).
- **Característica:** Endpoint POST `/api/askers` para que los `AskAuthors` registren a los solicitantes vulnerables.
- **Validación Avanzada:** Implementación de reglas de negocio complejas usando `.refine()` de Zod para garantizar que, aunque los campos de contacto sean opcionales individualmente, se proporcione al menos una vía de contacto válida (teléfono, email o dirección).

- **Bugfix (Core):** Refactorizado el middleware global de errores (`errorHandler.js`). Se reemplazó la validación insegura por strings (`err.name`) por la comprobación de prototipos (`err instanceof ZodError`), mapeando correctamente la propiedad nativa `.issues` para evitar caídas del servidor (HTTP 500) ante peticiones malformadas.

- **Característica (Core):** Implementación completa del dominio `Ask` (Petición), la entidad central del modelo AskingX.
- **Seguridad:** Implementada validación de integridad referencial triple en el servicio:
  1. Existencia del Solicitante (`Asker`).
  2. Existencia y rol del Autor (`User` con rol `AUTHOR`).
  3. Verificación de propiedad (Un `AskAuthor` solo puede crear peticiones para sus propios `Askers`).
- **Técnico:** Soporte para el patrón de especialización de campos (`quantityRequested`, `estimatedHours`, etc.) mediante una estructura de tabla única en PostgreSQL manejada por Prisma.

- **Base de Datos:** Refactorizado el `schema.prisma` añadiendo la relación `giverId` a `Fulfillment` para garantizar la trazabilidad atómica de las donaciones. Sincronizado con PostgreSQL.
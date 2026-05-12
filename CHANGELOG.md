# Registro de Cambios (Changelog) - TFG AskingX

## [Sprint 4] - Lógica de Negocio, Privacidad y Fidelidad UML (13/05/2026)

- **Arquitectura y Base de Datos:** Sincronización estricta del `schema.prisma` con el diagrama UML oficial. Se corrigió la relación entre Petición y Dominio a 1:N (cada `Ask` pertenece a un único `Domain`) y se añadió la relación N:N `specialties` para modelar los ámbitos de conocimiento de los expertos (`Connectors` y `Givers`).
- **Automatización de Negocio:** Implementado un "trigger" lógico en `fulfillmentService.js`. Ahora, cuando se registra una entrega (match), el sistema transiciona automáticamente el estado de la petición de `OPEN` a `MATCHED`, notificando implícitamente al Trabajador Social.
- **Privacidad por Diseño (Visibilidad):** Refactorizado masivamente el endpoint `getAllAsks`. Ahora aplica filtros dinámicos basados en el Token JWT:
  - `Connectors`: Solo visualizan peticiones abiertas que coincidan con sus dominios de especialidad (SME).
  - `Authors`: Solo tienen acceso a los casos que su propia organización ha registrado.
  - `Givers`: Solo pueden visualizar su historial personal de donaciones confirmadas.
- **Seguridad (Anti-Spoofing):** Modificado el controlador de creación de peticiones (`createAsk`). El sistema ahora ignora el creador enviado en el cuerpo de la petición y fuerza el uso del ID inyectado por el token JWT, previniendo la suplantación de identidad entre trabajadores sociales.
- **Seguridad (Ownership):** Blindada la función `updateAskStatus`. Un `AUTHOR` (Trabajador social) ahora recibirá un Error 403 si intenta cerrar o modificar una petición que pertenezca a otra organización.
- **Refactorización de Permisos:** Retirados los permisos de escritura al rol `GIVER` en el endpoint `POST /api/fulfillments`. Se establece al donante como un agente externo, dejando la responsabilidad de registrar las entregas logística exclusivamente a los `CONNECTORS` (expertos) y `AUTHORS`.
- **Bugfixes Críticos:**
  - Resuelto un fallo de caída de servidor (crash) en `authMiddleware` corrigiendo el manejo de la propiedad de excepción (`error.name`).
  - Corregida la validación Zod de estados para que coincida exactamente con el ENUM de Prisma (estado `CANCELLED`).
  - Alineada la inyección de propiedades especializadas (corrección de plural a singular en `requiredSkill`).
  - Reparadas las rutas de importación del directorio `middlewares` en las rutas de Fulfillments.

## [Sprint 3] - Seguridad, JWT y RBAC (12/05/2026)

- **Característica (Seguridad):** Implementado el endpoint de autenticación `POST /api/users/login` que genera Tokens JWT firmados con el ID y Rol del usuario.
- **Característica (Seguridad):** Creado el `authMiddleware` para interceptar y validar tokens en rutas protegidas, rechazando peticiones no autenticadas (HTTP 401).
- **Característica (Seguridad):** Creado el `roleMiddleware` para establecer un Control de Acceso Basado en Roles (RBAC), devolviendo HTTP 403 ante intentos de acceso no autorizados.
- **Arquitectura:** Aplicados los middlewares de seguridad a todos los dominios (`askRoutes`, `askerRoutes`, `fulfillmentRoutes`).
- **Lógica de Negocio:** Ampliados los permisos iniciales del endpoint `POST /api/fulfillments` permitiendo registros delegados para donantes offline (revisado posteriormente en Sprint 4).
- **Seguridad:** Refactorizado el servicio `userService.js` para asegurar que el cifrado de la contraseña se realice siempre obligatoriamente en la última capa del backend, desconfiando del payload del cliente.

## [Sprint 2] - Ciclo de Vida del Ask y Transición de Estados (05/05/2026)

- **Característica (Core):** Creación del endpoint PATCH `/api/asks/:id/status` para habilitar la transición de estados en las peticiones, dando soporte real a la funcionalidad del tablero Kanban en el Frontend.
- **Lógica de Negocio:** Adopción del patrón arquitectónico _Human-in-the-Loop_ (Humano en el bucle). Se ha decidido que la transición al estado `FULFILLED` no sea automática tras la entrega de bienes, requiriendo la verificación y el cambio manual por parte del `AskAuthor` para garantizar la veracidad de la ayuda en el mundo real.
- **Validación Avanzada:** Implementación del esquema `updateAskStatusSchema` usando Zod en el controlador, bloqueando cualquier intento de inyectar un estado que no pertenezca al ENUM oficial definido en la base de datos (`CREATED`, `OPEN`, `MATCHED`, `FULFILLED`, `CANCELLED`, `EXPIRED`).
- **Documentación:** Actualización del Registro de Decisiones Arquitectónicas (ADR) para reflejar la estrategia de despliegue _standalone_ (PaaS) y el diseño _stateless_ de la futura capa de autenticación basada en JWT.

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

# Registro de Cambios (Changelog) - TFG AskingX

## [Sprint 4] - Lógica de Negocio y Alineación UML (Hoy)

- **Refactorización Core:** Ajustado `schema.prisma` para cumplir con la relación 1:N de Dominios en el `Ask`.
- **Añadido:** Implementación de Especialidades (`specialties`) para Connectors y Givers según el diagrama de clases.
- **Automatización:** Programada la transición automática al estado `MATCHED` tras la creación de una entrega.
- **Seguridad:** Implementada validación de propiedad de registros (`Ownership`) y protección contra suplantación de identidad en la creación de peticiones.
- **Privacidad:** Filtrado de visibilidad dinámico en `getAllAsks` basado en el rol del token JWT.
- **Bugfixes:** Corregidos errores de importación de middlewares, ortografía en el estado `CANCELLED` y tipado singular en `requiredSkill`.

## [Sprint 3] - Seguridad y RBAC

- **Añadido:** Implementación de Tokens JWT y sistema de login.
- **Seguridad:** Creados `authMiddleware` y `roleMiddleware` para control de acceso.
- **Lógica:** Habilitado el registro de donaciones institucionales por parte de terceros (Connectors/Authors).

## [Sprint 2] - Ciclo de Vida del Ask

- **Añadido:** Endpoints de actualización de estado mediante PATCH.
- **Diseño:** Implementación del patrón _Human-in-the-Loop_ para la verificación de entregas.

## [Sprint 1] - Configuración Base

- **Añadido:** Inicialización de Express, Prisma y PostgreSQL.
- **Seguridad:** Cifrado de contraseñas con Bcrypt y validación con Zod.
- **Arquitectura:** Separación de dominios `Asker`, `User` y `Ask` (SRP).

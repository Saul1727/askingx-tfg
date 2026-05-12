# Registro de Decisiones Arquitectónicas (ADR)

## 1. Patrón de Arquitectura Backend

Se ha optado por implementar una **Arquitectura estricta en Capas (Layered Architecture)** en Node.js con Express, dividiendo el flujo en:

- **Rutas (Routes):** Definen los endpoints y mapean los controladores.
- **Controladores (Controllers):** Gestionan las peticiones HTTP, extraen el payload y delegan la ejecución. No contienen lógica de negocio.
- **Servicios (Services):** Contienen el "core" de la lógica de negocio y se comunican con la base de datos a través del ORM.
  _Justificación:_ Facilita la escalabilidad del TFG, el mantenimiento y la futura implementación de pruebas unitarias al desacoplar responsabilidades.

## 2. ORM y Base de datos

Se utiliza **Prisma ORM (v5)** contra una base de datos PostgreSQL.
_Justificación:_ Prisma proporciona un tipado estricto que reduce errores en tiempo de ejecución y una sintaxis declarativa (schema) muy alineada con los diagramas UML diseñados (como la herencia de tabla única para los distintos tipos de `Ask`).

## 3. Seguridad y Validación

- **Cifrado de Contraseñas:** Se ha integrado `bcrypt` con un "salt round" de 10. _Justificación:_ Almacenar contraseñas en texto plano vulnera las normativas básicas de seguridad y el RGPD. 10 rondas ofrecen un buen equilibrio entre seguridad criptográfica y rendimiento del servidor.
- **Validación de Entradas:** Se utiliza `Zod` a nivel de controlador. _Justificación:_ Permite definir esquemas estrictos (ej. tamaño mínimo de contraseña, formato de email), rechazando peticiones malformadas antes de que alcancen la lógica de negocio o saturen la base de datos.

## 4. Prevención de Inyección SQL y Saneamiento de Datos

Para proteger la integridad de la base de datos, se aplica una estrategia de defensa en profundidad (Defense in Depth) en dos capas:

1. **Validación de Entrada (Zod):** Actúa como primera barrera en la capa de controladores, garantizando que los datos cumplen con la tipificación y el formato esperado (ej. validación estricta de emails) y rechazando peticiones malformadas (HTTP 400 Bad Request) antes de ejecutar lógica de negocio.
2. **Consultas Parametrizadas (Prisma ORM):** El mapeador objeto-relacional (Prisma) gestiona toda la comunicación con PostgreSQL utilizando sentencias preparadas (Prepared Statements) bajo el capó. Esto asegura que los datos introducidos por el usuario nunca se concatenan directamente en la consulta SQL, previniendo por diseño los ataques de Inyección SQL (SQLi).

## 5. Manejo Robusto de Errores en Tiempo de Ejecución (Runtime)

En arquitecturas basadas en Javascript/Node.js, es una mala práctica (anti-patrón) depender de cadenas de texto (ej. `err.name === 'ZodError'`) para la identificación y manejo de excepciones, ya que es propenso a fallos si la estructura del error cambia. Para solucionar un bug crítico (HTTP 500) al procesar validaciones cruzadas, se implementó el uso del operador `instanceof` (`err instanceof ZodError`) en el middleware global.

_Justificación Técnica:_ Esto garantiza una comprobación estricta a nivel de prototipo de clase. Permite la extracción segura de la propiedad nativa `.issues` de Zod, garantizando que el frontend o cliente API siempre reciba un formato JSON predecible con código HTTP 400, protegiendo la estabilidad del hilo principal del servidor de Express.

## 6. Separación de Dominios (Principio de Responsabilidad Única - SRP)

Aunque un `Asker` (Solicitante) no deja de ser una persona registrada en la plataforma, no tiene capacidad de login ni rol de usuario. Por tanto, en la capa lógica de la API (Controllers y Services), se ha separado completamente su gestión del `userService`, creando un `askerService` propio. Esta decisión respeta el Principio de Responsabilidad Única (SRP), evitando controladores monolíticos y preparando el código para escalar (Domain-Driven Design básico).

## 7. Modelado de Datos vs Reglas de Negocio (Validaciones Cruzadas)

Según el modelo conceptual de AskingX, un Solicitante puede ser tanto un individuo vulnerable como una organización. Esto obliga a nivel de base de datos (Prisma) a que campos como `organizationName`, `phone` o `address` sean nulos (opcionales). Sin embargo, para evitar registrar entidades "huérfanas" o ilocalizables, se ha delegado la responsabilidad de la integridad de contacto a la capa del Controlador mediante Zod (función `.refine()`). La regla de negocio exige que la petición HTTP contenga, obligatoriamente, al menos un método de contacto válido, combinando la flexibilidad de la base de datos con la rigidez requerida por el trabajo de campo de la ONG.

## 8. Implementación de la Entidad Central: El Ask

El `Ask` representa una petición formalizada. Debido a su naturaleza crítica, se han tomado las siguientes decisiones de diseño:

### A. Validación de Propiedad y Permisos (Ownership)

A diferencia de un sistema convencional donde cualquier usuario con rol de "escritura" puede crear registros, en AskingX se ha implementado una restricción lógica en la capa de Servicio: un `AskAuthor` solo puede registrar peticiones para aquellos `Askers` (vulnerables) que él mismo ha dado de alta.
_Justificación:_ Esto garantiza la trazabilidad y la responsabilidad directa del trabajador social sobre el caso, evitando manipulaciones cruzadas de datos entre distintos conectores u organizaciones.

### B. Especialización de Tipos (Single-Table Inheritance)

Aunque existen 4 tipos de peticiones (`THINGS`, `TIME`, `EXPERTISE`, `SERVICES`), se ha optado por un modelo de persistencia de tabla única.
_Justificación:_ Facilita las consultas globales (ej: "ver todas las peticiones abiertas") y simplifica la relación con futuras entidades como `Fulfillment` o `Story`, manteniendo la flexibilidad mediante campos opcionales que Zod valida dinámicamente según el `Enum` del tipo seleccionado.

### C. Ciclo de Vida del Ask

Todas las peticiones nacen con el estado `CREATED` por defecto. Esta decisión de diseño asegura que ninguna petición sea visible para los donantes (`Givers`) hasta que un perfil superior (`Connector` o `Admin`) valide la petición y cambie su estado a `OPEN`.

## 9. Trazabilidad Atómica en las Entregas (Fulfillments)

Durante el desarrollo del dominio de operaciones, se detectó una limitación en el modelo conceptual inicial: vincular los donantes (`Givers`) únicamente a la Petición (`Ask`) impedía auditar las aportaciones individuales en peticiones de entregas múltiples.
**Decisión:** Se refactorizó el esquema relacional añadiendo una clave foránea explícita (`giverId`) en la entidad `Fulfillment`.
**Justificación:** Esta normalización de base de datos aplica el principio de Trazabilidad Atómica. Permite a la plataforma funcionar como un registro transaccional auditable, vital para la transparencia exigida en el Tercer Sector y para la posterior generación precisa de Historias de Impacto (`Stories`).

### D. Transición de Estados y Patrón "Human-in-the-Loop"

Para la gestión del ciclo de vida de una petición (transiciones entre `CREATED`, `OPEN`, `MATCHED` y `FULFILLED`), se ha habilitado un endpoint específico mediante el método HTTP `PATCH`.

**Decisión:** La transición al estado final `FULFILLED` (Completado) no se realiza de forma automática cuando el donante (`Giver`) registra una entrega (`Fulfillment`), sino que requiere una confirmación manual por parte del `AskAuthor` (Trabajador Social).
**Justificación:** Se ha implementado un patrón arquitectónico de moderación humana (_Human-in-the-Loop_). Dado que la plataforma opera en el mundo real (entregas físicas de bienes o tiempo), el sistema no puede confiar ciegamente en el _input_ del donante. El `AskAuthor`, como propietario del caso, debe verificar físicamente que la entrega cumple con los requisitos antes de cerrar la petición, garantizando así la calidad y veracidad de los datos.

## 10. Estrategia de Despliegue y Autenticación (Próximos Pasos)

- **Despliegue Independiente (Standalone):** Se ha decidido que la arquitectura opere de forma independiente a los sistemas heredados de la ONG, facilitando su despliegue en plataformas _cloud_ (PaaS) y limitando el alcance del proyecto a una prueba de concepto integral.
- **Autenticación (Diseño):** El manejo de sesiones se diseñará sin estado (_stateless_) utilizando JSON Web Tokens (JWT) inyectados en la cabecera HTTP (`Authorization: Bearer`), delegando el almacenamiento seguro al cliente (Frontend) y facilitando el control de acceso basado en roles (RBAC) en el Backend.

## 11. Seguridad: Autenticación Stateless y Control de Acceso (RBAC)

El sistema de seguridad de la API se ha diseñado utilizando **JSON Web Tokens (JWT)** bajo un enfoque _stateless_ (sin estado), eliminando la necesidad de almacenar sesiones en el servidor y mejorando la escalabilidad.
Para proteger los endpoints, se ha implementado el patrón **Chain of Responsibility** mediante dos middlewares de Express:

1. `authMiddleware`: Verifica la firma criptográfica del token y la caducidad, inyectando la identidad del usuario en la petición (`req.user`).
2. `roleMiddleware`: Implementa un **Control de Acceso Basado en Roles (RBAC)** dinámico, evaluando si el rol inyectado posee los privilegios necesarios para la ruta.

## 12. Dualidad del Donante y Flexibilidad Operativa (Fulfillments)

El análisis de los casos de uso reveló una dicotomía en el comportamiento de los donantes (Givers). Mientras que los donantes individuales (activos) interactúan directamente con la plataforma, los donantes institucionales o empresas (pasivos) operan de forma offline.
**Decisión:** Para resolver esto sin romper la trazabilidad atómica, el endpoint de registro de entregas (`POST /api/fulfillments`) se ha flexibilizado en el `roleMiddleware`. Permite la autogestión por parte del `GIVER`, pero también autoriza a `CONNECTORS` y `AUTHORS` a registrar la transacción en la API en nombre de un tercero, adaptando el software a las fricciones del mundo real.

Nota para la memoria: API en Diseño, OpenAPI en Apéndice

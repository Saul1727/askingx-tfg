# Registro de Decisiones Arquitectónicas (ADR)

## 1. Patrón de Arquitectura Backend
Se ha optado por implementar una **Arquitectura estricta en Capas (Layered Architecture)** en Node.js con Express, dividiendo el flujo en:
- **Rutas (Routes):** Definen los endpoints y mapean los controladores.
- **Controladores (Controllers):** Gestionan las peticiones HTTP, extraen el payload y delegan la ejecución. No contienen lógica de negocio.
- **Servicios (Services):** Contienen el "core" de la lógica de negocio y se comunican con la base de datos a través del ORM.
*Justificación:* Facilita la escalabilidad del TFG, el mantenimiento y la futura implementación de pruebas unitarias al desacoplar responsabilidades.

## 2. ORM y Base de datos
Se utiliza **Prisma ORM (v5)** contra una base de datos PostgreSQL.
*Justificación:* Prisma proporciona un tipado estricto que reduce errores en tiempo de ejecución y una sintaxis declarativa (schema) muy alineada con los diagramas UML diseñados (como la herencia de tabla única para los distintos tipos de `Ask`).

## 3. Seguridad y Validación
- **Cifrado de Contraseñas:** Se ha integrado `bcrypt` con un "salt round" de 10. *Justificación:* Almacenar contraseñas en texto plano vulnera las normativas básicas de seguridad y el RGPD. 10 rondas ofrecen un buen equilibrio entre seguridad criptográfica y rendimiento del servidor.
- **Validación de Entradas:** Se utiliza `Zod` a nivel de controlador. *Justificación:* Permite definir esquemas estrictos (ej. tamaño mínimo de contraseña, formato de email), rechazando peticiones malformadas antes de que alcancen la lógica de negocio o saturen la base de datos.

## 4. Prevención de Inyección SQL y Saneamiento de Datos
Para proteger la integridad de la base de datos, se aplica una estrategia de defensa en profundidad (Defense in Depth) en dos capas:
1. **Validación de Entrada (Zod):** Actúa como primera barrera en la capa de controladores, garantizando que los datos cumplen con la tipificación y el formato esperado (ej. validación estricta de emails) y rechazando peticiones malformadas (HTTP 400 Bad Request) antes de ejecutar lógica de negocio.
2. **Consultas Parametrizadas (Prisma ORM):** El mapeador objeto-relacional (Prisma) gestiona toda la comunicación con PostgreSQL utilizando sentencias preparadas (Prepared Statements) bajo el capó. Esto asegura que los datos introducidos por el usuario nunca se concatenan directamente en la consulta SQL, previniendo por diseño los ataques de Inyección SQL (SQLi).


## 5. Manejo Robusto de Errores en Tiempo de Ejecución (Runtime)
En arquitecturas basadas en Javascript/Node.js, es una mala práctica (anti-patrón) depender de cadenas de texto (ej. `err.name === 'ZodError'`) para la identificación y manejo de excepciones, ya que es propenso a fallos si la estructura del error cambia. Para solucionar un bug crítico (HTTP 500) al procesar validaciones cruzadas, se implementó el uso del operador `instanceof` (`err instanceof ZodError`) en el middleware global. 

*Justificación Técnica:* Esto garantiza una comprobación estricta a nivel de prototipo de clase. Permite la extracción segura de la propiedad nativa `.issues` de Zod, garantizando que el frontend o cliente API siempre reciba un formato JSON predecible con código HTTP 400, protegiendo la estabilidad del hilo principal del servidor de Express.

## 6. Separación de Dominios (Principio de Responsabilidad Única - SRP)
Aunque un `Asker` (Solicitante) no deja de ser una persona registrada en la plataforma, no tiene capacidad de login ni rol de usuario. Por tanto, en la capa lógica de la API (Controllers y Services), se ha separado completamente su gestión del `userService`, creando un `askerService` propio. Esta decisión respeta el Principio de Responsabilidad Única (SRP), evitando controladores monolíticos y preparando el código para escalar (Domain-Driven Design básico).

## 7. Modelado de Datos vs Reglas de Negocio (Validaciones Cruzadas)
Según el modelo conceptual de AskingX, un Solicitante puede ser tanto un individuo vulnerable como una organización. Esto obliga a nivel de base de datos (Prisma) a que campos como `organizationName`, `phone` o `address` sean nulos (opcionales). Sin embargo, para evitar registrar entidades "huérfanas" o ilocalizables, se ha delegado la responsabilidad de la integridad de contacto a la capa del Controlador mediante Zod (función `.refine()`). La regla de negocio exige que la petición HTTP contenga, obligatoriamente, al menos un método de contacto válido, combinando la flexibilidad de la base de datos con la rigidez requerida por el trabajo de campo de la ONG.

## 8. Implementación de la Entidad Central: El Ask
El `Ask` representa una petición formalizada. Debido a su naturaleza crítica, se han tomado las siguientes decisiones de diseño:

### A. Validación de Propiedad y Permisos (Ownership)
A diferencia de un sistema convencional donde cualquier usuario con rol de "escritura" puede crear registros, en AskingX se ha implementado una restricción lógica en la capa de Servicio: un `AskAuthor` solo puede registrar peticiones para aquellos `Askers` (vulnerables) que él mismo ha dado de alta. 
*Justificación:* Esto garantiza la trazabilidad y la responsabilidad directa del trabajador social sobre el caso, evitando manipulaciones cruzadas de datos entre distintos conectores u organizaciones.

### B. Especialización de Tipos (Single-Table Inheritance)
Aunque existen 4 tipos de peticiones (`THINGS`, `TIME`, `EXPERTISE`, `SERVICES`), se ha optado por un modelo de persistencia de tabla única. 
*Justificación:* Facilita las consultas globales (ej: "ver todas las peticiones abiertas") y simplifica la relación con futuras entidades como `Fulfillment` o `Story`, manteniendo la flexibilidad mediante campos opcionales que Zod valida dinámicamente según el `Enum` del tipo seleccionado.

### C. Ciclo de Vida del Ask
Todas las peticiones nacen con el estado `CREATED` por defecto. Esta decisión de diseño asegura que ninguna petición sea visible para los donantes (`Givers`) hasta que un perfil superior (`Connector` o `Admin`) valide la petición y cambie su estado a `OPEN`.

## 9. Trazabilidad Atómica en las Entregas (Fulfillments)
Durante el desarrollo del dominio de operaciones, se detectó una limitación en el modelo conceptual inicial: vincular los donantes (`Givers`) únicamente a la Petición (`Ask`) impedía auditar las aportaciones individuales en peticiones de entregas múltiples. 
**Decisión:** Se refactorizó el esquema relacional añadiendo una clave foránea explícita (`giverId`) en la entidad `Fulfillment`. 
**Justificación:** Esta normalización de base de datos aplica el principio de Trazabilidad Atómica. Permite a la plataforma funcionar como un registro transaccional auditable, vital para la transparencia exigida en el Tercer Sector y para la posterior generación precisa de Historias de Impacto (`Stories`).
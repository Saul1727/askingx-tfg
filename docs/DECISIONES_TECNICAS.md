Registro de Decisiones Arquitectónicas (ADR) - Proyecto AskingX

1. Patrón de Arquitectura Backend
   Se ha implementado una Arquitectura en Capas (Layered Architecture) para garantizar el desacoplamiento de responsabilidades:

Rutas (Routes): Definición de endpoints y seguridad perimetral (Middlewares).

Controladores (Controllers): Gestión de la comunicación HTTP y validación de esquemas de entrada.

Servicios (Services): Orquestación de la lógica de negocio y reglas de dominio.

Persistencia (Prisma/PostgreSQL): Gestión de datos y relaciones.

2. Modelado de Datos y Fidelidad al UML
   Tras revisar el diseño original, se han tomado decisiones críticas para alinear la base de datos con el diagrama de clases:

Relación Ask-Domain (1:N): Cada petición (Ask) se vincula a un único dominio de conocimiento. Esto simplifica la categorización y garantiza que la búsqueda sea precisa.

Especialidades (N:N): Los usuarios con roles de experto (CONNECTOR y GIVER) poseen una relación de "muchos a muchos" con la entidad Domain. Esto modela la realidad donde un experto puede dominar múltiples áreas (ej. Alimentación y Logística).

3. Seguridad y Control de Acceso Basado en Roles (RBAC)
   La API utiliza JSON Web Tokens (JWT) para una autenticación stateless. El control de acceso se divide en dos niveles:

Middleware de Rol: Restringe el acceso a rutas según el tipo de usuario (ej. solo AUTHOR crea Asks).

Validación de Propiedad (Ownership): En la capa de servicio, se verifica que un AUTHOR solo pueda modificar el estado de las peticiones que él mismo ha creado, evitando manipulaciones cruzadas entre organizaciones.

4. El Connector como Subject Matter Expert (SME)
   Alineado con el modelo AskingX, el CONNECTOR no es un administrador global, sino un experto técnico.

Visibilidad Segmentada: Un CONNECTOR solo visualiza en su panel las peticiones que pertenecen a sus dominios de especialidad.

Expert Notes: Se ha reservado el campo expertNotes en la entidad Fulfillment para que el conector aporte su criterio técnico al validar el "match" entre oferta y demanda.

5. Automatización del Ciclo de Vida (Trigger Lógico)
   Para reducir la carga administrativa y cumplir con la visión de automatización de John, se ha implementado un "trigger" en la capa de servicio:

Estado MATCHED: En el momento en que un CONNECTOR o AUTHOR registra una entrega (Fulfillment), el sistema cambia automáticamente el estado del Ask de OPEN a MATCHED.

Justificación: Esto notifica instantáneamente al trabajador social de que la conexión se ha realizado, permitiéndole pasar a la fase de monitorización.

6. Patrón "Human-in-the-Loop" y Verificación Física
   A pesar de la automatización del "match", el cierre definitivo del caso (FULFILLED) sigue siendo manual.

Decisión: Solo el AUTHOR (o el ADMIN) puede realizar el PATCH final al estado FULFILLED.

Justificación: Dado que la ayuda es física (bienes o servicios reales), el sistema no puede dar por finalizado un caso hasta que el trabajador social verifique la recepción y calidad de la ayuda. Esto garantiza la veracidad de los datos antes de generar la Story de impacto.

7. Privacidad y Visibilidad de Datos
   Se ha implementado una lógica de filtrado dinámico en getAllAsks para proteger la privacidad de los solicitantes vulnerables:

ADMIN/CONNECTOR: Acceso a búsqueda global (dentro de su especialidad) para gestionar conexiones.

AUTHOR: Vista exclusiva de los casos gestionados por su propia organización.

GIVER: Acceso limitado únicamente a su historial personal de donaciones realizadas. No tiene acceso a la "bolsa" de peticiones abiertas, ya que es considerado un agente externo a la gestión logística de la plataforma.

8. Validación Estricta con Zod
   Se utiliza Zod para garantizar que ninguna petición malformada alcance la base de datos:

Single-Table Inheritance (STI): Zod valida campos específicos según el tipo de Ask (ej. quantityRequested para bienes físicos, estimatedHours para tiempo voluntario).

Normalización de Estados: Se han corregido inconsistencias tipográficas (ej. CANCELLED con doble 'L') para garantizar la integridad referencial con los Enums de PostgreSQL.

9. Manejo de Errores y Estabilidad del Servidor
   Se ha refactorizado el middleware de errores global:

Detección de Instancias: Uso de instanceof para capturar errores específicos de Zod o JWT.

Bug Fix: Se corrigió una referencia errónea a variables de error en el authMiddleware que provocaba caídas del hilo principal ante tokens inválidos, garantizando ahora un tiempo de actividad (uptime) robusto.

10. Normalización de Trazabilidad en Fulfillments
    Se ha normalizado la entidad Fulfillment para incluir el giverId de forma atómica.

11. Validación de Multiplicidad UML (1..\*) en el Registro

Decisión: Se ha implementado una validación estricta en el registro de usuarios (User) mediante zod.superRefine.

Justificación: Para cumplir fielmente con el diagrama de clases (UML), los roles CONNECTOR y GIVER no pueden existir sin al menos un dominio asignado. El backend ahora bloquea (400 Bad Request) cualquier intento de crear estos perfiles con el array de specialties vacío.

12. Lógica de Negocio: Match vs Status Update

Decisión: Se ha creado el endpoint específico PATCH /api/asks/:id/match separado de la actualización de estado genérica.

Justificación: Un "Match" no es solo un cambio de estado; es una operación relacional. Esta función vincula atómicamente al CONNECTOR (gestor) y al GIVER (donante) con la petición, garantizando la trazabilidad exigida en el modelo AskingX.

13. Protección contra Sobredonación (Agregación en Caliente)

Decisión: La creación de un Fulfillment ahora incluye una etapa de agregación (\_sum) en la base de datos.

Justificación: Para peticiones de tipo THINGS, el sistema suma todas las entregas previas y las compara con el quantityRequested. Si una nueva entrega supera lo que falta para completar la petición, el sistema la rechaza. Esto garantiza la integridad de los recursos y evita errores logísticos.

# Registro de Decisiones Arquitectónicas (ADR) - Proyecto AskingX

## 1. Fidelidad al Modelo de Datos (UML)

Se ha realizado una reingeniería del esquema de datos para reflejar con exactitud el diagrama de clases:

- **Categorización Unívoca:** Se ha modificado la relación Ask-Domain a **1:N**. Cada petición (`Ask`) tiene un único `domainId`, eliminando la ambigüedad en la clasificación de necesidades.
- **Expertos de Dominio:** La relación entre usuarios y ámbitos de conocimiento se ha implementado mediante la propiedad `specialties` (N:N). Esto permite que tanto `CONNECTORS` como `GIVERS` definan sus áreas de pericia sin afectar a la entidad base `User`.

## 2. Automatización y Ciclo de Vida (Reglas de John)

Para cumplir con los requisitos de eficiencia del sistema, se han programado transiciones de estado automáticas:

- **Trigger de Match:** Al registrar un `Fulfillment` (entrega), el servicio dispara un cambio de estado automático a `MATCHED`.
- **Verificación Humana (HITL):** El estado final `FULFILLED` queda reservado exclusivamente para una acción manual del `AUTHOR`. Esta decisión garantiza que el sistema solo contabilice éxitos tras una verificación física real, protegiendo la veracidad de las **Stories** de impacto.

## 3. Seguridad Avanzada y Privacidad

- **Anti-Spoofing:** El backend ignora el ID de autor enviado por el cliente y utiliza el ID extraído del Token JWT para asignar la propiedad del `Ask`.
- **Privacidad por Rol:** Se ha implementado un filtrado de visibilidad en la base de datos (Query-level filtering). Un `GIVER` nunca visualiza peticiones abiertas ajenas, y un `AUTHOR` está limitado estrictamente a los datos de su organización.

## 4. Arquitectura y Manejo de Errores

- **Capa de Servicios:** Toda la lógica de roles y filtrado se ha movido de los controladores a los servicios para facilitar el testing.
- **Robustez del Servidor:** Se ha blindado el middleware de errores para capturar fallos de validación (Zod) y de autenticación (JWT) de forma segura, evitando caídas inesperadas del proceso de Node.js.

Justificación: Esto permite auditar exactamente qué donante aportó qué cantidad en peticiones que requieren múltiples entregas (ej. una petición de 50 sillas cubierta por 3 donantes distintos).

Nota sobre la Memoria y Apéndices
Capítulo de Diseño: Se detallarán los diagramas de secuencia de las automatizaciones (Fulfillment -> MATCHED).

Capítulo de Implementación: Se explicará el uso de Prisma como puente entre el UML y la base de datos.

Apéndice: Se adjuntará la especificación completa OpenAPI / Swagger para la documentación técnica de los endpoints.

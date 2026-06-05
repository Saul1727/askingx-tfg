📋 CONTEXTO MAESTRO DEL PROYECTO: "AskingValència"

1. Visión General y Arquitectura Base
   AskingValència es una plataforma web Full-Stack diseñada para el Tercer Sector, basada en el modelo de dominio "AskingX". Su objetivo es digitalizar, gestionar y emparejar necesidades de entidades vulnerables con donantes o expertos.

Stack Backend: Node.js, Express, Prisma ORM (v5), Zod (validación de esquemas).
Arquitectura Backend: Clean Architecture estricta. Separación por capas: Rutas -> Controladores (validan con Zod) -> Servicios (lógica de negocio y Prisma). El sistema cuenta con servicios en segundo plano (`cronService.js`) para tareas automáticas.

Stack Frontend: React, Vite, Tailwind CSS. Enfoque Mobile-First, uso de componentes modulares y React Portals para modales/dropdowns.

2. Modelo de Dominio (Entidades Principales)
   El modelo relacional gira en torno a las siguientes entidades clave:

- Asker (Solicitante / Entidad): ONGs, colegios o personas vulnerables. Regla de oro: El Asker NO tiene cuenta de usuario, no inicia sesión y no interactúa con el sistema. Es una entidad gestionada pasivamente por los empleados.
- Ask (Petición): El núcleo del sistema. Representa una necesidad. Tiene 4 tipos estrictos: THINGS (Cosas), TIME (Tiempo), EXPERTISE (Conocimiento), SERVICES (Servicios). Utiliza un modelo unificado en la base de datos con campos específicos según el tipo (`quantityRequested`, `estimatedHours`, `requiredSkill`, `serviceLocation`).
- Domain (Dominio Temático): Categorías temáticas para clasificar las peticiones. Los expertos del sistema tienen "especialidades" vinculadas a estos dominios.
- Fulfillment (Entrega / Resolución): Representa la ayuda aportada a un Ask. Relación de 1 a N (Un Ask puede tener múltiples Fulfillments parciales a lo largo del tiempo).
- Giver (Donante / Ayudante): Persona u organización que aporta la ayuda.
- Story (Historia): Narrativa de impacto generada por IA (1 a 1 con un Ask completado).
- AppConfig: Modelo Singleton para gestionar configuraciones globales de la instancia (logo, URL de la plataforma).

3. Matriz de Roles y Permisos (RBAC)
   El sistema intercepta los accesos mediante Middlewares según el RoleType del usuario. Los usuarios soportan preferencias de idioma (ES, CAT, EN). Si un usuario tiene isActive: false (Baja lógica / Soft-delete), se le deniega el login.

🔴 ADMIN (Administrador Global)
Permisos: Acceso total y absoluto al sistema.
Acciones Exclusivas:
Gestión de personal interno: Alta, modificación y baja lógica (isActive: false) de cualquier usuario (CU-15).
Gestión de Domains (Dominios/Categorías temáticas): Crear, activar o desactivar.
Filtro de Calidad (CU-02): Es el único que puede aprobar una petición recién creada, pasándola a estado OPEN, o cancelarla de raíz.

🔵 AUTHOR (AskAuthor / Autor de Peticiones)
Rol: Trabaja codo con codo con las ONGs (Askers) para digitalizar sus necesidades.
Permisos:
Gestión de Entidades: Crear, leer y actualizar perfiles de Asker.
Gestión de Asks (CU-01): Crear nuevas peticiones en nombre del Asker. Al crearlas, nacen obligatoriamente en estado CREATED. (No puede auto-aprobarlas).
Gestión de Expiración (CU-10): Recibe alertas de peticiones caducadas. Puede "Descartarlas" (pasan a CANCELLED) o "Republicarlas" (clona los datos y crea una nueva en estado CREATED con nueva fecha límite).
Impacto (CU-05): Generar y publicar Stories mediante IA a partir de Asks completados.

🟢 CONNECTOR (Conector / Experto)
Rol: Es el "solucionador". Busca donantes (Givers) y los empareja con las peticiones aprobadas.
Permisos:
Match (CU-03): Vincular uno o varios Givers a un Ask abierto, cambiando su estado a MATCHED.
Resolución y Entregas Parciales (CU-11): Crear registros de Fulfillment vinculando a un Giver con un Ask. (Ej: Si piden 10 ordenadores y el Giver da 4, el Connector registra el Fulfillment de 4).

🟡 GIVER (Donante)
Rol: Entidad pasiva/activa que provee los recursos. Su acceso a la plataforma es mínimo o nulo (dependiendo de la fase del proyecto), pero sus datos y notas de disponibilidad se almacenan en el sistema.

4. Máquina de Estados de la Petición (Ask) - ¡CRÍTICO!
   El ciclo de vida de un Ask es el corazón de la plataforma. Claude, no debes inventar estados. Estos son los únicos permitidos (status enum):

CREATED: Estado inicial. El AUTHOR crea la petición. Aún no es pública.
OPEN: El ADMIN aprueba la petición. Ya está visible en el tablón (Panel de Gestión) para que los Connectors trabajen en ella.
MATCHED: Un CONNECTOR ha encontrado posibles Givers y los ha vinculado, pero la ayuda material aún no se ha entregado por completo.
FULFILLED: Éxito. La petición se ha completado. Nota de lógica (CU-11): El backend suma automáticamente la cantidad entregada en los Fulfillments. Solo cuando la cantidad entregada es igual o mayor a la solicitada, el sistema transiciona el Ask a FULFILLED.
CANCELLED: Cancelada de forma manual por el Admin o el Author (requiere campo cancellationReason).
EXPIRED: Estado asignado exclusivamente por un proceso automático del sistema (Cron Job / Webhook) cuando el dueDate (fecha límite) de un Ask en estado OPEN o MATCHED ha pasado.

5. Directrices de Código a seguir por la IA
   Backend: Nunca usar .delete() en Prisma para usuarios; usar actualización de flag isActive: false. No clonar Asks para entregas parciales, aprovechar la relación 1:N de Fulfillments. Mantener controladores limpios delegando la lógica compleja (como cálculos de entregas parciales) a la capa de Servicios.
   Frontend: No usar el término "ONG" o "Kanban" en la UI. Usar "Entidades (Askers)" y "Gestión de Peticiones". Para bugs de superposición de menús, priorizar React Portals.

6. Mapa de Páginas y Componentes Frontend

   Rutas / páginas implementadas (React Router en App.jsx):
   - /login → Login.jsx (pública)
   - /dashboard → Dashboard.jsx (todos los roles autenticados)
   - /asks → Asks.jsx (AUTHOR/ADMIN: tabla de peticiones con filtros de estado)
   - /askers → Askers.jsx (AUTHOR/ADMIN: gestión de entidades/solicitantes)
   - /kanban → ConnectorKanban.jsx (CONNECTOR/ADMIN: tablón Drag&Drop con 4 columnas: NUEVAS·ABIERTA·ASIGNADA·COMPLETADA)
   - /admin/* → Páginas de administración (gestión de usuarios, dominios, configuración)

   Modales principales del área Ask:
   - CreateAskModal.jsx: polimórfico, sirve tanto para crear (AUTHOR) como editar (AUTHOR/ADMIN). Siempre requiere prop onAskCreated (callback para refrescar la lista padre).
   - ViewAskModal.jsx: solo lectura, muestra detalles + barra de progreso para THINGS/TIME.
   - ConnectorViewAskModal.jsx: versión del CONNECTOR, incluye el formulario de entrega parcial (CU-11). El payload de createFulfillment debe incluir { askId, giverId, quantityDelivered, expertNotes }.
   - RepublishAskModal.jsx: para peticiones EXPIRED. Permite republicar (nueva fecha) o descartar. La fecha viene de <input type="datetime-local"> y debe convertirse a ISO con new Date(val).toISOString() antes de enviarse al backend.

7. Contratos de API críticos

   POST /api/fulfillments → Body: { askId: UUID, giverId: UUID, quantityDelivered: Int, expertNotes: String? }
   POST /api/asks/:id/republish → Body: { newDueDate: ISO8601 string } (ej. "2026-12-31T23:59:59.000Z")
   PUT  /api/asks/:id/discard  → Body: { cancellationReason: String? }
   PATCH /api/asks/:id/match   → Body: { giverIds: UUID[] }
   PATCH /api/asks/:id/status  → Body: { status: AskStatus }

   NUNCA enviar al backend campos extra no definidos en los schemas Zod del controlador.
   El backend rechazará el datetime-local en crudo ("2026-12-31T14:00") ya que Zod z.string().datetime() requiere offset de zona horaria.

8. Servicio Cron (cronService.js)

   Fichero: backend/src/services/cronService.js
   Se inicializa en server.js al arrancar el servidor.
   Cron diario a medianoche UTC: actualiza a EXPIRED todos los Asks en estado OPEN o MATCHED cuyo dueDate < now().
   No tiene retry; errores solo se loguean por consola.

Instrucciones finales para ti:
Aquí tienes el archivo schema.prisma para que veas los tipos de datos exactos:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ==========================================
// ENUMS (Definidos estrictamente por el modelo AskingX)
// ==========================================

enum RoleType {
  ADMIN
  AUTHOR
  CONNECTOR
  GIVER
}

enum LangType {
  ES
  CAT
  EN
}

enum AskStatus {
  CREATED
  OPEN
  MATCHED
  FULFILLED
  CANCELLED
  EXPIRED
}

enum AskType {
  THINGS
  TIME
  EXPERTISE
  SERVICES
}

// ==========================================
// MODELOS DE DATOS (Basado en tool.pdf y UML)
// ==========================================

// Entidad abstracta User de la que derivan los roles
model User {
  id                String    @id @default(uuid())
  fullName          String
  avatarUrl         String?
  email             String    @unique
  passwordHash      String
  role              RoleType
  preferredLanguage LangType  @default(ES)
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Notas de disponibilidad (Específico del rol GIVER)
  availabilityNotes String?

  // --- Relaciones según los Workflows del PDF ---
  askersRegistered  Asker[]   @relation("AuthorToAsker")
  asksCreated       Ask[]     @relation("AuthorToAsk")
  asksConnected     Ask[]     @relation("ConnectorToAsk")
  asksAssigned      Ask[]     @relation("GiverToAsk")
  domainsManaged    Domain[]  @relation("AdminToDomain")
  fulfillments      Fulfillment[] @relation("FulfillmentToGiver")

  // Especialidades de los expertos (Connector y Giver)
  specialties       Domain[]  @relation("UserSpecialties")
}

// Solicitante (No interactúa, es gestionado por AskAuthor)
model Asker {
  id               String    @id @default(uuid())
  organizationName String?
  contactPerson    String
  phone            String?
  email            String
  address          String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relaciones
  askAuthorId      String
  askAuthor        User      @relation("AuthorToAsker", fields: [askAuthorId], references: [id])

  asks             Ask[]     @relation("AskerToAsk") // 1 Asker puede tener múltiples peticiones a lo largo del tiempo
}

// Dominios temáticos para clasificar las peticiones
model Domain {
  id          String  @id @default(uuid())
  name        String  @unique
  description String?
  isActive    Boolean @default(true)

  // Relaciones
  adminId     String?
  admin       User?   @relation("AdminToDomain", fields: [adminId], references: [id])

  // Relación 1 a N. Una petición solo pertenece a un dominio.
  asks        Ask[]   @relation("AskToDomain")

  // Expertos (Connectors y Givers) asignados a este dominio
  specialists User[]  @relation("UserSpecialties")
}

// Entidad Central: La Petición (Ask)
model Ask {
  id                 String    @id @default(uuid())
  title              String
  description        String
  status             AskStatus @default(CREATED)
  type               AskType
  dueDate            DateTime?
  cancellationReason String?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  // -- Especialización (Herencia de Tabla Única) --
  quantityRequested  Int?      // Para tipo THINGS
  estimatedHours     Int?      // Para tipo TIME
  requiredSkill      String?   // Para tipo EXPERTISE
  serviceLocation    String?   // Para tipo SERVICES

  // -- Relaciones --
  askerId            String
  asker              Asker     @relation("AskerToAsk", fields: [askerId], references: [id])

  askAuthorId        String
  askAuthor          User      @relation("AuthorToAsk", fields: [askAuthorId], references: [id])

  connectorId        String?
  connector          User?     @relation("ConnectorToAsk", fields: [connectorId], references: [id])

  givers             User[]    @relation("GiverToAsk") // Múltiples Givers por petición

  // Referencia a un único Dominio
  domainId           String
  domain             Domain    @relation("AskToDomain", fields: [domainId], references: [id])

  // RELACIÓN 0 a N: Al crearse está vacío, permite múltiples entregas progresivas
  fulfillments       Fulfillment[]

  story              Story?
}

// Entregas / Cumplimiento (Fulfillment)
model Fulfillment {
  id                String   @id @default(uuid())
  deliveryDate      DateTime @default(now())
  quantityDelivered Int?
  expertNotes       String?
  createdAt         DateTime @default(now())

  // Relaciones
  askId             String
  ask               Ask      @relation(fields: [askId], references: [id])

  // Trazabilidad atómica del donante
  giverId           String
  giver             User     @relation("FulfillmentToGiver", fields: [giverId], references: [id])
}

// Historias de Impacto (Story)
model Story {
  id               String   @id @default(uuid())
  generatedContent String
  isPublished      Boolean  @default(false)
  generatedAt      DateTime @default(now())

  // Relaciones
  askId            String   @unique
  ask              Ask      @relation(fields: [askId], references: [id])
}

// Configuración Global de la Aplicación
model AppConfig {
  id               String   @id @default("global")
  installationName String   @default("AskingX")
  platformUrl      String   @default("http://localhost:5173")
  logoUrl          String   @default("/favicon.svg")
  updatedAt        DateTime @updatedAt
}
```

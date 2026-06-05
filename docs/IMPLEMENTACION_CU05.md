# Implementación CU-05: Generación de Historia de Éxito con IA

> Documento técnico de la implementación del caso de uso CU-05 en la plataforma
> **AskingValència**. Pensado para incorporarse a la memoria del TFG.

---

## 1. Objetivo del caso de uso

Permitir que un **AskAuthor** o un **Administrador** generen, a partir de una petición
ya **completada (FULFILLED)**, una breve **publicación de impacto** redactada por una IA,
que resuma cómo se resolvió la necesidad. El usuario puede revisar y editar el texto antes
de **publicarlo**. Las historias publicadas son visibles para los usuarios que participaron
en la ayuda; el administrador ve todas.

---

## 2. Modelo de datos

El modelo `Story` ya existía en `schema.prisma` y se ha respetado tal cual:

```prisma
model Story {
  id               String   @id @default(uuid())
  generatedContent String       // texto de la publicación
  isPublished      Boolean  @default(false)  // borrador vs publicada
  generatedAt      DateTime @default(now())
  askId            String   @unique           // relación 1:1 con Ask
  ask              Ask      @relation(fields: [askId], references: [id])
}
```

**Decisión de diseño:** el enunciado del CU menciona asociar la Story al *Fulfillment*,
pero el modelo del dominio la asocia al **Ask** (relación 1:1, `askId @unique`). Se ha
mantenido la relación con `Ask` porque una petición completada ya contiene toda la
información necesaria (entidad, donantes y entregas), y porque romper el esquema habría
introducido complejidad innecesaria. Cada petición tiene como máximo **una** historia.

---

## 3. Arquitectura de la solución

Se ha seguido la **Clean Architecture** del proyecto (Rutas → Controlador con Zod →
Servicio → Prisma) y se ha aislado la parte de IA en su propio módulo.

### 3.1 Backend (`backend/src/`)

| Archivo | Responsabilidad |
|---|---|
| `services/aiService.js` | **Único punto** que habla con la IA. Construye el *prompt* y llama a Gemini; si no hay API key, usa una plantilla local. |
| `services/storyService.js` | Lógica de negocio: validar precondiciones, compilar datos, generar (upsert), listar por rol, editar/publicar. |
| `controllers/storyController.js` | Validación de entrada con Zod y traducción a respuestas HTTP. |
| `routes/storyRoutes.js` | Definición de endpoints y control de roles. |
| `app.js` | Registro de `/api/stories`. |
| `services/askService.js` | Se añadió `story` al `include` de `getAllAsks` para que el frontend sepa si una petición ya tiene historia. |

### 3.2 Frontend (`frontend/src/`)

| Archivo | Responsabilidad |
|---|---|
| `services/storyService.js` | Llamadas a la API de historias. |
| `components/stories/StoryModal.jsx` | **Modal central**: carga, genera, edita y publica. Lo usan todos los puntos de entrada. |
| `pages/Stories.jsx` | Página `/stories`: lista filtrada por rol + peticiones pendientes de historia. |
| `pages/Asks.jsx` | Botón ✨ en las filas de peticiones COMPLETADAS. |
| `pages/ConnectorKanban.jsx` + `components/asks/ConnectorViewAskModal.jsx` | Botón "Generar/Ver Historia" en el detalle de una petición completada (solo ADMIN). |
| `App.jsx` | Ruta `/stories` apuntando a la página real. |

---

## 4. Endpoints de la API

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `POST` | `/api/stories/generate/:askId` | AUTHOR, ADMIN | Genera o **regenera** la historia (upsert). |
| `GET` | `/api/stories` | Cualquiera autenticado | Lista historias **filtradas por rol** en el servicio. |
| `GET` | `/api/stories/by-ask/:askId` | Autenticado (con permiso) | Devuelve la historia de una petición concreta. |
| `PATCH`| `/api/stories/:id` | AUTHOR, ADMIN | Edita el texto y/o publica/despublica. |

---

## 5. Decisiones clave

### 5.1 Proveedor de IA y control de coste (lo más importante)
- Se eligió **Google Gemini 1.5 Flash** por tener una **capa gratuita real** (API key gratis
  en Google AI Studio, sin tarjeta), frente a OpenAI/Claude que son de pago por uso.
- *Aclaración relevante:* la suscripción mensual de Claude.ai **no** habilita el acceso a la
  API (se factura aparte), por lo que no era una opción válida sin coste.
- **Patrón "IA con fallback":** si no hay `GEMINI_API_KEY` en el `.env`, el sistema genera la
  historia con una **plantilla local** (coste 0). Esto permite que la funcionalidad sea
  100% demostrable en la defensa sin gastar tokens, y que al añadir la clave pase a usar IA
  real sin tocar código. Además, si la llamada a Gemini falla, se cae automáticamente al
  fallback en lugar de romper la operación.

### 5.2 Aislamiento del proveedor
Toda la integración vive en `aiService.js`. El resto de la aplicación llama a
`generateStoryText(datos)` sin conocer el proveedor. Cambiar a OpenAI o Claude en el futuro
solo afecta a ese archivo.

### 5.3 Generación como *upsert*
`generateStory` hace **upsert** por `askId`: si la historia no existe la crea como borrador;
si existe, "Regenerar" solo reemplaza el texto y conserva el estado de publicación. Así se
respeta la restricción 1:1 sin lógica condicional enrevesada.

### 5.4 Visibilidad por rol (CU-05)
Implementada en `storyService.getStories` mediante el filtro `where` de Prisma:

| Rol | Qué ve |
|---|---|
| **ADMIN** | Todas las historias. |
| **AUTHOR** | Las de sus peticiones (borradores y publicadas). |
| **CONNECTOR** | Solo **publicadas** de peticiones que él gestionó. |
| **GIVER** | Solo **publicadas** de peticiones en las que registró una entrega. |

Decisión: los participantes (connector/giver) ven únicamente historias **publicadas**, porque
el borrador es trabajo en curso del autor; el autor ve también sus borradores por ser quien
las gestiona.

### 5.5 "Publicar" = interno
Para ajustarse al alcance del TFG, publicar significa marcar `isPublished = true` y mostrar
una etiqueta **"Publicada"** en la lista de Historias. No se ha creado una página pública
anónima (quedaría como trabajo futuro).

### 5.6 Un único modal reutilizado
`StoryModal` centraliza **todo** el ciclo (cargar, generar, editar, publicar). Los tres
puntos de entrada (tabla de Peticiones, Kanban y página Historias) solo tienen que abrirlo
pasándole la petición. Esto mantiene los componentes que lo invocan muy simples y evita
duplicar lógica (principio DRY).

---

## 6. Flujo completo (end-to-end)

1. El AskAuthor/Admin localiza una petición **COMPLETADA** (en `/asks`, en el Kanban o en
   `/stories` → "Pendientes de historia").
2. Pulsa **Generar historia** → se abre el `StoryModal`.
3. El frontend llama a `POST /api/stories/generate/:askId`.
4. El backend valida (FULFILLED + tiene entregas + permisos), **compila** los datos del Ask,
   Asker, Givers y Fulfillments y se los pasa al `aiService`.
5. El `aiService` construye el prompt y llama a **Gemini** (o usa la plantilla si no hay key).
6. Se crea/actualiza la `Story` como **borrador** y se devuelve al frontend.
7. El usuario **revisa y edita** el texto y pulsa **Guardar borrador** o **Publicar**.
8. La historia aparece en `/stories`; los participantes verán las publicadas.

---

## 7. Configuración necesaria

En `backend/.env`:

```env
# Opcional. Si se deja vacío, se usa la plantilla local (coste 0).
GEMINI_API_KEY=
```

Para usar IA real: obtener una clave gratuita en
<https://aistudio.google.com/apikey> y pegarla en esa variable. Requiere **Node 18+**
(se usa `fetch` nativo, sin librerías extra).

---

## 8. Pruebas recomendadas

1. **Sin API key** → generar una historia: debe crearse con la plantilla local (en consola
   aparece `ℹ️ [IA] Sin GEMINI_API_KEY...`).
2. **Con API key** → generar: el texto debe ser claramente redactado por IA.
3. **Precondición** → intentar generar sobre una petición no completada: error 400.
4. **Permisos** → un AUTHOR no puede generar la historia de una petición de otro autor (403).
5. **Editar y publicar** → cambiar el texto, publicar, recargar: persiste con badge "Publicada".
6. **Visibilidad** → entrar como GIVER que participó: ve la historia solo si está publicada.

---

## 9. Posibles mejoras futuras

- Página pública (sin login) con las historias publicadas para difusión real.
- Permitir elegir tono/idioma del texto antes de generar.
- Registrar métricas de uso de la IA (tokens, coste) para el panel de administración.

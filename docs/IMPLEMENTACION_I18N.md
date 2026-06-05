# Implementación de Internacionalización (i18n): ES / CAT / EN

> Documento técnico de la implementación del multidioma en **AskingValència**.
> Pensado para incorporarse a la memoria del TFG.

---

## 1. Objetivo

Permitir que **toda la interfaz** se muestre en tres idiomas — Español (ES),
Català (CAT) e English (EN) — y que el usuario cambie de idioma desde dos sitios:

- **Selector de la barra superior (Topbar):** cambio inmediato, **pidiendo confirmación**.
- **"Mi Perfil" → Idioma Preferido:** se aplica al pulsar **Guardar Perfil**.

El idioma elegido se **guarda en el perfil del usuario** (campo `preferredLanguage`
en BD) y se recuerda entre sesiones.

---

## 2. Enfoque elegido: diccionarios (i18n clásico)

Se descartó la traducción automática en tiempo real (tipo Google Translate con IA)
y se optó por el **patrón estándar de la industria**: diccionarios de traducción +
función `t('clave')`. Motivos:

- **Calidad y control:** las traducciones son fijas y revisadas, no dependen de una IA.
- **Sin coste ni latencia:** no consume API ni añade retardos.
- **Defendible y mantenible:** es el patrón que usan librerías como `react-i18next`;
  aquí se ha implementado de forma ligera y sin dependencias externas para que el
  código sea fácil de entender.

**Alcance:** se traducen los textos **fijos de la interfaz** (botones, menús, títulos,
etiquetas, mensajes). NO se traducen los **datos introducidos por el usuario** (títulos
de peticiones, nombres de ONG, etc.), que se conservan en el idioma en que se escribieron.

---

## 3. Arquitectura (3 piezas)

Todo vive en el frontend y sigue el mismo patrón que el `ConfigContext` ya existente.

| Archivo | Responsabilidad |
|---|---|
| `src/i18n/translations.js` | **Diccionario único** con un objeto por idioma (`ES`, `CAT`, `EN`) y las mismas claves en los tres. Agrupadas por pantalla: `common`, `sidebar`, `asks`, `kanban`, `admin`... |
| `src/context/LanguageContext.jsx` | Provider de React que guarda el idioma activo y expone `{ lang, setLang, t }`. |
| `src/main.jsx` | Monta `<LanguageProvider>` envolviendo toda la app. |

### Cómo funciona `t()`

```js
t('asks.title')   // -> "Peticiones de Ayuda" (ES) / "Peticions d'Ajuda" (CAT) / "Help Requests" (EN)
```

`t(clave)` busca la clave en el idioma activo. Si falta, cae al **español** y, si
tampoco existe, devuelve la **propia clave** (así un olvido se detecta a simple vista).

### Idioma inicial y persistencia

El idioma se decide en este orden:
1. `localStorage` (`appLanguage`) — recuerda la última elección entre recargas.
2. `preferredLanguage` del usuario logueado.
3. Español por defecto.

`setLang()` actualiza el estado **y** `localStorage`. Cuando el cambio viene del perfil
o de la barra, además se persiste en BD vía `PATCH /api/users/profile`.

---

## 4. Los dos disparadores

### a) Barra superior (`Topbar.jsx`) — con confirmación
Al pulsar ES/CAT/EN: `window.confirm(t('confirmLanguage'))`. Si acepta:
`setLang(code)` + guardado en perfil (BD + localStorage).

### b) Mi Perfil (`ProfileModal.jsx`) — al guardar
El `<select>` de idioma forma parte del formulario. Al pulsar **Guardar Perfil**, tras
persistir en BD se llama a `setLang(profileData.preferredLanguage)` para aplicar el
cambio a toda la interfaz.

### c) Login (`Login.jsx`)
El selector del login cambia el idioma directamente (aún no hay sesión). Además, **tras
iniciar sesión** se aplica el `preferredLanguage` del usuario para que entre directamente
en su idioma.

---

## 5. Patrón aplicado en cada componente

En cada componente que muestra texto:

```jsx
import { useLanguage } from '../context/LanguageContext';

const MiComponente = () => {
  const { t } = useLanguage();
  return <h1>{t('asks.title')}</h1>;
};
```

Los textos con un dato dinámico usan un marcador `{x}` y `replace`:

```js
window.prompt(t('asks.cancelPrompt').replace('{title}', ask.title));
```

### Cobertura

Se ha aplicado a **toda la interfaz**: navegación (Sidebar, Topbar), Login, los tres
Dashboards (con etiquetas de los gráficos), Peticiones y sus modales (crear/editar, ver,
panel del Connector, republicar), Entidades (Askers), Tablero Kanban, Historias de
Impacto y su modal, y todo el panel de Administración (usuarios, dominios, configuración
global, crear usuario, cambiar/reactivar contraseña).

---

## 6. Cómo añadir un idioma o un texto nuevo

- **Texto nuevo:** añade la clave en los **tres** idiomas dentro de `translations.js` y
  úsala con `t('seccion.clave')` en el componente.
- **Idioma nuevo (p. ej. francés):** añade un objeto `FR: { ... }` en `translations.js`
  con las mismas claves, añade `'FR'` al enum del backend (`preferredLanguage`) y a los
  selectores de idioma. No hace falta tocar nada más.

---

## 7. Pruebas recomendadas

1. **Topbar:** pulsar CAT → aparece confirmación → toda la UI cambia a català.
2. **Persistencia:** recargar la página → sigue en el idioma elegido.
3. **Perfil:** cambiar a English y Guardar → la interfaz pasa a inglés; al reabrir "Mi
   Perfil" el selector marca English.
4. **BD:** entrar como ADMIN → la tabla de usuarios muestra el idioma guardado de cada uno.
5. **Login:** cambiar idioma antes de entrar; tras login, se respeta el idioma del usuario.
6. **Fallback:** si una clave faltara, se mostraría en español (nunca en blanco).

---

## 8. Decisiones y limitaciones

- **Solo UI, no datos de usuario:** coherente con cualquier i18n profesional; traducir el
  contenido creado por los usuarios requeriría un servicio de traducción y queda como
  trabajo futuro.
- **Sin librería externa:** implementación propia y ligera (un contexto + un diccionario)
  para máxima claridad didáctica. Si el proyecto creciera, migrar a `react-i18next` sería
  directo porque la estructura de claves ya es compatible.
- **Códigos de idioma:** se usan `ES`, `CAT`, `EN` para que coincidan con el enum
  `LangType` del modelo de datos y evitar conversiones.

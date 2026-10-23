# Componentes

Guía corta de cómo está organizada `src/components/` y cómo se usan los componentes de `ui/`.

## Estructura

```
components/
├── ui/         genérico: no sabe nada del negocio
├── layout/     esqueleto de la app: app-layout, header, sidebar
├── guards/     protección de rutas: protected-route, role-guard
└── features/   piezas con conocimiento del dominio
    ├── address/  app/  auth/  booking/  prm/  user/
```

### Reglas

1. **Convención de nombres:** `grupo / carpeta-en-kebab-case / Componente.tsx`
   (`ui/date-input/DateInput.tsx`). El CSS y el test viven junto al componente.
2. **Dónde va un componente nuevo.** Pregúntate: *¿funcionaría en otro proyecto sin cambios?*
   Si sí → `ui/`. Si necesita datos o reglas de Salvida (PRM, usuarios, reservas…) → `features/<dominio>/`.
3. **`ui/` nunca importa de `features/`, `layout/`, `guards/`, `pages/`, `hooks/` ni `store/`.**
   Es la regla que mantiene `ui/` reutilizable. Una feature sí puede (y debe) componerse sobre `ui/`.
4. **Imports:** relativos para rutas cortas; si habría que subir 3 o más niveles, usa el alias `@/`
   (`@/store/useUIStore`).
5. **Barrels:** todos los componentes de `ui/` exponen un `index.ts` (`import { Input } from '@/components/ui/input'`).

## Catálogo de `ui/`

| Componente | Para qué | Props que importan |
|---|---|---|
| `Input` / `PasswordInput` | Campos de texto. `Input` elige por `type`: `type="password"` devuelve `PasswordInput` | `variant` (`outlined` · `filled` · `filled-bordered` · `compact`), `size` (`lg` · `md` · `sm` · `xs`), `status="error"` |
| `Select` | `<select>` nativo con el aspecto de `Input` | las mismas `variant` / `size` / `status` |
| `FormField` | Etiqueta + campo + error, con la accesibilidad cableada | `label`, `htmlFor`, `required`, `error`, `variant` (`default` · `small` · `eyebrow`) |
| `Button` | Acciones | `variant` (`primary` · `secondary` · `ghost` · `outline` · `dashed` · `danger` · `link` · `soft`), `tone` (solo `soft`/`outline`), `size`, `fullWidth`, `loading`, `icon`, `to` |
| `IconButton` | Botón de solo icono | **`label` obligatorio**, `tone` (`neutral` · `primary` · `danger`), `size`, `to` |
| `CreateButton` | Acciones "añadir/nuevo" que colapsan a `+` en móvil | `display` (`responsive` · `full` · `icon`), `variant` (`solid` · `dashed`) |
| `Badge` | Etiqueta de estado o categoría | `tone` (`success` · `warning` · `danger` · `info` · `neutral` · `primary`), `size`, `icon`, `bordered` |
| `Skeleton` | Marcador de carga con brillo. Decorativo (`aria-hidden`) | `width`, `height`, `radius` (número = px). Tokens `--skeleton-base` `--skeleton-highlight` `--skeleton-radius` `--skeleton-duration` |
| `Switch` | Interruptor `role="switch"` | **`label` obligatorio**, `checked`, `onChange(next: boolean)` |
| `Modal` | Diálogo modal (`<dialog>` nativo) | `open`, `onCancel`, `title`, `footer`, `size`, `closable`, `maskClosable`, `keyboard`, `role`, `styles` |
| `FilterTabs` | Filtro de una sola opción en píldoras | `options`, `value`, `onChange` |
| `ListToolbar` | Buscador + botón de crear + fila de filtros | `search`, `create`, `filters` |

`Autocomplete`, `MultiSelect` y `DropdownMenu` siguen con sus estilos propios (son *comboboxes* con
desplegable, no campos simples).

## Cómo personalizar un componente

Hay tres capas. Usa la primera que alcance:

1. **Props tipadas** (`variant`, `size`, `tone`, `status`): para todo lo que se repite.
2. **`className`**: para lo específico de una pantalla. Conserva `:hover`, `:focus` y *media queries*.
   Si tu regla debe ganar al componente, súbele la especificidad (`.btn.mi-clase`) en lugar de usar `!important`.
3. **Tokens CSS**: define una variable en un contenedor y todo lo que haya dentro cambia, sin tocar el componente.

```css
/* Una pantalla re-tematiza sus inputs, botones y etiquetas en un solo sitio */
.mi-pantalla {
  --input-border-color: var(--lp-outline-variant);
  --input-focus-color: var(--lp-primary);
  --btn-primary-bg: linear-gradient(135deg, var(--lp-primary), var(--lp-primary-container));
  --field-label-color: var(--lp-on-surface);
}
```

| Componente | Tokens |
|---|---|
| `Input` / `Select` | `--input-border-color` `--input-focus-color` `--input-focus-ring` `--input-text-color` `--input-placeholder-color` `--input-bg` `--input-font-family` `--input-error-color` |
| `PasswordInput` | `--input-toggle-color` `--input-toggle-hover-color` |
| `FormField` | `--field-label-color` `--field-label-letter-spacing` `--field-error-color` |
| `Button` | `--btn-primary-bg` `--btn-primary-color` `--btn-radius` `--btn-font-weight` `--btn-font-family` `--btn-shadow` |
| `IconButton` | `--icon-btn-color` |
| `Modal` | `--modal-backdrop` `--modal-backdrop-filter` `--modal-gutter` `--modal-width` `--modal-radius` `--modal-shadow` `--modal-bg` |
| `Badge` | `--badge-bg` `--badge-color` |

**Colores por significado.** `index.css` define un par `--tone-<success|warning|danger|info|neutral|primary>-bg/-color`.
`Badge` y `Button` (`soft`, `outline`) leen de ahí, así que "success" se ve igual en cualquier sitio.
Para un tono nuevo, se añade una sola vez en `index.css`.

## Convenciones de la API

- **`label` obligatorio** en `IconButton` y `Switch`: no tienen texto visible y el nombre accesible no es opcional.
- **`type="button"` por defecto** en `Button` e `IconButton`: nada envía un formulario por accidente. Para enviar, `type="submit"`.
- **`status="error"`** en campos; marca `aria-invalid`. Dentro de un `FormField` se cablea solo.
- **`FormField` con render-prop** para enlazar `id`, `aria-describedby` y `aria-required`:
  ```tsx
  <FormField label="Email" required error={errors.email}>
    {(field) => <Input {...field} type="email" value={email} onChange={...} />}
  </FormField>
  ```
  Si el control no es de `ui/` (por ejemplo un `DateInput`), pásalo como hijo normal y usa `htmlFor`.
- **Los callbacks reciben el valor, no el evento** en `Switch` (`onChange(next)`) y `ListToolbar` (`search.onChange(texto)`).

## Modal y la migración a antd

`Modal` usa `<dialog>` por dentro (foco atrapado, Escape y capa superior los da el navegador) pero su API
**copia la de antd** a propósito: `open`, `onCancel`, `title`, `footer`, `maskClosable`, `keyboard`, `closable` y
`styles={{ mask, content, header, body, footer }}`. Si algún día se adopta antd, el cambio queda dentro de
`Modal.tsx` y los consumidores no se tocan. Mismo criterio al diseñar los demás componentes: ningún consumidor
debe depender de las clases internas, solo de props, `className` y tokens.

El contenido se desmonta mientras está cerrado, así que el estado de un formulario se reinicia en cada apertura.

## Tests

- `npm test` ejecuta Vitest + Testing Library (entorno `jsdom`).
- Cada componente de `ui/` tiene su `*.spec.tsx` al lado. Prueba el contrato (clases por variante, accesibilidad,
  callbacks), no los píxeles.
- `src/test/setup.ts` simula `showModal()`/`close()` de `<dialog>`, que jsdom no implementa.
- Los tests no ven el CSS (`css: false`): el aspecto sigue necesitando revisión visual.

## Añadir o cambiar algo

- **Nueva variante:** añádela al tipo (`InputVariant`, `ButtonVariant`…), al CSS y a la lista del test `it.each`.
- **Nuevo componente de `ui/`:** carpeta en kebab-case, `Componente.tsx` + `.css` + `.spec.tsx` + `index.ts`.
  Primero busca si el patrón ya existe en otro sitio: la mayoría de "componentes nuevos" son una variante o un tono.
- **Antes de borrar CSS "huérfano"**, busca la clase en todo `src` y en las reglas de ajuste de otras pantallas
  (por ejemplo `.contenedor .btn`).

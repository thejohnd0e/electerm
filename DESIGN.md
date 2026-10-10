# electerm Design System

## 1. Atmosphere & Identity

electerm is a compact terminal command center. The UI stays quiet so terminal output and connection state remain primary; utility panels use the same dark theme and small, precise controls. For AI subscription modes, the selected provider must be identifiable at a glance without changing the established panel styling.

## 2. Color

### Palette

| Role | Token | Value | Usage |
|---|---|---|---|
| Surface / main | `--main` | `#141314` | Main panels and modal surfaces |
| Surface / dark | `--main-dark` | `#000000` | Deep backgrounds |
| Surface / light | `--main-light` | `#2E3338` | Raised or contrasted surfaces |
| Surface / darker | `--main-darker` | `#0E0D0E` | Separators and recessed areas |
| Surface / lighter | `--main-lighter` | `#5B5A5B` | Lighter surface accents |
| Text / primary | `--text` | `#DDDDDD` | Main content |
| Text / light | `--text-light` | `#FFFFFF` | Emphasized content |
| Text / muted | `--text-dark` | `#888888` | Supporting content and hints |
| Text / disabled | `--text-disabled` | `#777777` | Disabled controls |
| Accent / primary | `--primary` | `#0088CC` | Primary actions, links, focus and selection |
| Status / info | `--info` | `#FFD166` | Informational notices |
| Status / success | `--success` | `#06D6A0` | Connected and successful states |
| Status / error | `--error` | `#EF476F` | Errors and destructive actions |
| Status / warning | `--warn` | `#E55934` | Cautions and experimental features |

Theme variables may be overridden by the user's selected theme; components should reference variables rather than duplicate the palette.

## 3. Typography

### Scale

| Role | Existing size / weight | Usage |
|---|---|---|
| Panel title | 16px / 600 | Modal and panel headings |
| Body | 12px / regular | Compact app chrome and terminal UI |
| Form labels and controls | Ant Design defaults | Settings forms |
| Supporting text | 12–13px | Hints, metadata, history details |
| Terminal | User-configured mono font; default `Maple Mono` | Terminal output and code |

### Font Stack

- UI: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`
- Terminal: `Maple Mono, mono, courier-new, courier, monospace` by default; user-configurable.

## 4. Spacing & Layout

The app uses compact utility spacing. Shared `.pd*` / `.mg*` helpers expose 5px, 16px, and 32px steps; AI-panel styles also use small 4–10px gaps where the existing form rhythm requires them.

| Pattern | Existing rule | Usage |
|---|---|---|
| Panel gutter | 10px | Right-panel content |
| Modal content | 24px horizontal / 24px bottom | Custom modal body |
| Inline controls | 4–8px | AI toolbar and account actions |
| Form sections | Ant Design vertical layout | AI configuration |

Right-side panels are resizable app-shell regions. Their content owns vertical scrolling; the surrounding terminal remains visible when the panel is unpinned.

## 5. Components

### Right panel header
- **Structure**: provider/title text with panel controls, followed by the panel content.
- **Variants**: AI, command history, quick commands, and other panel types.
- **States**: default, pinned, active panel.
- **Accessibility**: preserve keyboard access and visible focus for controls.
- **Motion**: existing short panel transition; do not add decorative movement.

### AI configuration form
- **Structure**: provider selector, optional provider account state, model and role fields, then save/test actions.
- **Variants**: API, ChatGPT subscription, experimental SuperGrok subscription.
- **States**: default, loading, connected, missing permission, unsupported platform, error.
- **Accessibility**: retain Ant Design labels, required-field messages, keyboard navigation, and focus behavior.
- **Layout**: vertical form inside the existing scrollable modal.

### AI provider status
- **Structure**: inline status alert plus provider actions.
- **Variants**: ChatGPT connected/disconnected; SuperGrok connected/disconnected/experimental; unsupported platform.
- **States**: loading, success, warning, error, pending device-code authorization.
- **Accessibility**: status is visible text, not color alone; device code remains selectable/copyable.

### AI response provider badge
- **Structure**: small Ant Design tag above a response, with provider label and model.
- **Variants**: API provider, ChatGPT subscription, SuperGrok subscription.
- **States**: present when an answer exists; provider label comes from the request's saved `providerAI` snapshot.
- **Accessibility**: provider and model remain readable text; links use the existing external-link component.

## 6. Motion & Interaction

- Existing control transitions are short, generally 200ms.
- Loading indicators are reserved for real asynchronous work.
- Connected state is represented by visible status text and the existing semantic success color.
- Respect the existing reduced-motion behavior; this change introduces no new animation.

## 7. Depth & Surface

The app uses a dark tonal surface system with subtle separators (`--main-darker`) and restrained modal elevation. Keep existing Ant Design/modal shadows and panel borders; do not add extra containers or new surface treatments for provider labels.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- Preserve keyboard navigation and visible focus for provider selection, account actions, and form controls.
- Connected, denied, unsupported, and error states must include text in addition to color.
- Keep existing theme contrast and responsive modal scrolling behavior.

### Accepted Debt

| Item | Location | Why accepted | Exit |
|---|---|---|---|
| Full app-wide token extraction is incomplete | Existing Stylus styles outside the AI/right-panel surface | This targeted follow-up preserves current patterns and only documents the system needed for the affected surface | Extend when broader design-system work is requested |

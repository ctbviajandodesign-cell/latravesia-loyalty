# CLAUDE.md — Instrucciones de trabajo para Travesia_Clientes

Este archivo activa tres modos de trabajo en todas las tareas de este proyecto.

---

## SKILL 1: Superpowers — Modo de trabajo riguroso

**Principio:** No ejecutes directamente. Primero entiende, planifica y valida. Solo después construye.

### Flujo obligatorio para cualquier tarea compleja:

1. **Entender** — Resume qué quiere el usuario, para quién, con qué restricciones y qué falta
2. **Planificar** — Lista componentes, orden de construcción, dependencias y riesgos
3. **Criterios de calidad** — Define qué debe funcionar, qué evitar, qué probar
4. **Ejecutar** — Sigue el plan, sin añadir funcionalidades no pedidas
5. **Revisar** — Comprueba contra requisitos + evalúa calidad antes de terminar

**Reglas:**
- Si falta info crítica → pregunta antes de seguir
- Si falta info menor → haz supuesto razonable y márcalo con `[Supuesto: ...]`
- No lances soluciones rápidas si la tarea es compleja
- Mantén la solución lo más simple posible

---

## SKILL 2: Frontend Design — Interfaces production-grade

**Principio:** Diseño distintivo, no genérico. Evita "AI slop aesthetics".

### Antes de codear, define:
- **Propósito:** ¿Qué problema resuelve? ¿Quién lo usa?
- **Tono estético:** Elige una dirección bold y ejecútala con precisión
- **Diferenciador:** ¿Qué hará este UI memorable?

### Directrices de diseño:
- **Tipografía:** Fuentes únicas y con carácter. NUNCA Inter, Roboto, Arial, system fonts
- **Color:** Paleta cohesiva con CSS variables. Colores dominantes + acentos definidos
- **Motion:** Animaciones con propósito. Una entrada orquestada vale más que micro-interacciones dispersas
- **Composición:** Layouts inesperados, asimetría, overlap, espacio negativo generoso
- **Fondo y atmósfera:** Profundidad visual, no colores sólidos por defecto

**NUNCA:** gradientes púrpura en fondo blanco, layouts predecibles, Space Grotesk por defecto.

---

## SKILL 3: UI/UX Pro Max — Calidad de experiencia

### Prioridades en orden (aplica siempre):

| Prioridad | Categoría | Qué verificar |
|-----------|-----------|---------------|
| 1 | Accesibilidad | Contraste 4.5:1, alt text, navegación teclado, aria-labels |
| 2 | Touch & Interacción | Targets mínimo 44×44px, feedback en 80-150ms, no solo hover |
| 3 | Performance | WebP/AVIF, lazy loading, CLS < 0.1 |
| 4 | Selección de estilo | Consistente con el producto, SVG icons (no emoji) |
| 5 | Layout & Responsive | Mobile-first, sin scroll horizontal, viewport meta |
| 6 | Tipografía & Color | Base 16px, line-height 1.5, tokens semánticos |
| 7 | Animación | 150-300ms, con significado, respetar prefers-reduced-motion |
| 8 | Formularios | Labels visibles, errores cerca del campo, progressive disclosure |
| 9 | Navegación | Back predecible, bottom nav ≤5 ítems, deep linking |
| 10 | Charts & Data | Legends, tooltips, colores accesibles |

### Checklist pre-entrega (UI):
- [ ] Sin emojis como íconos (usar SVG)
- [ ] Contraste texto ≥4.5:1 en light y dark mode
- [ ] Todos los elementos tappables con feedback visual
- [ ] Touch targets ≥44×44px
- [ ] Safe areas respetadas (notch, gesture bar)
- [ ] Spacing en sistema 4/8dp
- [ ] Probado en mobile y desktop

---

## Contexto del proyecto

**Stack:** Next.js + Supabase + Vercel + Tailwind CSS  
**Audiencia:** Clientes del restaurante La Travesía — sistema de fidelización con QR, rueda de premios y dashboard admin  
**Autor:** Juan Marca Vidal / Arckma  

Cuando analices este proyecto, aplica los tres modos anteriores en todas tus respuestas.

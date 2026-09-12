# UI/UX Design Brief
## RoadSafe AI — Visual & Interaction Design Specification
**Version:** 1.0 | **Date:** September 2026

---

## 1. Design Philosophy

**Guiding Principle:** *"This is a decision engine, not a dashboard toy."*

The design must feel like a **real enterprise GIS/analytics command center** — think Palantir Foundry, Bloomberg Terminal, Mapbox Studio. It should NOT look like a typical hackathon project or an AI-generated demo.

### Design DNA
| Principle | What It Means |
|-----------|---------------|
| **Authority** | The design should feel like a government intelligence tool that saves lives |
| **Clarity** | Every pixel serves a purpose — no decorative elements |
| **Density** | Information-dense but not cluttered — analyst-grade layouts |
| **Restraint** | No flashy animations, no gradient text, no purple AI glow |
| **Trust** | Data sources cited, model confidence shown, professional typography |

---

## 2. Color Palette

### Primary Background System (Dark Command Center)
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0A0E17` | Main app background (near-black navy) |
| `--bg-secondary` | `#111827` | Card/panel backgrounds |
| `--bg-tertiary` | `#1F2937` | Hover states, elevated surfaces |
| `--bg-surface` | `#1A1F2E` | Sidebar, inspector panel bg |
| `--bg-overlay` | `rgba(0, 0, 0, 0.7)` | Modal backdrop |

### Text Hierarchy
| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#F9FAFB` | Headlines, primary content |
| `--text-secondary` | `#9CA3AF` | Labels, descriptions |
| `--text-muted` | `#6B7280` | Captions, timestamps |
| `--text-accent` | `#60A5FA` | Links, interactive elements |

### Risk Tier Colors (CRITICAL — these must be exact)
| Tier | Hex | RGB | Usage |
|------|-----|-----|-------|
| **CRITICAL** | `#EF4444` | 239, 68, 68 | Score 0-39, markers, badges |
| **HIGH** | `#F97316` | 249, 115, 22 | Score 40-59 |
| **MEDIUM** | `#FBBF24` | 251, 191, 36 | Score 60-74 |
| **LOW** | `#10B981` | 16, 185, 129 | Score 75-100 |

### Accent & Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-blue` | `#3B82F6` | Primary actions, selected states |
| `--accent-cyan` | `#06B6D4` | Secondary highlights, data viz accents |
| `--success` | `#10B981` | Positive deltas, simulator gains |
| `--warning` | `#F59E0B` | Caution states |
| `--error` | `#EF4444` | Errors, critical alerts |
| `--border` | `#374151` | Card borders, dividers |
| `--border-subtle` | `#1F2937` | Subtle separators |

### Colors to AVOID
| ❌ Color | Why |
|----------|-----|
| Purple (`#8B5CF6`, `#A855F7`) | Screams "AI-generated", overused in hackathon projects |
| Hot Pink / Magenta | Not appropriate for government/safety tool |
| Bright Neon Green (`#00FF00`) | Too gamified, use muted emerald instead |
| Pure White (`#FFFFFF`) backgrounds | Too harsh for command-center aesthetic |
| Rainbow gradients | Not professional, reduces trust |

---

## 3. Typography

### Font Stack
```css
/* Primary: Inter — clean, professional, designed for dashboards */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace: For data values, scores, IDs */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

### Type Scale
| Element | Size | Weight | Line Height | Font |
|---------|------|--------|-------------|------|
| App Title (Navbar) | 20px | 700 | 1.2 | Inter |
| Section Header | 16px | 600 | 1.3 | Inter |
| Card Title | 14px | 600 | 1.4 | Inter |
| Body Text | 13px | 400 | 1.5 | Inter |
| Caption / Label | 11px | 500 | 1.4 | Inter |
| KPI Number | 32px | 700 | 1.1 | Inter |
| Risk Score | 28px | 800 | 1.0 | JetBrains Mono |
| Data Value | 14px | 600 | 1.3 | JetBrains Mono |
| Badge Text | 10px | 700 | 1.0 | Inter (uppercase) |

### Typography Rules
- **ALL CAPS** only for: Risk tier badges (`CRITICAL`, `HIGH`), section labels
- **Monospace** only for: Numerical scores, segment IDs, percentages
- **Never** use decorative/script fonts
- **Letter spacing**: `0.05em` for uppercase labels, `0` for body text

---

## 4. Layout System

### Grid Structure
```css
/* Master dashboard grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 280px 1fr 380px;
  grid-template-rows: 1fr;
  height: calc(100vh - 120px); /* Navbar + KPI + Footer */
  gap: 1px; /* Hairline separator */
}
```

### Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Icon gaps, tight padding |
| `--space-sm` | 8px | Compact card padding |
| `--space-md` | 12px | Standard card padding |
| `--space-lg` | 16px | Section padding |
| `--space-xl` | 24px | Major section gaps |
| `--space-2xl` | 32px | Page-level margins |

### Breakpoints
| Breakpoint | Width | Layout Change |
|-----------|-------|---------------|
| Desktop XL | ≥ 1440px | Full 3-column layout |
| Desktop | 1024–1439px | Sidebar 240px, Inspector 340px |
| Tablet | 768–1023px | Sidebar collapses to icons, Inspector overlays map |
| Mobile | < 768px | Single column, bottom sheet for inspector |

---

## 5. Component Design System

### Cards
```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: var(--space-md);
  transition: all 0.2s ease;
}

.card:hover {
  border-color: var(--accent-blue);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card.active {
  border-left: 3px solid var(--accent-blue);
  background: var(--bg-tertiary);
}
```

### Buttons
| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| **Primary** | `#3B82F6` | White | None | "Run Simulation", main actions |
| **Secondary** | Transparent | `#9CA3AF` | `1px solid #374151` | "Reset", "Clear Filters" |
| **Danger** | `#DC2626` | White | None | Destructive actions (if any) |
| **Ghost** | Transparent | `#60A5FA` | None | "View Details →", inline links |

```css
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
```

### Badges / Pills
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-critical { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
.badge-high { background: rgba(249, 115, 22, 0.15); color: #F97316; }
.badge-medium { background: rgba(251, 191, 36, 0.15); color: #FBBF24; }
.badge-low { background: rgba(16, 185, 129, 0.15); color: #10B981; }
```

### Input Fields
```css
.input {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: 13px;
}

.input:focus {
  border-color: var(--accent-blue);
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.input::placeholder {
  color: var(--text-muted);
}
```

---

## 6. Dashboard Structure

### Hierarchy (Visual Weight)
```
1. MAP (60% of visual attention)        — Largest area, animated markers
2. INSPECTOR (25% of visual attention)  — Right panel, data-dense
3. SIDEBAR (10% of visual attention)    — Left panel, navigation
4. KPI STRIP (3% of visual attention)   — Top, glanceable stats
5. NAVBAR (2% of visual attention)      — Brand identity, minimal
```

### Panel Borders
- Panels separated by `1px solid var(--border-subtle)` — not white gaps
- No rounded corners between panels (only within cards)
- Panels should feel like one continuous surface, not floating cards

### Scrolling
- Sidebar: Independent vertical scroll, custom thin scrollbar (`4px`, muted)
- Inspector: Independent vertical scroll
- Map: Pan/zoom (no scroll)
- KPI Strip: Fixed, never scrolls

---

## 7. Data Visualization Style

### Chart Colors (Consistent across all charts)
```javascript
const CHART_PALETTE = [
  '#3B82F6', // Blue (primary data)
  '#EF4444', // Red (danger/critical)
  '#F97316', // Orange (high)
  '#FBBF24', // Amber (medium)
  '#10B981', // Emerald (safe/positive)
  '#06B6D4', // Cyan (secondary)
  '#8B5CF6', // Violet (only in multi-series, never dominant)
];
```

### Bar Charts (Cause Breakdown)
- Horizontal bars, not vertical
- Background: `rgba(255, 255, 255, 0.05)` track
- Fill: Risk-tiered color
- Labels on left, percentage on right
- No grid lines, no axes — clean inline bars

### Donut Charts (Vulnerable Groups)
- Thin ring (40% inner radius)
- Center: Primary group name + percentage
- Max 4 segments (combine small groups into "Other")
- Colors from CHART_PALETTE

### Score Gauge (Risk Score)
- Circular arc gauge (270° sweep)
- Color transitions: Red → Orange → Yellow → Green
- Center: Large number (28px, monospace)
- Below: Tier badge

### Progress Bars (Simulator)
- Thin (6px height), rounded ends
- Animated fill on value change
- Color transitions with score

---

## 8. Micro-Animations & Interactions

### Allowed Animations
| Animation | Duration | Easing | Where |
|-----------|----------|--------|-------|
| Card hover lift | 200ms | ease-out | Sidebar cards |
| Panel slide-in | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Inspector open |
| Score counter | 1500ms | ease-out | KPI cards, simulator |
| Marker pulse | 2000ms | ease-in-out (infinite) | Critical map markers |
| Tooltip appear | 150ms | ease | All hover tooltips |
| Tab switch | 200ms | ease | Inspector tabs |
| Badge appear | 100ms | ease-out | Filter pills |
| Skeleton shimmer | 1500ms | linear (infinite) | Loading states |

### Forbidden Animations
- ❌ Bouncing elements
- ❌ Spinning loaders (use subtle pulse instead)
- ❌ Page-level fade transitions
- ❌ Parallax scrolling
- ❌ Confetti / particle effects
- ❌ Typing/typewriter effects
- ❌ 3D card flips

---

## 9. Mobile Responsiveness

### Tablet (768–1023px)
- Sidebar collapses to **icon-only rail** (48px wide) — tooltip on hover
- Inspector becomes a **slide-up sheet** (bottom 60% of screen)
- Map takes full width
- KPI cards reduce to 2 per row

### Mobile (< 768px)
- Single column layout
- Map takes 100% width, 50vh height
- Sidebar becomes **horizontal pill scroll** at top
- Inspector becomes **full-screen bottom sheet** (swipe up to expand)
- KPI cards stack to 2x2 grid

---

## 10. Iconography

### Icon Library: Lucide React (already installed)
| Context | Icon | Lucide Name |
|---------|------|-------------|
| Risk/Danger | ⚠ | `AlertTriangle` |
| Fatalities | 💀 | `Skull` |
| Location | 📍 | `MapPin` |
| Safety/Shield | 🛡 | `Shield` |
| Search | 🔍 | `Search` |
| Trends | 📈 | `TrendingUp` |
| Close | ✕ | `X` |
| Settings | ⚙ | `Settings` |
| Filter | 🔽 | `Filter` |
| Simulate | 🧪 | `FlaskConical` |
| Infrastructure | 🏗 | `Building2` |
| Camera/Speed | 📷 | `Camera` |
| Lighting | 💡 | `Lightbulb` |
| Pedestrian | 🚶 | `PersonStanding` |
| Clock/Time | ⏰ | `Clock` |
| Rupee/Cost | ₹ | `IndianRupee` or text |
| Lives Saved | ❤️ | `Heart` |

### Icon Sizing
| Context | Size | Color |
|---------|------|-------|
| Navbar | 20px | `--text-primary` |
| Card inline | 16px | `--text-secondary` |
| KPI card | 24px | Risk tier color |
| Button icon | 14px | Inherit from button text |

---

## 11. Visual References & Inspiration

### Primary Inspiration (Aim for this feel)
| Product | What to Take |
|---------|-------------|
| **Palantir Foundry** | Dense, dark, data-first layouts with map dominance |
| **Bloomberg Terminal** | Information density, monospace numbers, muted chrome |
| **Mapbox Studio** | Beautiful dark map with colored overlays |
| **Grafana Dashboards** | Panel-based layout, dark theme, real-time feel |
| **Uber Movement** | Clean transportation data visualization |

### Anti-Inspiration (Do NOT look like this)
| Product | What to Avoid |
|---------|--------------|
| Generic Bootstrap dashboards | Rounded cards, white backgrounds, generic charts |
| Dribbble "AI Dashboard" concepts | Purple gradients, glowing orbs, floating cards |
| SaaS landing pages | Hero sections, CTA buttons, marketing copy |
| Notion / Linear | Too minimal, not data-dense enough |

---

## 12. Stitch MCP Integration Notes

When using Stitch MCP to generate individual page/component designs, use these consistent instructions:

### Global Context for All Screens
```
Design system: Dark command center aesthetic (bg: #0A0E17, cards: #111827)
Font: Inter for UI, JetBrains Mono for data
Colors: Red (#EF4444) = Critical, Orange (#F97316) = High, Amber (#FBBF24) = Medium, Green (#10B981) = Low
Style: Palantir/Bloomberg-grade enterprise analytics, NOT AI-generated looking
No purple, no gradients, no floating cards, no glassmorphism
```

### Per-Component Prompts
1. **Navbar** → "Enterprise analytics header bar with shield logo, system status badge, dark bg #0A0E17"
2. **KPI Strip** → "4 metric cards in horizontal row, dark cards #111827, red/green accent numbers, monospace values"
3. **Map** → "Dark satellite map centered on Bengaluru with pulsing colored markers (red/orange/yellow/green)"
4. **Sidebar** → "Scrollable corridor list with risk score badges, search input at top, dark panels"
5. **Inspector** → "Data-dense right panel with gauge chart, horizontal bars, donut chart, tabbed interface"
6. **Simulator** → "Checkbox list of interventions, before/after score comparison, animated progress bar"
7. **Fix This First** → "Modal overlay with ranked table, risk badges, intervention recommendations"

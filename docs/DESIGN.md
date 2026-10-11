# Design spec

All sizes are CSS pixels at the **Medium** size, where the pet is drawn at 2x. The mockup sources in `reference/mockup/` carry the same values; `States.dc.html` and `Themes.dc.html` draw the device at double these numbers.

## 1. The device (overlay)

An egg-shaped shell holding a framed screen and three round buttons. The whole shell is the drag handle.

| Part | Spec |
|---|---|
| Shell | 200 x 236, `border: 3px solid edge`, `background: shell`, `border-radius: 50% 50% 50% 50% / 55% 55% 45% 45%` |
| Shell depth | `box-shadow: 0 5px 0 edge` (hard lip) plus `0 14px 20px rgba(40,30,70,0.22)` (soft drop) |
| Shell layout | flex column, centred, `padding-top: 37px`, `gap: 12px` |
| Gloss | decorative ellipse 44 x 14 at left 34, top 14, `rgba(255,255,255,0.55)`, rotated -24deg |
| Bezel | 148 x 132, `padding: 5px`, `border: 3px solid edge`, `background: bezel`, radius 18 |
| Screen | 132 x 116, radius 10, `background: sky`, text colour `ink`, clips its contents |
| Buttons | three circles 28 x 28, `border: 3px solid btnEdge`, `background: btn`, icon colour `btnInk`, gap 12; the middle one sits 6px lower |

The window needs about 24px of spare room below and to the sides so the drop shadow is not clipped.

### Screen contents

Font: Press Start 2P (one weight, 400). It is drawn on an 8px grid, so use sizes that are multiples of 8.

| Element | Spec |
|---|---|
| Status row | top 6, left and right 8; mode label on the left (8px), session pips on the right |
| Session pips | four 6 x 6 squares, gap 3, `1px solid ink`; a finished session is filled with `ink`, the rest are hollow |
| Timer | `MM:SS`, 16px (80px wide; every glyph is 1em), line-height 1, centred, top 22 |
| Ground | strip along the bottom, height 12, `background: ground` |
| Progress | a 3px line on the top edge of the ground strip, `background: accent`, width = time remaining as a percentage |
| Pet | 64 x 64 box, left 34, bottom 8, so its feet rest 4px into the ground strip; faces left. The sprite is drawn at the largest whole-number scale that fits the box (see Sizes), centred along the bottom edge |

### Buttons

Left to right:

1. **Play / pause**: pause icon while running, play icon while paused or waiting. Labels: "Pause", "Resume", "Start break", "Start focus".
2. **Skip**: ends the current session early.
3. **Settings**: opens the settings window.

Icons are pixel shapes on a 12-unit grid, drawn at 12px (one unit per pixel), `fill: currentColor`:

```html
<!-- pause -->
<rect x="2" y="2" width="3" height="8"/><rect x="7" y="2" width="3" height="8"/>
<!-- play -->
<rect x="3" y="2" width="2" height="8"/><rect x="5" y="3" width="2" height="6"/><rect x="7" y="4" width="1" height="4"/><rect x="8" y="5" width="1" height="2"/>
<!-- skip -->
<rect x="1" y="2" width="2" height="8"/><rect x="3" y="3" width="2" height="6"/><rect x="5" y="4" width="1" height="4"/><rect x="6" y="5" width="1" height="2"/><rect x="8" y="2" width="2" height="8"/>
<!-- settings -->
<rect x="1" y="2" width="10" height="2"/><rect x="7" y="1" width="2" height="4"/><rect x="1" y="8" width="10" height="2"/><rect x="3" y="7" width="2" height="4"/>
```

### Sizes

| Size | Pet box | Device |
|---|---|---|
| Medium | 64 x 64 | 200 x 236 |
| Large | 96 x 96 | 300 x 354 (every dimension x 1.5) |
| Small | undecided | see open questions in `CLAUDE.md` |

Pet scale = `floor(box / frameSize)`, never a fraction:

| Frame size | Pets | Medium | Large |
|---|---|---|---|
| 32 | most pets | 2x | 3x |
| 16 | chick | 4x | 6x |
| 64 | bull, calf | 1x | 1x (looks smaller at Large) |

## 2. States

| State | Mode label | Timer shows | Pet animation (hare) | Left button |
|---|---|---|---|---|
| Focus | `FOCUS` | time left | idle | pause |
| Break | `BREAK` | time left | walk | pause |
| Paused | `PAUSED` | frozen time left | idle, back turned | play |
| Session complete | `DONE` | next full session, e.g. `05:00` | run once, then the next session's pose (walk before a break, idle before focus) | play (starts the next session) |
| Session skipped | `SKIPPED` | next full session, e.g. `25:00` | hurt (red flash) | play |

Each pet's manifest maps these states to its own animations (`states` in `manifest.json`), so pets without a run or hurt animation still work.

Notes:

- The pet faces left in every state except Paused, which uses the back view.
- "Skipped" is a brief reaction. Skipping a focus session plays the hurt animation once, then falls back to the idle pose. Skipping a break shows `SKIPPED` with the idle pose and no hurt reaction. A skipped session never fills a pip.
- A long break replaces the short break after every fourth focus session, then the pips reset (after the long break ends or is skipped).
- Nothing starts on its own. After a session completes or is skipped, the next one waits for play.
- Before the first session (and after Reset session) the device shows the queued session idle: `FOCUS` / `25:00`, play button labeled "Start focus", full progress line.
- In dev, `?demo=focus|break|paused|complete|skipped` on the dev server URL opens straight into that state.

## 3. Sprites

Each pet is a folder in `assets/sprites/<id>/` with one PNG sheet per animation and a `manifest.json`. A sheet has **N frames across and 4 rows, one per direction: front, back, left, right** (rows 0–3). Frames are square (`frameSize` in the manifest), with the pet's feet near the bottom of the frame and a baked-in ground shadow.

```json
{
  "id": "hare", "name": "Hare", "frameSize": 32,
  "directions": ["front", "back", "left", "right"],
  "animations": {
    "idle": { "file": "idle.png", "frames": 4, "fps": 6.67 },
    "walk": { "file": "walk.png", "frames": 5, "fps": 6.67 },
    "run":  { "file": "run.png",  "frames": 6, "fps": 6.67 },
    "hurt": { "file": "hurt.png", "frames": 4, "fps": 6.67 }
  },
  "states": { "focus": "idle", "break": "walk", "complete": "run", "skipped": "hurt", "paused": "idle" }
}
```

The pack plays every animation at 150 ms per frame, which is where `fps: 6.67` comes from.

| Pets | Frame | Animations | complete / skipped use |
|---|---|---|---|
| hare, fox, deer | 32 | idle, walk, run, hurt | run / hurt |
| boar | 32 | idle, walk, run, hurt, attack (not mapped) | run / hurt |
| black-grouse | 32 | idle, walk, flight, hurt | flight / hurt |
| lamb, piglet, rooster, sheep, turkey | 32 | idle, walk | walk / idle |
| chick | 16 | idle, walk | walk / idle |
| bull, calf | 64 | idle, walk | walk / idle |

Paused always uses the `back` row; every other state uses `left`. The packs' death animations are left out on purpose; they're still in `art-source/`.

CSS pattern for a sheet of N frames x 4 rows in a box of any size:

```css
.pet {
  background-repeat: no-repeat;
  background-size: calc(N * 100%) 400%;
  background-position-y: calc(row / 3 * 100%);
  image-rendering: pixelated;
  animation: pet-frames calc(N / fps * 1s) steps(N, jump-none) infinite;
}
@keyframes pet-frames {
  from { background-position-x: 0%; }
  to   { background-position-x: 100%; }
}
```

`steps(N, jump-none)` from 0% to 100% stops exactly on each frame `k` at `k / (N - 1) * 100%`, each for an equal share of the duration, and ends on the last frame. That last part matters for one-shots: the Skipped reaction uses `animation-iteration-count: 1` with `animation-fill-mode: forwards`, then switches to idle on `animationend`. For example, the hare's 4-frame idle sheet facing left uses `background-size: 400% 400%` and `background-position-y: 66.6667%`. A static pose is one frame: frame `k` sits at `background-position-x: calc(k / (N - 1) * 100%)`. The code is in `src/pets/sprite.ts`.

With `prefers-reduced-motion` (Windows "Animation effects" off) or "Animate the pet" off, every state shows frame 0 of its animation, and Skipped shows the idle pose straight away.

Image references in the mockup sources map to these files. The mockup was drawn with older, rebuilt art, so its "run" is now `walk` and its "jump" is now `run`:

| Mockup URL ends with | File |
|---|---|
| `fdb70ff8...` | `hare/idle.png`, left row |
| `de0a5071...` | `hare/idle.png`, front row |
| `dd0dde7a...` | `hare/idle.png`, back row |
| `70881574...` | `hare/walk.png`, left row |
| `26334384...` | `hare/run.png`, left row |
| `069e6342...` | `hare/hurt.png`, left row |
| `92fe2001...` | the icon crop; use `assets/icons/` |

## 4. Themes

Four pastel themes, defined in `src/theme/themes.ts`.

| Theme | Shell | Buttons | Screen |
|---|---|---|---|
| Lilac (default) | lavender `#CDB8F6` | pink `#F9A1CF` | pale pink `#FBEFFF`, purple ink |
| Mint | green `#B8EBD4` | butter yellow `#FFE08A` | pale green `#EFFBF1`, dark green ink |
| Peach | peach `#FFD0B8` | baby blue `#A9DDF2` | cream `#FFF4E6`, brown ink |
| Starlight | periwinkle `#B9CFF7` | pink `#FFC2DD` | navy `#2E2A66`, pale yellow ink |

Starlight is the only theme with a dark screen. Its `ink` is light, so never use `ink` for text outside the screen; use `text`.

## 5. Tray menu

Header: pet portrait, app name, and a status line such as "Focus, 18:24 left".

Items, with dividers between groups:

1. Pause / Resume, Skip to break, Reset session
2. Show overlay (checked), Always on top (checked), Lock position (unchecked)
3. Change pet, Settings, Quit

The mockup styles this as a pastel rounded panel. Build it as a native menu first; the header becomes the tray tooltip.

## 6. Settings window

Width 520. Surface `bezel`, `3px solid edge` outline, radius 22, lip shadow `0 6px 0 edge`. Title bar 56 tall in `shell` with the pet icon, "Settings" (Press Start 2P 16px) and a 44 x 44 close button. Body text is Nunito 15px, weight 700, colour `text`. Section headings are Press Start 2P 8px, colour `sub`. Rows are at least 44px tall.

| Section | Controls |
|---|---|
| Pet | A wrapping grid of tiles, four per row, one per pet in the registry (13 today): a 64 x 64 portrait on the `sky` colour, a radio and the name. The portrait is the pet's idle frame 0, front row, at `max(1, floor(48 / frameSize))` (2x for 32px frames, 3x for the chick). Bull and calf are drawn at 1x and centred; their 64px frames have wide empty margins, so the portrait's clipping only cuts empty space. The selected tile has a `3px solid mark` border and `soft` fill. Below: "Animate the pet" checkbox. The mockup shows only four tiles; with 13 the settings body needs to scroll. |
| Theme | A row of four tiles, each with a mini egg swatch in that theme's shell and button colours, a radio and the name. |
| Timer | Number fields in two columns: Focus (min) 25, Short break (min) 5, Long break (min) 15, Sessions per cycle 4. |
| Overlay | Size (Small / Medium / Large radios), Opacity slider (40 to 100, default 90), Always on top (on), Snap to screen corners (on), Launch at login (off). |

Footer: "Reset to defaults" (outlined) on the left, "Done" (filled with `btn`) on the right, both 44px tall.

The mockup's Fox, Cat and Frog tiles are placeholders. Build the tiles from the pet registry instead.

## 7. Fonts

- **Press Start 2P** (400 only): everything on the device screen, headings, buttons. Sizes in multiples of 8px; it is much wider than a normal font.
- **Nunito** (600, 700, 800): body text in settings and menus.

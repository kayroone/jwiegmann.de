# MAD-Plan: Spring Theme

> **Hinweis (März 2026):** `ENABLE_PIXEL_BACKGROUND` und die Klasse `PixelBackground` wurden nach Evaluation entfernt. Die betroffenen Arbeitspakete (AP-002 teilweise, AP-011, AP-013) sind damit hinfällig.

## Uebersicht

5 Feature Files, 38 Gherkin-Szenarien, zerlegt in 16 Arbeitspakete.

**Implementierungsreihenfolge (Abhaengigkeits-Graph):**

```
AP-001 (pixelSize Konstante)
  |
  +---> AP-002 (Feature Toggles)
  |       |
  |       +---> AP-012 (Toggle-Logik in animate())
  |
  +---> AP-003 (PixelSun Klasse: Positionierung + Body)
  |       |
  |       +---> AP-004 (PixelSun: Farbverlauf orange->gelb)
  |       |       |
  |       |       +---> AP-005 (PixelSun: Rays + Animation)
  |       |
  |       +---> AP-010 (PixelSun: Resize-Repositionierung)
  |
  +---> AP-006 (PixelGrass Klasse: Blade-Generierung)
  |       |
  |       +---> AP-007 (PixelGrass: Blade-Rendering + Farbe)
  |       |       |
  |       |       +---> AP-008 (PixelGrass: Wind-Animation)
  |       |
  |       +---> AP-009 (PixelGrass: Resize-Regenerierung)
  |
  +---> AP-011 (Pixel-Gradient Hintergrund)
  |
  +---> AP-013 (Text-Sichtbarkeit bei Gradient)
  |
  +---> AP-014 (Render-Reihenfolge in animate())
  |       |
  |       +---> AP-015 (Lifecycle: Instantiierung + Cleanup)
  |
  +---> AP-016 (Performance-Budget Validierung)
```

---

## AP-001: pixelSize als globale Konstante

**Beschreibung:** `pixelSize` von Instanz-Variable (`this.pixelSize = 4` in PixelVine) zu globaler Konstante am Datei-Top extrahieren. Alle bestehenden Referenzen in PixelVine auf die Konstante umstellen.

**Gherkin-Referenz:** Klaerung #8 (pixelSize global), Grundlage fuer alle weiteren Pakete

**Input-Typ:** Bestehender Code in `stars.tsx`
**Output-Typ:** `const PIXEL_SIZE = 4` am Datei-Top, PixelVine nutzt diese Konstante
**Seiteneffekte:** Keine (rein mechanisches Refactoring)
**Akzeptanzkriterien:**

- `PIXEL_SIZE` ist als `const` am Datei-Top definiert (neben Feature-Toggles)
- `this.pixelSize` in PixelVine ist entfernt
- Alle `this.pixelSize`-Referenzen in PixelVine nutzen `PIXEL_SIZE`
- Visuelles Verhalten unveraendert

**Abhaengigkeiten:** Keine

### TDD-Plan

- **Test:** `PixelVine` nutzt `PIXEL_SIZE` statt Instanz-Variable. Konstruktor setzt kein `this.pixelSize`. Import der Konstante verifizieren.
- **Test-Typ:** Unit (vitest)
- **Test-Daten:** Instanziiere PixelVine, pruefe dass `(vine as any).pixelSize` undefined ist.
- **Red:** Test schlaegt fehl weil `this.pixelSize = 4` noch existiert.
- **Green:** Entferne `this.pixelSize`, ersetze alle Referenzen durch `PIXEL_SIZE`.

---

## AP-002: Feature Toggle ENABLE_SPRING_THEME + ENABLE_PIXEL_BACKGROUND

**Beschreibung:** Zwei neue Boolean-Konstanten `ENABLE_SPRING_THEME` und `ENABLE_PIXEL_BACKGROUND` am Datei-Top einfuegen. Noch keine Logik -- nur die Deklaration.

**Gherkin-Referenz:** feature-toggle.feature Background, background.feature Background

**Input-Typ:** -
**Output-Typ:** Zwei neue Konstanten in `stars.tsx`
**Seiteneffekte:** Keine
**Akzeptanzkriterien:**

- `ENABLE_SPRING_THEME = true` existiert neben den bestehenden Toggles
- `ENABLE_PIXEL_BACKGROUND = true` existiert neben den bestehenden Toggles
- Bestehender Code laeuft weiterhin

**Abhaengigkeiten:** AP-001

### TDD-Plan

- **Test:** Datei exportiert/enthaelt die Konstanten `ENABLE_SPRING_THEME` und `ENABLE_PIXEL_BACKGROUND`.
- **Test-Typ:** Unit (statische Pruefung)
- **Test-Daten:** Importiere Konstanten, pruefe `typeof ENABLE_SPRING_THEME === 'boolean'`.
- **Red:** Import schlaegt fehl weil Konstanten nicht existieren.
- **Green:** Konstanten deklarieren.

---

## AP-003: PixelSun Klasse -- Positionierung + Kreisfoermiger Body

**Beschreibung:** Neue Klasse `PixelSun` mit Konstruktor (nimmt Canvas-Dimensionen), berechnet Center-Position. `draw()` rendert einen kreisfoermigen Body aus Pixeln mit fixem Radius ~40px. Noch ohne Farbverlauf (einfarbig orange). `update()` vorerst leer.

**Gherkin-Referenz:**

- pixel-sun.feature: "Sun is horizontally centered", "Sun is positioned above the heading", "Sun body has a fixed radius", "Sun body is circular in pixel art style"

**Input-Typ:** `canvasWidth: number, canvasHeight: number`
**Output-Typ:** PixelSun-Instanz mit `centerX`, `centerY`, `radius` Properties. `draw(ctx)` rendert Pixel-Kreis.
**Seiteneffekte:** Keine (pure Klasse, noch nicht in Loop integriert)
**Akzeptanzkriterien:**

- `centerX === Math.floor(canvasWidth / 2)`
- `centerY === canvasHeight * 0.3` (Klaerung #6)
- `radius === 40` (Klaerung #10)
- `draw()` fuellt nur Pixel deren Mittelpunkts-Abstand zum Center <= radius ist
- Pixel sind achsenausgerichtet, Groesse = PIXEL_SIZE

**Abhaengigkeiten:** AP-001

### TDD-Plan

- **Test 1:** Konstruktor berechnet centerX = Math.floor(800/2) = 400 bei canvasWidth=800.
- **Test 2:** Konstruktor berechnet centerY = 600 \* 0.3 = 180 bei canvasHeight=600.
- **Test 3:** radius ist 40 und aendert sich nicht bei verschiedenen Canvas-Groessen.
- **Test 4:** `draw()` ruft `fillRect` nur fuer Pixel auf, deren Center-Distanz <= 40. Mock-ctx zaehlen.
- **Test-Typ:** Unit (vitest, Mock-CanvasRenderingContext2D)
- **Test-Daten:** Canvas 800x600, erwartete Werte siehe oben.
- **Red:** Klasse existiert nicht.
- **Green:** Klasse mit Konstruktor + draw() implementieren.

---

## AP-004: PixelSun Farbverlauf (orange Kern -> gelbes Edge)

**Beschreibung:** `draw()` erweitern: Pixel-Farbe abhaengig von Distanz zum Center interpolieren. Center = orange (r=255, g=150, b=0), Edge = gelb (r=255, g=245, b=30). Mindestens 3 Farbringe.

**Gherkin-Referenz:**

- pixel-sun.feature: "Sun core is rendered in orange", "Sun body transitions from orange center to yellow edge"

**Input-Typ:** Distanz jedes Pixels zum Center
**Output-Typ:** Interpolierte Farbe pro Pixel
**Seiteneffekte:** Keine
**Akzeptanzkriterien:**

- Pixel bei Distanz 0: fillStyle hat g-Wert 140-160
- Pixel bei max Distanz (Body-Rand): fillStyle hat g-Wert 240-255, b-Wert 0-50
- Mindestens 3 verschiedene Farben im Body (pruefbar ueber Set von fillStyle-Werten)

**Abhaengigkeiten:** AP-003

### TDD-Plan

- **Test 1:** Farbinterpolations-Funktion: Bei t=0 ergibt orange (g~150), bei t=1 ergibt gelb (g~245).
- **Test 2:** `draw()` mit Mock-ctx: Sammle alle fillStyle-Werte, pruefe >= 3 unterschiedliche.
- **Test 3:** Erster fillRect-Call (Center-nahe) hat g im Bereich 140-160.
- **Test-Typ:** Unit
- **Test-Daten:** Canvas 800x600, Mock-ctx der fillStyle aufzeichnet.
- **Red:** draw() nutzt noch Einheitsfarbe.
- **Green:** Farbinterpolation basierend auf Distanz/Radius implementieren.

---

## AP-005: PixelSun Rays + Sinus-Animation

**Beschreibung:** 12 Strahlen gleichmaessig verteilt (30-Grad-Abstand). Jeder Strahl besteht aus Pixel-Rects die vom Body-Rand nach aussen gehen. Laenge oszilliert via `Math.sin()` zwischen 15-35px. Ray-Farbe = gelb. `update(time)` aktualisiert Strahlen-Laengen.

**Gherkin-Referenz:**

- pixel-sun.feature: "Sun has exactly 12 rays", "Rays are composed of pixel rectangles", "Rays animate using sine-based oscillation", "Ray color matches outer sun body"

**Input-Typ:** `time: number` (Animationszeit)
**Output-Typ:** 12 animierte Strahlen, gerendert als fillRect-Aufrufe
**Seiteneffekte:** Keine
**Akzeptanzkriterien:**

- Genau 12 Strahlen (Klaerung #11)
- Winkelabstand = 30 Grad
- Ray-Laenge zwischen 15-35px (Klaerung #9)
- Laengenberechnung nutzt Math.sin() mit Zeitparameter
- Farbe gelb (r=255, g=220-255, b=0-80)
- Rays bestehen aus fillRect-Aufrufen mit PIXEL_SIZE

**Abhaengigkeiten:** AP-004

### TDD-Plan

- **Test 1:** `update(0)` und `update(500)` ergeben unterschiedliche Ray-Laengen.
- **Test 2:** Ray-Laenge liegt immer im Bereich [15, 35].
- **Test 3:** `draw()` mit Mock-ctx: Zaehle Rays anhand der Winkel-Gruppen, erwarte 12.
- **Test 4:** Ray-fillStyle hat g >= 220 und b <= 80.
- **Test-Typ:** Unit
- **Test-Daten:** Verschiedene Zeitwerte (0, 500, 1000, 5000).
- **Red:** PixelSun hat keine Rays.
- **Green:** Ray-Berechnung und -Rendering in update()/draw() ergaenzen.

---

## AP-006: PixelGrass Klasse -- Blade-Generierung

**Beschreibung:** Neue Klasse `PixelGrass` (oder statische Factory). Konstruktor generiert ein Array von Blade-Objekten basierend auf Canvas-Breite. Jeder Blade hat: baseX, height (20-80px), width (1x oder 2x PIXEL_SIZE), phaseOffset, color.

**Gherkin-Referenz:**

- pixel-grass.feature: "Grass blades span full width", "Grass blades have varying heights", "Grass blades have mixed widths", "Grass count adapts to screen width", "Grass handles very narrow viewport", "Grass handles very wide viewport"

**Input-Typ:** `canvasWidth: number, canvasHeight: number`
**Output-Typ:** Array von Blade-Objekten `{ baseX, height, width, phaseOffset, baseColor }`
**Seiteneffekte:** Keine
**Akzeptanzkriterien:**

- Blades decken x=0 bis x=canvasWidth ab, keine Luecken > 20px
- Heights zwischen 20 und 80px, mindestens 3 verschiedene
- Breiten: Mischung aus PIXEL_SIZE (4px) und 2\*PIXEL_SIZE (8px), keine breiter als 8px
- Bei 1920px Breite: 100-300 Blades
- Bei 320px Breite: mindestens 10 Blades
- Kein Blade ragt ueber canvasWidth hinaus

**Abhaengigkeiten:** AP-001

### TDD-Plan

- **Test 1:** Bei canvasWidth=1920 liegt Blade-Count zwischen 100 und 300.
- **Test 2:** Bei canvasWidth=320 gibt es mindestens 10 Blades.
- **Test 3:** Kein Gap > 20px zwischen aufeinanderfolgenden Blade-baseX-Werten (sortiert).
- **Test 4:** Alle Heights im Bereich [20, 80], mindestens 3 verschiedene Werte.
- **Test 5:** Breiten sind nur PIXEL_SIZE oder 2\*PIXEL_SIZE, beide kommen vor.
- **Test 6:** Kein Blade hat baseX + width > canvasWidth.
- **Test-Typ:** Unit
- **Test-Daten:** canvasWidth=1920, canvasWidth=320, canvasWidth=3840.
- **Red:** Klasse existiert nicht.
- **Green:** Blade-Generierungslogik implementieren.

---

## AP-007: PixelGrass Blade-Rendering + Farbverlauf

**Beschreibung:** `draw(ctx)` Methode: Rendert jeden Blade als vertikale Spalte von fillRect-Aufrufen. Basis bei canvas.height, waechst nach oben. Gruene Farbe mit Variation zwischen Blades. Optional: dunkleres Gruen an Basis, helleres an Spitze.

**Gherkin-Referenz:**

- pixel-grass.feature: "Grass blades are anchored at bottom", "Grass blades are vertical pixel columns", "Grass blades are green", "Grass color may vary by height", "Grass is rendered using pixel-art fillRect", "Grass renders behind text layer"

**Input-Typ:** CanvasRenderingContext2D, Blade-Array
**Output-Typ:** Gerenderte Pixel-Spalten auf Canvas
**Seiteneffekte:** Canvas-Zustand (fillRect-Aufrufe)
**Akzeptanzkriterien:**

- Jeder Blade hat Basis-Y = canvasHeight (unterster Rand)
- Blade waechst nach oben (Y nimmt ab)
- Farbe: r=0-80, g=140-220, b=0-60
- Farbvariation zwischen Blades (nicht alle identisch)
- Basis dunkler (g=140-170), Spitze heller (g=180-220)
- Segmente via fillRect mit PIXEL_SIZE

**Abhaengigkeiten:** AP-006

### TDD-Plan

- **Test 1:** `draw()` ruft fillRect fuer jedes Segment auf, Segment-Y beginnt bei canvasHeight und nimmt ab.
- **Test 2:** fillStyle-Farben haben g im Bereich [140, 220] und r <= 80.
- **Test 3:** Verschiedene Blades haben verschiedene fillStyle-Werte (Farb-Variation).
- **Test 4:** Basis-Segmente eines Blades haben niedrigeren g-Wert als Spitzen-Segmente.
- **Test-Typ:** Unit (Mock-ctx)
- **Test-Daten:** 3 Test-Blades mit bekannten Hoehen/Positionen.
- **Red:** draw() existiert nicht.
- **Green:** Rendering-Logik implementieren.

---

## AP-008: PixelGrass Wind-Animation

**Beschreibung:** `update(time)` berechnet horizontale Verschiebung pro Blade. Sinus-basiert mit `Math.sin(time + phaseOffset)`. Verschiebung nimmt linear von Basis (0) zu Spitze (max) zu. Wind-Bias: `Math.sin(t) - 0.3` (Grundneigung links). Keine Spruenge > 3px zwischen Frames.

**Gherkin-Referenz:**

- pixel-grass.feature: "Wind displaces only the tip", "Grass blades sway right to left", "Wind uses sine-based oscillation", "Wind animation is continuous and smooth"

**Input-Typ:** `time: number`
**Output-Typ:** `tipOffsetX` pro Blade (horizontale Verschiebung der Spitze)
**Seiteneffekte:** Keine
**Akzeptanzkriterien:**

- Basis-Pixel bewegt sich nicht horizontal
- Verschiebung nimmt linear zu von Basis (0px) zu Spitze (max)
- Berechnung nutzt Math.sin() mit Zeitparameter
- Jeder Blade hat eigenen phaseOffset (nicht synchron)
- Wind-Bias: `Math.sin(t) - 0.3` (Klaerung #7)
- Keine Spruenge > 3px zwischen aufeinanderfolgenden Frames

**Abhaengigkeiten:** AP-007

### TDD-Plan

- **Test 1:** Bei time=T ergibt Basis-Segment offsetX=0, Spitzen-Segment offsetX != 0.
- **Test 2:** Zwei Blades mit verschiedenen phaseOffsets haben verschiedene tipOffsetX bei gleichem time.
- **Test 3:** `update(T)` und `update(T + 16)` (ein Frame bei 60fps): Differenz der tipOffsetX < 3px.
- **Test 4:** Ueber viele Zeitschritte ist der Durchschnitt von tipOffsetX negativ (Links-Bias).
- **Test-Typ:** Unit
- **Test-Daten:** time-Werte 0, 16, 32, ..., 10000 (simulierte Frames).
- **Red:** update() existiert nicht / tipOffsetX ist immer 0.
- **Green:** Sinus-basierte Wind-Berechnung mit Bias implementieren.

---

## AP-009: PixelGrass Resize-Regenerierung

**Beschreibung:** Bei Window-Resize wird das Blade-Array komplett verworfen und neu generiert fuer die neue Canvas-Breite. Integriert in den bestehenden `handleResize` Callback.

**Gherkin-Referenz:**

- pixel-grass.feature: "Grass blade array is fully regenerated on resize"
- animation-loop-integration.feature: "Grass blade array is regenerated on window resize"

**Input-Typ:** Neuer canvasWidth/canvasHeight nach Resize
**Output-Typ:** Neues Blade-Array
**Seiteneffekte:** Altes Blade-Array wird verworfen
**Akzeptanzkriterien:**

- Nach Resize deckt neues Array x=0 bis x=neuerCanvasWidth ab
- Keine Luecken > 20px
- Alte Blades sind komplett verworfen (nicht wiederverwendet)

**Abhaengigkeiten:** AP-006

### TDD-Plan

- **Test 1:** Blade-Array vor Resize hat N Blades fuer Breite 1920. Nach `regenerate(1024)` hat es M Blades, M < N, alle baseX <= 1024.
- **Test 2:** Keine Luecken > 20px im neuen Array.
- **Test-Typ:** Unit
- **Test-Daten:** Resize von 1920 -> 1024.
- **Red:** Resize-Handler regeneriert Blades nicht.
- **Green:** Regenerierungs-Logik in handleResize integrieren.

---

## AP-010: PixelSun Resize-Repositionierung

**Beschreibung:** Bei Window-Resize berechnet die PixelSun-Instanz ihre Position neu. `centerX = Math.floor(newWidth / 2)`, `centerY = newHeight * 0.3`.

**Gherkin-Referenz:**

- animation-loop-integration.feature: "Sun is repositioned on window resize"

**Input-Typ:** Neuer canvasWidth/canvasHeight
**Output-Typ:** Aktualisierte centerX/centerY
**Seiteneffekte:** Keine
**Akzeptanzkriterien:**

- Nach Resize: centerX = Math.floor(newWidth / 2)
- Nach Resize: centerY = newHeight \* 0.3

**Abhaengigkeiten:** AP-003

### TDD-Plan

- **Test 1:** `reposition(1024, 768)` setzt centerX=512, centerY=230.4.
- **Test-Typ:** Unit
- **Test-Daten:** Verschiedene Canvas-Groessen.
- **Red:** Keine reposition-Methode vorhanden.
- **Green:** `reposition(width, height)` Methode implementieren.

---

## AP-011: Pixel-Gradient Hintergrund

**Beschreibung:** Funktion `drawPixelGradient(ctx, width, height)` zeichnet horizontale Baender (Hoehe = PIXEL_SIZE) von oben (hellblau rgba(135,206,235,1)) nach unten (weiss rgba(255,255,255,1)). Wird nur ausgefuehrt wenn `ENABLE_PIXEL_BACKGROUND && ENABLE_SPRING_THEME`.

**Gherkin-Referenz:**

- background.feature: Alle Szenarien ausser Toggle-Verhalten (das ist AP-012)

**Input-Typ:** CanvasRenderingContext2D, canvasWidth, canvasHeight
**Output-Typ:** Horizontale Farbbaender auf Canvas
**Seiteneffekte:** Canvas-Zustand
**Akzeptanzkriterien:**

- Gradient von rgba(135,206,235,1) oben zu rgba(255,255,255,1) unten
- Baender-Hoehe = PIXEL_SIZE (4px)
- Alle Pixel innerhalb eines Bandes haben gleiche Farbe
- Gerendert via ctx.fillRect (nicht CSS)
- Bei canvasHeight=1080: maximal 270 fillRect-Aufrufe
- Deckt volle Canvas-Breite und -Hoehe ab

**Abhaengigkeiten:** AP-001

### TDD-Plan

- **Test 1:** Bei canvasHeight=1080 werden genau ceil(1080/4)=270 fillRect-Aufrufe gemacht.
- **Test 2:** Erster fillRect hat Farbe nahe (135,206,235). Letzter hat Farbe nahe (255,255,255).
- **Test 3:** Jeder fillRect hat width=canvasWidth und height=PIXEL_SIZE.
- **Test 4:** Farbe bei height/2 ist Interpolation (ca. (195,230,245)).
- **Test-Typ:** Unit (Mock-ctx)
- **Test-Daten:** Canvas 1920x1080.
- **Red:** Funktion existiert nicht.
- **Green:** Gradient-Rendering implementieren.

---

## AP-012: Toggle-Logik in animate() -- Feature-Toggle Guards

**Beschreibung:** Die `animate()`-Funktion erhaelt Guards fuer alle Feature-Toggles. Kernlogik:

- `ENABLE_SPRING_THEME`: aktiviert PixelSun + PixelGrass
- `ENABLE_SPRING_THEME` deaktiviert implizit Vines: `ENABLE_VINES && !ENABLE_SPRING_THEME`
- `ENABLE_PIXEL_BACKGROUND`: nur wenn auch `ENABLE_SPRING_THEME`
- Stars bleiben unabhaengig

**Gherkin-Referenz:**

- feature-toggle.feature: Alle 5 Szenarien
- background.feature: "Pixel background toggle is independent of spring theme toggle"

**Input-Typ:** Toggle-Konstanten
**Output-Typ:** Bedingte Ausfuehrung von Render-Bloecken
**Seiteneffekte:** Steuert was auf Canvas gerendert wird
**Akzeptanzkriterien:**

- SPRING=true, STARS=false: Sun+Grass ja, Vines nein, Stars nein
- SPRING=true, VINES=true: Vines trotzdem nein (Guard)
- SPRING=false, VINES=true: Vines ja, Sun+Grass nein
- SPRING=false, VINES=false, STARS=false: Nur clearRect, nichts gezeichnet
- SPRING=true, STARS=true: Sun+Grass+Stars ja, Vines nein
- PIXEL_BG=true, SPRING=false: Kein Gradient

**Abhaengigkeiten:** AP-002

### TDD-Plan

- **Test 1:** Bei SPRING=true wird `sun.draw()` und `grass.draw()` aufgerufen (Mock-Objekte).
- **Test 2:** Bei SPRING=true, VINES=true wird Vine-Block uebersprungen.
- **Test 3:** Bei SPRING=false, VINES=true wird Vine-Block ausgefuehrt.
- **Test 4:** Bei allen false: nur clearRect aufgerufen.
- **Test 5:** Bei PIXEL_BG=true, SPRING=false: kein drawPixelGradient-Aufruf.
- **Test-Typ:** Unit (Mock-Objekte fuer Sun/Grass/Vines, Test der Guard-Bedingungen)
- **Test-Daten:** Verschiedene Toggle-Kombinationen.
- **Red:** animate() hat keine Spring-Guards.
- **Green:** Guard-Bedingungen einfuegen.

---

## AP-013: Text-Sichtbarkeit bei aktivem Gradient

**Beschreibung:** Wenn `ENABLE_PIXEL_BACKGROUND` aktiv ist, muessen die Text-Elemente in `page.tsx` (oder via Props von `Stars`) dunkle Farben bekommen statt weiss. Heading: dunkelgrau statt weiss. Subtitle: dunkleres grau. Steuerung via Prop oder geteilte Konstante.

**Gherkin-Referenz:** Klaerung #5

**Input-Typ:** `ENABLE_PIXEL_BACKGROUND` Flag
**Output-Typ:** Angepasste CSS-Klassen in page.tsx
**Seiteneffekte:** DOM-Aenderungen (Textfarbe)
**Akzeptanzkriterien:**

- Bei PIXEL_BG=true + SPRING=true: Heading-Text in dunkelgrau (z.B. text-gray-800)
- Bei PIXEL_BG=true + SPRING=true: Subtitle in angepasstem grau (z.B. text-gray-600)
- Bei PIXEL_BG=false oder SPRING=false: Bestehende Farben (weiss)
- Icons/Buttons ebenfalls angepasst fuer Sichtbarkeit

**Abhaengigkeiten:** AP-001

### TDD-Plan

- **Test 1:** Wenn ENABLE_PIXEL_BACKGROUND=true und ENABLE_SPRING_THEME=true, hat h1 die Klasse `text-gray-800` (oder aequivalent).
- **Test 2:** Wenn ENABLE_PIXEL_BACKGROUND=false, hat h1 keine dark-Text-Klasse.
- **Test-Typ:** Unit (React Testing Library, render Stars, pruefe className)
- **Test-Daten:** Zwei Konfigurationen: Gradient an/aus.
- **Red:** Text ist immer weiss.
- **Green:** Bedingte Klassen basierend auf Toggle.

---

## AP-014: Render-Reihenfolge in animate()

**Beschreibung:** Die Render-Reihenfolge in `animate()` korrekt implementieren:

1. clearRect
2. Pixel-Gradient (wenn aktiviert)
3. Stars (wenn aktiviert)
4. PixelGrass update+draw
5. PixelSun update+draw

Sun nach Grass, damit Strahlen ueber Gras erscheinen.

**Gherkin-Referenz:**

- animation-loop-integration.feature: "Spring elements render in correct order", "Stars render before spring elements", "Gradient is drawn before all other spring elements"
- background.feature: "Gradient is drawn before all other spring elements"

**Input-Typ:** Alle Render-Objekte (Sun, Grass, Gradient, Stars, Vines)
**Output-Typ:** Korrekte Aufruf-Reihenfolge in animate()
**Seiteneffekte:** Visuelle Schichtung
**Akzeptanzkriterien:**

- clearRect zuerst
- Gradient vor allen Elementen
- Stars vor Spring-Elementen
- Grass vor Sun
- Sun zuletzt (von Spring-Elementen)

**Abhaengigkeiten:** AP-003, AP-006, AP-011, AP-012

### TDD-Plan

- **Test 1:** Mock-ctx zeichnet Aufruf-Reihenfolge auf. Pruefe: clearRect -> fillRect(gradient) -> stars -> grass.draw -> sun.draw.
- **Test-Typ:** Integration (Mock-ctx mit Aufruf-Protokoll)
- **Test-Daten:** Alle Toggles aktiv.
- **Red:** Reihenfolge ist willkuerlich.
- **Green:** animate()-Body in korrekter Reihenfolge strukturieren.

---

## AP-015: Lifecycle -- Instantiierung + Cleanup

**Beschreibung:** PixelSun und PixelGrass werden einmalig beim Mount instanziiert (nicht pro Frame). Cleanup entfernt Event-Listener und stoppt die Animation. Klassen leben im useEffect-Scope (Pattern konsistent mit Particle/PixelVine).

**Gherkin-Referenz:**

- animation-loop-integration.feature: "Spring elements are instantiated once on mount", "All spring elements visible on first frame", "Cleanup on unmount", "PixelSun follows existing class pattern", "PixelGrass follows existing class pattern"
- pixel-sun.feature: "Sun is visible immediately on mount"
- pixel-grass.feature: "Grass is visible immediately on mount"

**Input-Typ:** useEffect-Callback
**Output-Typ:** Instanziierte Objekte, Cleanup-Funktion
**Seiteneffekte:** Event-Listener hinzufuegen/entfernen, requestAnimationFrame starten/stoppen
**Akzeptanzkriterien:**

- Genau 1 PixelSun-Instanz beim Mount
- PixelGrass-Array einmal befuellt beim Mount
- Keine neuen Instanzen in animate()
- Erstes Frame rendert Sun + Grass mit voller Opazitaet
- Cleanup entfernt resize-Listener
- Cleanup stoppt Animation (cancelAnimationFrame)
- Klassen im useEffect-Scope definiert

**Abhaengigkeiten:** AP-014

### TDD-Plan

- **Test 1:** Nach Mount: genau 1 Sun-Instanz, Grass-Array.length > 0.
- **Test 2:** Nach 10 Frames: immer noch gleiche Sun-Instanz (Referenz-Check).
- **Test 3:** Sun und Grass haben beim ersten draw() keine Fade-In-Logik (opacity=1).
- **Test 4:** Cleanup-Funktion ruft cancelAnimationFrame und removeEventListener auf.
- **Test-Typ:** Integration (Mount-Simulation mit Mocks)
- **Test-Daten:** -
- **Red:** Sun/Grass werden nicht instanziiert.
- **Green:** Instantiierung im useEffect, Cleanup-Return.

---

## AP-016: Performance-Budget Validierung

**Beschreibung:** Validierung dass die fillRect-Budgets eingehalten werden. Kein neuer Produktivcode -- nur Tests die bestehende Implementierung pruefen.

**Gherkin-Referenz:**

- pixel-sun.feature: "Sun rendering stays within pixel budget" (<=500 fillRect)
- pixel-grass.feature: "Grass rendering stays within pixel budget" (<=3000 fillRect)
- background.feature: "Gradient rendering stays within pixel budget" (<=270 fillRect bei 1080px)
- animation-loop-integration.feature: "Animation maintains 60fps"

**Input-Typ:** Instanziierte Klassen
**Output-Typ:** Zaehler fuer fillRect-Aufrufe
**Seiteneffekte:** Keine
**Akzeptanzkriterien:**

- PixelSun: <= 500 fillRect pro Frame
- PixelGrass (alle Blades): <= 3000 fillRect pro Frame
- Pixel-Gradient: <= 270 fillRect bei 1080px Hoehe
- Gesamt pro Frame: fluessig bei 60fps (< 16.7ms -- manuell verifizieren)

**Abhaengigkeiten:** AP-005, AP-007, AP-011

### TDD-Plan

- **Test 1:** Mock-ctx zaehlt fillRect-Aufrufe fuer `sun.draw()`, erwartet <= 500.
- **Test 2:** Mock-ctx zaehlt fillRect-Aufrufe fuer alle Grass-Blades, erwartet <= 3000.
- **Test 3:** Mock-ctx zaehlt fillRect-Aufrufe fuer drawPixelGradient(1920, 1080), erwartet <= 270.
- **Test-Typ:** Unit (Mock-ctx mit Counter)
- **Test-Daten:** Standard-Canvas 1920x1080, typische Blade-Anzahl.
- **Red:** Kein Test existiert (Tests pruefen rein -- sollte direkt gruen sein wenn Budget eingehalten).
- **Green:** Bereits durch korrekte Implementierung in AP-003/AP-007/AP-011 erfuellt.

---

## Zusammenfassung

| AP     | Beschreibung                   | Gherkin-Szenarien           | Abhaengigkeiten    | Geschaetzte Zeilen |
| ------ | ------------------------------ | --------------------------- | ------------------ | ------------------ |
| AP-001 | pixelSize globale Konstante    | (Refactoring)               | -                  | ~5                 |
| AP-002 | Feature Toggles deklarieren    | FT-BG, BG-BG                | AP-001             | ~3                 |
| AP-003 | PixelSun Positionierung + Body | PS-1,2,4,6                  | AP-001             | ~40                |
| AP-004 | PixelSun Farbverlauf           | PS-5,7                      | AP-003             | ~20                |
| AP-005 | PixelSun Rays + Animation      | PS-8,9,10,11                | AP-004             | ~45                |
| AP-006 | PixelGrass Blade-Generierung   | PG-1,3,5,11,15,16           | AP-001             | ~35                |
| AP-007 | PixelGrass Rendering + Farbe   | PG-2,4,8,9,13,14            | AP-006             | ~30                |
| AP-008 | PixelGrass Wind-Animation      | PG-6,7,10,12                | AP-007             | ~25                |
| AP-009 | PixelGrass Resize              | PG-17, ALI-6                | AP-006             | ~10                |
| AP-010 | PixelSun Resize                | ALI-5                       | AP-003             | ~10                |
| AP-011 | Pixel-Gradient Hintergrund     | BG-1 bis BG-9               | AP-001             | ~25                |
| AP-012 | Toggle-Logik in animate()      | FT-1 bis FT-5, BG-10        | AP-002             | ~20                |
| AP-013 | Text-Sichtbarkeit              | Klaerung #5                 | AP-001             | ~15                |
| AP-014 | Render-Reihenfolge             | ALI-1,2, BG-7               | AP-003,006,011,012 | ~15                |
| AP-015 | Lifecycle + Cleanup            | ALI-3,4,5,6,7,8,9           | AP-014             | ~20                |
| AP-016 | Performance-Budget Tests       | PS-12, PG-18, BG-11, ALI-10 | AP-005,007,011     | ~0 (nur Tests)     |

**Empfohlene Implementierungsreihenfolge:**

1. AP-001 (Refactoring pixelSize)
2. AP-002 (Toggles deklarieren)
3. AP-003, AP-006, AP-011, AP-013 (parallel moeglich -- unabhaengige Klassen/Funktionen)
4. AP-004, AP-007, AP-010, AP-009 (jeweils nach ihrer Abhaengigkeit)
5. AP-005, AP-008 (Animationen)
6. AP-012 (Toggle-Logik verbindet alles)
7. AP-014 (Render-Reihenfolge)
8. AP-015 (Lifecycle)
9. AP-016 (Performance-Validierung)

**Gesamtumfang:** ~293 Zeilen Produktivcode, 16 Pakete, geschaetzt 6-8 Stunden Pair-Programming.

---

## Review-Ergebnis

**Reviewer:** Review-Agent
**Datum:** 2026-03-10

### Szenario-Zaehlung

Der Plan nennt "38 Gherkin-Szenarien". Die tatsaechliche Zaehlung ergibt:

| Feature File                       | Szenarien |
| ---------------------------------- | --------- |
| feature-toggle.feature             | 5         |
| pixel-sun.feature                  | 12        |
| pixel-grass.feature                | 19        |
| animation-loop-integration.feature | 10        |
| background.feature                 | 11        |
| **Gesamt**                         | **57**    |

**Finding:** Die Uebersicht sagt 38, es sind aber 57. Severity: SOLLTE (korrigieren, da es Verwirrung stiftet).

---

### Gherkin-Abdeckung

#### feature-toggle.feature (5 Szenarien)

- [x] FT-1: "Spring theme activates PixelSun and PixelGrass" --> AP-012
- [x] FT-2: "Spring theme implicitly disables vines" --> AP-012
- [x] FT-3: "Spring theme disabled falls back" --> AP-012
- [x] FT-4: "All themes can be disabled" --> AP-012
- [x] FT-5: "Spring theme coexists with stars" --> AP-012

#### pixel-sun.feature (12 Szenarien)

- [x] PS-1: "Sun horizontally centered" --> AP-003
- [x] PS-2: "Sun positioned above heading" --> AP-003
- [x] PS-3: "Sun visible immediately on mount" --> AP-015
- [x] PS-4: "Sun body has fixed radius" --> AP-003
- [x] PS-5: "Sun core rendered in orange" --> AP-004
- [x] PS-6: "Sun body transitions orange to yellow" --> AP-004
- [x] PS-7: "Sun body is circular pixel art" --> AP-003
- [x] PS-8: "Sun has exactly 12 rays" --> AP-005
- [x] PS-9: "Rays composed of pixel rectangles" --> AP-005
- [x] PS-10: "Rays animate sine oscillation" --> AP-005
- [x] PS-11: "Ray color matches outer body" --> AP-005
- [x] PS-12: "Sun rendering within pixel budget" --> AP-016

#### pixel-grass.feature (19 Szenarien)

- [x] PG-1: "Grass blades span full width" --> AP-006
- [x] PG-2: "Grass blades anchored at bottom" --> AP-007
- [x] PG-3: "Grass blades varying heights" --> AP-006
- [x] PG-4: "Grass blades vertical pixel columns" --> AP-007
- [x] PG-5: "Grass blades mixed widths" --> AP-006
- [x] PG-6: "Grass visible immediately on mount" --> AP-015
- [x] PG-7: "Grass blades are green" --> AP-007
- [x] PG-8: "Grass color may vary by height" --> AP-007
- [x] PG-9: "Wind displaces only tip" --> AP-008
- [x] PG-10: "Grass blades sway right to left" --> AP-008
- [x] PG-11: "Wind uses sine-based oscillation" --> AP-008
- [x] PG-12: "Wind animation continuous and smooth" --> AP-008
- [x] PG-13: "Grass rendered using pixel-art fillRect" --> AP-007
- [x] PG-14: "Grass renders behind text layer" --> AP-007 (implizit durch Canvas z-index)
- [x] PG-15: "Grass count adapts to screen width" --> AP-006
- [x] PG-16: "Grass blade array fully regenerated on resize" --> AP-009
- [x] PG-17: "Grass rendering within pixel budget" --> AP-016
- [x] PG-18: "Grass handles very narrow viewport" --> AP-006
- [x] PG-19: "Grass handles very wide viewport" --> AP-006

**Hinweis:** Die Zusammenfassungstabelle referenziert PG-1 bis PG-18, es gibt aber 19 PG-Szenarien. PG-19 ("very wide viewport") fehlt in der Tabelle, ist aber inhaltlich durch AP-006 Test 3 (Gap-Pruefung) und Test-Daten (canvasWidth=3840) abgedeckt.

#### animation-loop-integration.feature (10 Szenarien)

- [x] ALI-1: "Spring elements render in correct order" --> AP-014
- [x] ALI-2: "Stars render before spring elements" --> AP-014
- [x] ALI-3: "Spring elements instantiated once on mount" --> AP-015
- [x] ALI-4: "All spring elements visible on first frame" --> AP-015
- [x] ALI-5: "Sun repositioned on resize" --> AP-010
- [x] ALI-6: "Grass blade array regenerated on resize" --> AP-009
- [x] ALI-7: "Cleanup on unmount" --> AP-015
- [x] ALI-8: "PixelSun follows existing class pattern" --> AP-015
- [x] ALI-9: "PixelGrass follows existing class pattern" --> AP-015
- [x] ALI-10: "Animation maintains 60fps" --> AP-016

#### background.feature (11 Szenarien)

- [x] BG-1: "Black background when disabled" --> AP-011 / AP-012
- [x] BG-2: "Pixel gradient rendered when enabled" --> AP-011
- [x] BG-3: "Gradient color at bottom is white" --> AP-011
- [x] BG-4: "Gradient color at top is light blue" --> AP-011
- [x] BG-5: "Gradient transitions light blue to white" --> AP-011
- [x] BG-6: "Gradient in discrete pixel steps" --> AP-011
- [x] BG-7: "Gradient rendered on canvas not CSS" --> AP-011
- [x] BG-8: "Gradient drawn before all other elements" --> AP-014
- [x] BG-9: "Gradient covers full canvas after resize" --> AP-011 (implizit, da Gradient pro Frame neu gezeichnet wird)
- [x] BG-10: "Pixel background toggle independent of spring theme" --> AP-012
- [x] BG-11: "Gradient rendering within pixel budget" --> AP-016

**Ergebnis:** Alle 57 Gherkin-Szenarien sind durch mindestens ein Arbeitspaket abgedeckt. Kein Szenario fehlt.

---

### Findings pro Arbeitspaket

**AP-001: pixelSize als globale Konstante**

- Severity: OK
- Sauber abgegrenztes Refactoring. Test ist atomar und unabhaengig. ~5 Zeilen realistisch.

**AP-002: Feature Toggles deklarieren**

- Severity: SOLLTE
- Finding: Die Abhaengigkeit von AP-001 ist unnoetig. Feature Toggles haben keine technische Abhaengigkeit von PIXEL_SIZE. Sie koennten parallel zu AP-001 implementiert werden.
- Empfehlung: Abhaengigkeit zu AP-001 entfernen. AP-002 hat keine Abhaengigkeiten.

**AP-003: PixelSun Positionierung + Body**

- Severity: SOLLTE
- Finding 1: Das Gherkin-Szenario PS-2 ("Sun does not overlap with heading text area") wird in den Akzeptanzkriterien nicht explizit geprueft. `centerY = canvasHeight * 0.3` ist zwar die Implementierung, aber es fehlt ein Akzeptanzkriterium das die Nicht-Ueberlappung mit dem Heading verifiziert.
- Empfehlung: Akzeptanzkriterium ergaenzen: "Sun (centerY + radius + maxRayLength) < canvasHeight \* 0.45 (obere Grenze des Heading-Bereichs)".
- Finding 2: ~40 Zeilen ist ambitioniert fuer Konstruktor + draw() mit Pixel-Kreis-Logik. Koennte knapp werden aber ist machbar.

**AP-004: PixelSun Farbverlauf**

- Severity: OK
- Sauber isoliert. Test-Daten sind konkret. Red/Green-Kriterium klar. ~20 Zeilen realistisch.

**AP-005: PixelSun Rays + Animation**

- Severity: SOLLTE
- Finding 1: ~45 Zeilen fuer 12 Rays mit Sinus-Animation, Ray-Rendering UND update()-Logik ist an der Grenze. Ray-Berechnung (Winkel, Start/End-Punkte) plus Rendering plus Animation in einer Funktion ist viel.
- Finding 2: Das Gherkin-Szenario PS-11 erwaehnt "Ray opacity may decrease toward the tip". Dies fehlt in den Akzeptanzkriterien und im TDD-Plan.
- Empfehlung: (1) Ueberleg ob Ray-Berechnung und Ray-Animation in zwei Pakete aufgeteilt werden sollten. (2) Akzeptanzkriterium fuer optionalen Alpha-Gradient an Ray-Spitzen ergaenzen oder bewusst als "Nice-to-have" markieren.

**AP-006: PixelGrass Blade-Generierung**

- Severity: OK
- Hervorragend spezifiziert. 6 Tests mit konkreten Werten. Edge Cases (320px, 3840px) abgedeckt. ~35 Zeilen realistisch.

**AP-007: PixelGrass Rendering + Farbe**

- Severity: OK
- Sauber isoliert. Test fuer Farbvariation und Hoehen-Gradient ist konkret.
- Hinweis: PG-14 ("Grass renders behind text layer") ist hier zugeordnet, ist aber eigentlich ein CSS/DOM-Aspekt der bereits durch die bestehende Canvas-Architektur erfuellt ist. Kein Handlungsbedarf, nur zur Klarstellung.

**AP-008: PixelGrass Wind-Animation**

- Severity: OK
- Sehr gut spezifiziert. Test 4 (Links-Bias-Durchschnitt) ist clever. Frame-Sprung-Test (< 3px) direkt aus Gherkin uebernommen. ~25 Zeilen realistisch.

**AP-009: PixelGrass Resize-Regenerierung**

- Severity: OK
- Einfach und klar. ~10 Zeilen realistisch. Tests atomar.

**AP-010: PixelSun Resize-Repositionierung**

- Severity: OK
- Einfach und klar. ~10 Zeilen realistisch.

**AP-011: Pixel-Gradient Hintergrund**

- Severity: SOLLTE
- Finding: BG-1 ("Black background when pixel background disabled") ist hier referenziert, aber die eigentliche Logik (Guard: kein Gradient wenn ENABLE_PIXEL_BACKGROUND=false) gehoert eher zu AP-012 (Toggle-Logik). AP-011 sollte nur die reine drawPixelGradient-Funktion implementieren, die Guard-Logik ist in AP-012.
- Empfehlung: BG-1 aus der Gherkin-Referenz von AP-011 entfernen und nur bei AP-012 listen.

**AP-012: Toggle-Logik in animate()**

- Severity: SOLLTE
- Finding: Der TDD-Plan testet Mock-Objekte fuer Sun/Grass/Vines. Das setzt voraus, dass die animate()-Funktion testbar ist -- aktuell ist sie tief im useEffect verschachtelt. Der Plan beschreibt nicht, wie die Testbarkeit hergestellt wird (z.B. Extraktion in eine testbare Funktion).
- Empfehlung: Im TDD-Plan ergaenzen, wie die Guard-Logik isoliert getestet wird. Moeglicherweise eine `renderFrame(ctx, config)` Helper-Funktion extrahieren die testbar ist.

**AP-013: Text-Sichtbarkeit bei Gradient**

- Severity: SOLLTE
- Finding 1: "Klaerung #5" als Gherkin-Referenz ist kein konkretes Szenario. Dieses Arbeitspaket hat kein eigenes Gherkin-Feature-File. Das ist in Ordnung (es kommt aus den vereinbarten Erweiterungen), sollte aber explizit erwaehnt werden.
- Finding 2: Die Akzeptanzkriterien erwaehnen "Icons/Buttons ebenfalls angepasst", aber der TDD-Plan prueft nur h1. Icons/Buttons fehlen im Test.
- Empfehlung: (1) Test fuer Icons/Buttons ergaenzen oder "Icons/Buttons" aus den Akzeptanzkriterien entfernen wenn nicht im Scope. (2) Gherkin-Szenario nachtraeglich fuer Text-Sichtbarkeit erstellen.

**AP-014: Render-Reihenfolge**

- Severity: OK
- Guter Integrationstest-Ansatz mit Aufruf-Protokoll. ~15 Zeilen realistisch.
- Hinweis: Selbes Testbarkeits-Thema wie AP-012 -- animate() muss testbar sein.

**AP-015: Lifecycle + Cleanup**

- Severity: SOLLTE
- Finding: Dieses Paket traegt 7+ Gherkin-Szenarien (ALI-3,4,5,6,7,8,9 plus PS-3, PG-6). Das ist sehr viel fuer ein einzelnes Paket. Die Akzeptanzkriterien umfassen Instantiierung, Opacity, Cleanup, Event-Listener, cancelAnimationFrame -- mindestens 3 verschiedene Verantwortlichkeiten.
- Empfehlung: Aufteilen in:
  - AP-015a: Instantiierung im useEffect (PixelSun + PixelGrass anlegen)
  - AP-015b: Cleanup (removeEventListener + cancelAnimationFrame)
  - Das wuerde besser zur MAD-Regel "Max 1 Verantwortlichkeit" passen.

**AP-016: Performance-Budget Validierung**

- Severity: OK
- Reine Test-Validierung, kein Produktivcode. Sinnvoll als letztes Paket. ALI-10 (60fps) wird als "manuell verifizieren" markiert -- das ist pragmatisch und ehrlich.

---

### Abhaengigkeits-Graph Pruefung

- **Zirkulaere Abhaengigkeiten:** Keine gefunden. Graph ist ein DAG.
- **Parallelisierbar aber sequentiell geplant:** AP-003, AP-006, AP-011, AP-013 sind korrekt als parallelisierbar erkannt (Zeile 610). Gut.
- **Unnoetige Abhaengigkeit:** AP-002 --> AP-001 (siehe Finding oben). Toggles haengen nicht von PIXEL_SIZE ab.
- **Fehlende Abhaengigkeit:** AP-013 hat Abhaengigkeit nur zu AP-001, braucht aber konzeptionell AP-002 (die Toggle-Konstanten). Die Implementierung nutzt ENABLE_PIXEL_BACKGROUND und ENABLE_SPRING_THEME.
- Empfehlung: AP-013 Abhaengigkeit um AP-002 ergaenzen.

---

### Scope-Checklist

- [x] Plan deckt gesamte Feature-Beschreibung ab (Pixel-Sonne, Farbverlauf, Strahlen, Grashalme, Wind-Animation)
- [x] Vereinbarte Erweiterungen abgedeckt (Gradient-BG: AP-011, Text-Farbe: AP-013, Feature-Toggles: AP-002/AP-012)
- [x] Kein Scope-Creep (alle Pakete lassen sich auf Feature-Beschreibung oder vereinbarte Erweiterungen zurueckfuehren)
- [x] Prioritaeten klar (Reihenfolge durch Abhaengigkeitsgraph definiert)

---

### Gesamtbewertung

- [x] Plan ist grundsaetzlich bereit zur Implementierung
- [x] Plan benoetigt kleinere Anpassungen (SOLLTE-Findings)

**Zusammenfassung der SOLLTE-Findings (vor Implementierung fixen):**

| #   | AP     | Finding                                                                                                 |
| --- | ------ | ------------------------------------------------------------------------------------------------------- |
| 1   | Kopf   | Szenario-Zaehlung korrigieren: 57 statt 38                                                              |
| 2   | AP-002 | Unnoetige Abhaengigkeit zu AP-001 entfernen                                                             |
| 3   | AP-003 | Akzeptanzkriterium fuer Nicht-Ueberlappung mit Heading ergaenzen                                        |
| 4   | AP-005 | Ray-Opacity an Spitzen als Akzeptanzkriterium oder Nice-to-have                                         |
| 5   | AP-011 | BG-1 Referenz nach AP-012 verschieben                                                                   |
| 6   | AP-012 | Testbarkeit der animate()-Guards beschreiben                                                            |
| 7   | AP-013 | Test fuer Icons/Buttons ergaenzen oder aus Akzeptanzkriterien streichen; Abhaengigkeit AP-002 ergaenzen |
| 8   | AP-015 | Aufteilen in Instantiierung + Cleanup (2 Verantwortlichkeiten)                                          |

**MUSS-Findings:** Keine. Der Plan ist solide und kann nach den SOLLTE-Anpassungen direkt implementiert werden.

**Staerken des Plans:**

- Sehr konkrete Test-Daten und Akzeptanzkriterien
- Sauberer Abhaengigkeitsgraph ohne Zyklen
- Gute Parallelisierungs-Erkennung
- Performance-Budget als eigenes Validierungs-Paket am Ende
- Realistische Zeilenschaetzungen (bis auf AP-005)

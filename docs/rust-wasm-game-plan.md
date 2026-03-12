# Entwicklungsplan: Rust lernen & WASM-Spiel bauen

## Projektziel

Ein minimalistisches Endless-Runner-Spiel in Rust + WebAssembly für die Hauptseite von jwiegmann.de. Ein kleiner Pixel-Entwickler springt über Hindernisse (Bugs). Das Spiel wird unterhalb der Social-Icons platziert.

---

## Projekt-Setup: Eigenes Repository?

**Empfehlung: Ja, eigenes GitHub-Repository für das Rust-Projekt.**

**Repository:**

- **Name:** `bug-jumper`
- **Description:** A small game for my website for learning rust

**Vorteile:**

- Saubere Git-History für dein Lernprojekt (viele kleine Commits beim Experimentieren)
- Eigene Cargo.toml ohne Konflikte mit dem Blog-Repo
- Unabhängiges CI/CD möglich (z.B. automatische WASM-Builds)
- Rust-Projekt kann später auch für andere Zwecke genutzt werden
- Blog-Repo bleibt clean - nur das fertige WASM-Output wird integriert

**Struktur:**

```
bug-jumper/
├── exercises/              # Phase 1 Übungen
│   ├── 01-hello-world/
│   ├── 02-variables/
│   ├── 03-functions/
│   └── ...
│
├── src/                    # Das eigentliche Spiel (Phase 3)
│   ├── lib.rs
│   ├── game.rs
│   └── ...
├── Cargo.toml
├── pkg/                    # wasm-pack Output
└── README.md
```

**Integration später (Phase 3.13):**

- WASM aus `rust-jump-game/pkg/` nach `jwiegmann.de/public/wasm/` kopieren
- Manuell oder per Build-Script
- Optional: Als Git Submodule einbinden

**Für Phase 1 (Rust lernen):**

Du kannst auch erstmal lokal ohne GitHub arbeiten. Ein Repo lohnt sich spätestens wenn du in Phase 2/3 das eigentliche Spiel baust.

---

## Phase 1: Rust Grundlagen verstehen

### 1.1 Was ist Rust?

**Ziel:** Verstehen, was Rust von anderen Sprachen unterscheidet.

**Lerninhalt:**

- Kompilierte vs. interpretierte Sprachen
  - Kompiliert: Quellcode → Maschinencode → Ausführung (C, C++, Rust, Go)
  - Interpretiert: Quellcode → Interpreter führt aus (Python, JavaScript)
  - Rust ist kompiliert → schnell, aber Kompilierzeit nötig

- **Warum Rust? Die vier Kernversprechen:**

  **1. Memory Safety ohne Garbage Collector**

  Das Problem: In C/C++ musst du Speicher manuell verwalten (`malloc`/`free`). Das führt zu Bugs:
  - Use-after-free: Speicher nutzen der schon freigegeben wurde
  - Double-free: Speicher zweimal freigeben
  - Memory Leaks: Speicher nie freigeben
  - Dangling Pointers: Zeiger auf ungültigen Speicher

  Die Lösungen anderer Sprachen:
  - Java, Go, JavaScript: Garbage Collector räumt automatisch auf → Runtime-Overhead, Pausen
  - C/C++: Manuell → schnell, aber fehleranfällig

  Rust's Lösung: Das Ownership-System. Der Compiler prüft zur Compile-Zeit, dass Speicher korrekt verwaltet wird. Kein GC nötig, trotzdem sicher. Du lernst das in Paket 1.10-1.12.

  **2. Zero-Cost Abstractions**

  High-Level-Code (Iteratoren, Generics, Pattern Matching) kompiliert zu genauso schnellem Maschinencode wie handgeschriebener Low-Level-Code. Du "bezahlst" keinen Performance-Overhead für Lesbarkeit.

  Beispiel: Eine `for`-Schleife über einen Iterator ist genauso schnell wie eine manuelle Pointer-Arithmetik in C - der Compiler optimiert das weg.

  **3. Fearless Concurrency**

  Multi-Threading ist in den meisten Sprachen fehleranfällig (Race Conditions, Deadlocks). Rust's Ownership-System verhindert Data Races zur Compile-Zeit. Wenn dein Code kompiliert, sind bestimmte Klassen von Concurrency-Bugs ausgeschlossen.

  Für dieses Projekt nicht relevant (Browser-Spiel ist Single-Threaded), aber gut zu wissen.

  **4. Modernes Tooling (Cargo)**

  Cargo ist Rust's Build-System und Package-Manager in einem:
  - Dependency-Management (wie npm/Maven)
  - Build-System (kompilieren, testen, dokumentieren)
  - Einheitlich für alle Rust-Projekte
  - Crates.io als zentrales Package-Repository

  Du nutzt Cargo ab Paket 1.2 durchgehend.

- Der Rust Compiler als "strenger Lehrer"
  - Viele Fehler werden zur Compile-Zeit gefangen
  - Compiler-Fehlermeldungen sind sehr hilfreich - sie erklären oft WAS falsch ist und WIE man es fixt

**Output:** Du kannst die vier Kernversprechen von Rust erklären und verstehst warum Ownership wichtig ist.

**Ressourcen:**

- [The Rust Book - Foreword](https://doc.rust-lang.org/book/foreword.html)
- [The Rust Book - Chapter 1](https://doc.rust-lang.org/book/ch01-00-getting-started.html)

---

### 1.2 Installation & Setup

**Ziel:** Rust-Entwicklungsumgebung einrichten.

**Aufgaben:**

- [ ] rustup installieren (Rust Toolchain Manager)
- [ ] `rustc --version` und `cargo --version` prüfen
- [ ] IDE einrichten: IntelliJ IDEA mit dem "Rust" Plugin (von JetBrains)
  - Das Plugin nutzt intern rust-analyzer
  - Bietet Code-Completion, Refactoring, Debugging
  - Alternative: VS Code mit "rust-analyzer" Extension
- [ ] Ein neues Projekt mit `cargo new hello_rust` erstellen
- [ ] Projektstruktur verstehen:
  ```
  hello_rust/
  ├── Cargo.toml    # Projekt-Konfiguration (wie package.json)
  ├── Cargo.lock    # Dependency Lock (wie package-lock.json)
  └── src/
      └── main.rs   # Einstiegspunkt
  ```

**Output:** Funktionierendes Rust-Setup, erstes Cargo-Projekt angelegt.

**Übung:** Führe `cargo build` und `cargo run` aus. Was ist der Unterschied?

---

### 1.3 Hello World & Cargo Basics

**Ziel:** Erstes Programm kompilieren und ausführen, Cargo-Befehle kennen.

**Lerninhalt:**

- `fn main()` - Einstiegspunkt jedes Rust-Programms
- `println!()` - Makro (!) für Ausgabe
- Unterschied Makro vs. Funktion (Makros haben `!`)
- Wichtige Cargo-Befehle:
  - `cargo new` - Neues Projekt
  - `cargo build` - Kompilieren
  - `cargo run` - Kompilieren + Ausführen
  - `cargo check` - Schnelle Syntax-Prüfung ohne Build
  - `cargo build --release` - Optimierter Build

**Output:** "Hello, World!" läuft, Cargo-Workflow verstanden.

**Übung:** Ändere die Ausgabe zu "Hallo, ich lerne Rust!" und führe es aus.

---

### 1.4 Variablen & Mutability

**Ziel:** Verstehen, wie Variablen in Rust funktionieren.

**Lerninhalt:**

- `let` - Variablen sind standardmäßig **immutable**!
- `let mut` - Explizit mutable machen
- Warum immutable by default? (Sicherheit, Vorhersagbarkeit)
- Shadowing - Variable mit gleichem Namen neu deklarieren
- Konstanten mit `const` (SCREAMING_SNAKE_CASE)

**Konzept:**

```rust
let x = 5;      // immutable
x = 6;          // FEHLER!

let mut y = 5;  // mutable
y = 6;          // OK

let x = x + 1;  // Shadowing - OK, neue Variable
```

**Output:** Du verstehst den Unterschied zwischen `let`, `let mut` und Shadowing.

**Übung:**

1. Erstelle eine immutable Variable und versuche sie zu ändern. Lies die Fehlermeldung.
2. Erstelle eine mutable Variable und ändere sie.
3. Nutze Shadowing um eine Variable neu zu definieren.

---

### 1.5 Datentypen

**Ziel:** Die grundlegenden Datentypen in Rust kennen.

**Lerninhalt:**

**Skalare Typen:**

- Integers: `i8`, `i16`, `i32`, `i64`, `i128`, `isize` (signed)
- Integers: `u8`, `u16`, `u32`, `u64`, `u128`, `usize` (unsigned)
- Floats: `f32`, `f64`
- Boolean: `bool` (`true`, `false`)
- Character: `char` (Unicode, 4 Bytes)

**Compound Typen:**

- Tuple: `let tup: (i32, f64, bool) = (500, 6.4, true);`
- Array: `let arr: [i32; 5] = [1, 2, 3, 4, 5];` (feste Größe!)

**Type Inference:**

- Rust leitet Typen oft automatisch ab
- Manchmal muss man explizit sein: `let x: i32 = 5;`

**Output:** Du kennst die wichtigsten Datentypen und weißt wann welcher sinnvoll ist.

**Übung:**

1. Erstelle Variablen verschiedener Typen und gib sie mit `println!("{}", var)` aus.
2. Erstelle ein Tuple mit deinem Namen, Alter und ob du Kaffee magst. Greife auf einzelne Werte zu.
3. Erstelle ein Array mit 5 Zahlen und greife auf das dritte Element zu.

---

### 1.6 Slices & Strings

**Ziel:** Den Unterschied zwischen `String` und `&str` verstehen - kritisch für WASM!

**Lerninhalt:**

**Zwei String-Typen:**

- `String` - Owned, auf dem Heap, veränderbar
- `&str` - String Slice, Referenz auf String-Daten, nicht owned

**Warum wichtig?**

- Bei WASM übergibst du oft `&str` an Funktionen
- Verstehen wann du welchen brauchst verhindert viele Compiler-Fehler

**Konzept:**

```rust
let s: String = String::from("Hello");  // Owned String
let slice: &str = &s;                   // Slice/Referenz auf s
let literal: &str = "World";            // String Literal ist auch &str

// String zu &str: einfach &
// &str zu String: .to_string() oder String::from()
```

**Slices allgemein:**

```rust
let arr = [1, 2, 3, 4, 5];
let slice: &[i32] = &arr[1..4];  // [2, 3, 4]
```

**Output:** Du verstehst wann `String` und wann `&str` verwendet wird.

**Übung:**

1. Erstelle einen `String` und einen `&str`. Konvertiere zwischen beiden.
2. Schreibe eine Funktion die einen `&str` nimmt (funktioniert mit beiden!).
3. Erstelle einen Slice aus einem Array und iteriere darüber.

---

### 1.7 Funktionen

**Ziel:** Funktionen definieren und aufrufen.

**Lerninhalt:**

- Funktionssyntax: `fn name(param: Type) -> ReturnType { }`
- Parameter müssen immer einen Typ haben
- Rückgabewert: letzte Expression ohne `;` ODER `return`
- Statements vs. Expressions
  - Statement: führt aus, gibt nichts zurück (hat `;`)
  - Expression: gibt einen Wert zurück (kein `;`)
- Unit Type `()` - "nichts" zurückgeben

**Konzept:**

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b  // Expression - wird zurückgegeben (kein ;)
}

fn print_sum(a: i32, b: i32) {  // gibt () zurück
    println!("{}", a + b);      // Statement (hat ;)
}
```

**Output:** Du kannst Funktionen mit Parametern und Rückgabewerten schreiben.

**Übung:**

1. Schreibe eine Funktion `multiply(a, b)` die zwei Zahlen multipliziert.
2. Schreibe eine Funktion `is_even(n)` die prüft ob eine Zahl gerade ist.
3. Schreibe eine Funktion die einen `&str` Namen nimmt und "Hallo {name}!" ausgibt.

---

### 1.8 Control Flow: if/else

**Ziel:** Bedingte Ausführung verstehen.

**Lerninhalt:**

- `if`, `else if`, `else`
- Bedingung muss `bool` sein (kein implizites "truthy/falsy" wie in JS!)
- `if` als Expression (kann Wert zurückgeben)

**Konzept:**

```rust
let number = 5;

if number > 0 {
    println!("positiv");
} else if number < 0 {
    println!("negativ");
} else {
    println!("null");
}

// if als Expression
let category = if number > 10 { "groß" } else { "klein" };
```

**Output:** Du kannst Verzweigungen schreiben und `if` als Expression nutzen.

**Übung:**

1. Schreibe eine Funktion `grade(score)` die basierend auf einer Punktzahl (0-100) eine Note zurückgibt.
2. Nutze `if` als Expression um einer Variable einen Wert zuzuweisen.

---

### 1.9 Control Flow: Loops

**Ziel:** Die verschiedenen Loop-Arten in Rust beherrschen.

**Lerninhalt:**

**`loop` - Endlosschleife:**

- Läuft bis `break`
- Kann einen Wert zurückgeben: `break 42;`

**`while` - Bedingte Schleife:**

- Läuft solange Bedingung `true`

**`for` - Iterator-Schleife:**

- `for i in 0..5` - Range (0 bis 4)
- `for i in 0..=5` - Inclusive Range (0 bis 5)
- `for item in collection` - Über Collection iterieren

**Output:** Du kennst alle Loop-Arten und weißt wann welche passt.

**Übung:**

1. Schreibe einen Countdown von 10 bis 0 mit `while`.
2. Berechne die Summe von 1 bis 100 mit einer `for`-Schleife.
3. Nutze `loop` mit `break` um die erste Zahl > 1000 zu finden die durch 7 teilbar ist.

---

### 1.10 Ownership - Das Herzstück von Rust

**Ziel:** Das Ownership-System verstehen - DAS zentrale Konzept in Rust.

**Lerninhalt:**

**Die drei Ownership-Regeln:**

1. Jeder Wert hat genau einen Owner (Variable)
2. Es kann nur einen Owner gleichzeitig geben
3. Wenn der Owner out of scope geht, wird der Wert dropped (freigegeben)

**Move Semantik:**

- Bei Zuweisung wird Ownership übertragen (moved)
- Der alte Owner ist danach ungültig

**Copy Trait:**

- Einfache Typen (integers, bool, char, floats) werden kopiert statt moved
- Sie implementieren den `Copy` Trait

**Clone:**

- Explizite tiefe Kopie mit `.clone()`
- Beide Variablen bleiben gültig

**Warum das alles?**

- Keine Garbage Collection nötig
- Keine Dangling Pointers
- Keine Double Free Errors
- Memory Safety zur Compile-Zeit garantiert

**Output:** Du verstehst warum Rust Ownership hat und wie Move/Copy funktioniert.

**Übung:**

1. Erstelle zwei Strings und versuche einen zu "moven". Beobachte den Compiler-Fehler.
2. Nutze `.clone()` um das Problem zu lösen.
3. Mache das gleiche mit Integers - warum funktioniert es ohne Clone?

---

### 1.11 References & Borrowing

**Ziel:** Daten "ausleihen" ohne Ownership zu übertragen.

**Lerninhalt:**

**Immutable References (`&`):**

- Erlaubt Lesezugriff ohne Ownership zu nehmen
- Beliebig viele gleichzeitig möglich

**Mutable References (`&mut`):**

- Erlaubt Schreibzugriff
- Nur EINE gleichzeitig erlaubt

**Die Borrowing-Regeln:**

1. Beliebig viele `&` ODER genau eine `&mut` (nie beides gleichzeitig)
2. References müssen immer gültig sein (keine Dangling References)

**Output:** Du kannst References nutzen um Daten zu leihen statt zu bewegen.

**Übung:**

1. Schreibe eine Funktion die die Länge eines Strings ausgibt ohne Ownership zu übernehmen.
2. Schreibe eine Funktion die einen String verändert (nimmt `&mut String`).
3. Versuche zwei mutable References gleichzeitig zu erstellen - lies den Fehler.

---

### 1.12 Lifetimes (Basics)

**Ziel:** Verstehen was Lifetimes sind und warum der Compiler manchmal danach fragt.

**Lerninhalt:**

**Was sind Lifetimes?**

- Jede Reference hat eine Lifetime (Lebensdauer)
- Der Compiler prüft, dass References nie länger leben als die Daten auf die sie zeigen
- Meistens inferiert der Compiler Lifetimes automatisch

**Wann muss man sie angeben?**

- Wenn eine Funktion References zurückgibt
- Wenn der Compiler nicht eindeutig ableiten kann, welche Lifetime gemeint ist

**Syntax:**

```rust
// Lifetime-Parameter 'a sagt: Rückgabe lebt so lange wie der Input
fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() > b.len() { a } else { b }
}
```

**Für jetzt reicht:**

- Verstehen was der Compiler meint wenn er nach Lifetimes fragt
- Bei Fehlern: Oft hilft es, owned Typen (`String`) statt References (`&str`) zu verwenden

**Output:** Du verstehst Lifetime-Fehlermeldungen und kannst sie beheben.

**Übung:**

1. Schreibe eine Funktion die den längeren von zwei `&str` zurückgibt - der Compiler wird nach Lifetimes fragen.
2. Lies die Fehlermeldung und füge den Lifetime-Parameter hinzu.

---

### 1.13 Structs

**Ziel:** Eigene Datentypen mit Structs erstellen.

**Lerninhalt:**

**Struct Definition:**

- Gruppiert zusammengehörige Daten
- Felder haben Namen und Typen

**Methoden mit `impl`:**

- Assoziierte Funktionen: kein `self` Parameter (wie `new()`)
- Methoden: haben `&self` oder `&mut self`

**Output:** Du kannst Structs definieren und Methoden implementieren.

**Übung:**

1. Erstelle einen `Rectangle` Struct mit `width` und `height`.
2. Implementiere eine assoziierte Funktion `new(width, height)`.
3. Implementiere eine Methode `area(&self)` die die Fläche berechnet.
4. Implementiere eine Methode `scale(&mut self, factor)` die die Größe ändert.

---

### 1.14 Traits

**Ziel:** Verstehen was Traits sind - wichtig für WASM-Interop!

**Lerninhalt:**

**Was sind Traits?**

- Definieren gemeinsames Verhalten (wie Interfaces in anderen Sprachen)
- Typen können Traits implementieren

**Wichtige Standard-Traits:**

- `Debug` - für `println!("{:?}", x)`
- `Clone` - für `.clone()`
- `Copy` - für implizites Kopieren
- `Default` - für Standardwerte

**Derive-Makro:**

```rust
#[derive(Debug, Clone)]
struct Player {
    x: f64,
    y: f64,
}
```

**Warum wichtig für WASM?**

- `wasm-bindgen` nutzt Traits für JS-Interop
- `dyn_into()` konvertiert zwischen Typen via Traits

**Output:** Du verstehst was Traits sind und kannst `#[derive()]` nutzen.

**Übung:**

1. Erstelle einen Struct und derive `Debug`. Gib ihn mit `{:?}` aus.
2. Derive auch `Clone` und klone eine Instanz.
3. Implementiere einen eigenen Trait `Drawable` mit einer Methode `draw(&self)`.

---

### 1.15 Enums & Pattern Matching

**Ziel:** Enums und das mächtige Pattern Matching verstehen.

**Lerninhalt:**

**Enum Definition:**

- Kann verschiedene Varianten haben
- Varianten können Daten enthalten

**Pattern Matching mit `match`:**

- Muss exhaustive sein (alle Fälle abdecken)
- `_` als Catch-All

**Option Enum:**

- `Some(T)` oder `None`
- Rust's Art "null" sicher zu handhaben

**`if let` Kurzform:**

- Wenn nur ein Fall interessant ist

**Output:** Du kannst Enums definieren und mit match/if let darauf reagieren.

**Übung:**

1. Erstelle ein `Direction` Enum (Up, Down, Left, Right).
2. Schreibe eine Funktion die basierend auf Direction x/y Koordinaten verändert.
3. Nutze `Option<String>` für einen optionalen Spielernamen und handle beide Fälle.

---

### 1.16 Error Handling

**Ziel:** Fehlerbehandlung in Rust verstehen.

**Lerninhalt:**

**Zwei Arten von Fehlern:**

1. Unrecoverable: `panic!()` - Programm stürzt ab
2. Recoverable: `Result<T, E>` - Fehler kann behandelt werden

**Result Enum:**

- `Ok(T)` - Erfolg mit Wert
- `Err(E)` - Fehler mit Fehlerinfo

**Fehler behandeln:**

- `match` - Explizit beide Fälle
- `.unwrap()` - Panic bei Fehler
- `.expect("msg")` - Panic mit Message
- `?` Operator - Fehler weitergeben

**Output:** Du verstehst Result/Option und kannst Fehler sinnvoll behandeln.

**Übung:**

1. Schreibe eine Funktion die einen String zu einer Zahl parsed und `Result` zurückgibt.
2. Behandle den Fehler mit `match`.
3. Schreibe eine zweite Funktion die den `?` Operator nutzt.

---

### 1.17 Vectors & Collections

**Ziel:** Dynamische Datenstrukturen nutzen.

**Lerninhalt:**

**Vector (`Vec<T>`):**

- Dynamische Größe (im Gegensatz zu Arrays)
- `Vec::new()` oder `vec![]` Makro
- `.push()`, `.pop()`, `.get()`, Indexzugriff

**HashMap:**

- Key-Value Paare
- `HashMap::new()`, `.insert()`, `.get()`

**Iterieren:**

- `for item in &vec` - Immutable
- `for item in &mut vec` - Mutable
- `for item in vec` - Konsumiert den Vector

**Output:** Du kannst mit dynamischen Collections arbeiten.

**Übung:**

1. Erstelle einen Vector mit 5 Zahlen, füge 2 weitere hinzu, entferne die erste.
2. Iteriere über den Vector und berechne die Summe.
3. Erstelle eine HashMap für Highscores (Name → Score).

---

### 1.18 Closures

**Ziel:** Anonyme Funktionen verstehen - wichtig für WASM Callbacks!

**Lerninhalt:**

**Was sind Closures?**

- Anonyme Funktionen die Variablen aus der Umgebung "einfangen" können
- Syntax: `|params| expression` oder `|params| { statements }`

**Capturing:**

- Closures können Variablen aus dem umgebenden Scope nutzen
- By Reference (default), By Mutable Reference, oder By Value (`move`)

**Warum wichtig für WASM?**

- `requestAnimationFrame` braucht einen Callback
- Event Listener brauchen Callbacks
- In Rust sind das Closures

**Konzept:**

```rust
let factor = 2;
let multiply = |x| x * factor;  // captured factor by reference
println!("{}", multiply(5));    // 10

let nums = vec![1, 2, 3];
let doubled: Vec<_> = nums.iter().map(|x| x * 2).collect();
```

**Output:** Du kannst Closures schreiben und verstehst wie sie Variablen einfangen.

**Übung:**

1. Erstelle eine Closure die zwei Zahlen addiert.
2. Erstelle eine Closure die eine Variable aus der Umgebung nutzt.
3. Nutze `.map()` mit einer Closure um alle Zahlen in einem Vector zu verdoppeln.

---

### 1.19 Modules & Crates

**Ziel:** Code organisieren und externe Packages nutzen.

**Lerninhalt:**

**Module:**

- `mod name { }` - Inline Modul
- `mod name;` - Modul aus Datei `name.rs`
- `pub` - Öffentlich machen
- `use` - Importieren

**Crates:**

- Externe Packages in `Cargo.toml` unter `[dependencies]`
- Mit `use crate_name::...` importieren

**Output:** Du kannst Code in Module aufteilen und externe Crates nutzen.

**Übung:**

1. Erstelle ein Modul `math` mit Funktionen `add` und `multiply`.
2. Nutze `pub` um die Funktionen von außen zugänglich zu machen.
3. Füge die `rand` Crate hinzu und generiere eine Zufallszahl.

---

## Phase 2: WebAssembly Grundlagen

### 2.1 Was ist WebAssembly?

**Ziel:** WASM-Konzepte verstehen.

**Lerninhalt:**

- WebAssembly (WASM) = Binärformat das im Browser läuft
- Nahezu native Performance
- Kompilierungsziel für viele Sprachen (Rust, C, C++, Go...)
- Läuft in einer Sandbox (sicher)
- Kann mit JavaScript kommunizieren
- Kein direkter DOM-Zugriff (muss über JS Bridge)

**Rust → WASM Workflow:**

1. Rust Code schreiben
2. Mit `wasm-pack` zu WASM kompilieren
3. JavaScript Bindings werden generiert
4. Im Browser importieren und nutzen

**Output:** Du verstehst was WASM ist und wie Rust zu WASM wird.

**Ressourcen:**

- [Rust and WebAssembly Book](https://rustwasm.github.io/docs/book/)

---

### 2.2 wasm-pack Setup

**Ziel:** WASM-Toolchain einrichten.

**Aufgaben:**

- [ ] wasm-pack installieren: `cargo install wasm-pack`
- [ ] Neues Projekt erstellen und Cargo.toml konfigurieren:
  - `crate-type = ["cdylib"]` für WASM Library
  - `wasm-bindgen` Dependency hinzufügen
- [ ] Projektstruktur verstehen (src/lib.rs statt main.rs)
- [ ] Build testen: `wasm-pack build --target web`

**Output:** WASM-Toolchain ist eingerichtet, Build funktioniert.

---

### 2.3 Erstes WASM-Modul

**Ziel:** Erste Rust-Funktion von JavaScript aufrufen.

**Lerninhalt:**

**Rust-Seite:**

- `#[wasm_bindgen]` Attribut markiert Funktionen für JS-Export
- `use wasm_bindgen::prelude::*;` importiert nötige Makros
- Parameter und Rückgabetypen müssen WASM-kompatibel sein

**JavaScript-Seite:**

- WASM-Modul muss initialisiert werden (`init()`)
- Danach können exportierte Funktionen aufgerufen werden

**Aufgabe:** Implementiere selbst:

1. Eine `greet(name: &str) -> String` Funktion in Rust
2. Lade sie in einer HTML-Seite und rufe sie auf
3. Zeige das Ergebnis in der Console

**Output:** Du kannst Rust-Code aus JavaScript aufrufen.

**Übung:**

1. Erstelle eine `add(a: i32, b: i32) -> i32` Funktion und teste sie aus JS.
2. Erstelle eine `is_prime(n: u32) -> bool` Funktion.

---

### 2.4 Canvas-Zugriff via web-sys

**Ziel:** Auf das HTML Canvas vom WASM-Code zugreifen.

**Lerninhalt:**

**web-sys Crate:**

- Rust Bindings für Web APIs
- Features müssen explizit aktiviert werden (Document, Window, Canvas, etc.)
- Gibt `Option` und `Result` zurück - viel `.unwrap()` oder `?`

**Canvas-Workflow:**

1. `web_sys::window()` → Window
2. `window.document()` → Document
3. `document.get_element_by_id()` → Element
4. Element zu `HtmlCanvasElement` casten (`.dyn_into()`)
5. `canvas.get_context("2d")` → Context zum Zeichnen

**Aufgabe:** Implementiere selbst:

1. Füge `web-sys` mit den nötigen Features hinzu
2. Schreibe eine Funktion `get_canvas_context()` die den 2D Context holt
3. Zeichne ein Rechteck mit `ctx.fill_rect()`

**Output:** Du kannst vom Rust-Code auf das Canvas zeichnen.

---

### 2.5 Game Loop Architektur

**Ziel:** Verstehen wie ein Game Loop im Browser funktioniert.

**Lerninhalt:**

**Das Konzept:**

- Browser hat `requestAnimationFrame` - ruft Callback ~60x/Sekunde auf
- Jeder Frame: Update (Logik) → Render (Zeichnen)
- Delta Time: Zeit seit letztem Frame für konsistente Geschwindigkeit

**Zwei Architekturen:**

**Option A: JS steuert den Loop (einfacher)**

```javascript
// JavaScript
function gameLoop(timestamp) {
  wasm.update(deltaTime);
  wasm.render();
  requestAnimationFrame(gameLoop);
}
```

**Option B: Rust steuert den Loop (komplexer)**

- Braucht `Rc<RefCell<Closure>>` Pattern
- Closure muss sich selbst für nächsten Frame registrieren

**Empfehlung für dich:** Starte mit Option A - JS steuert den Loop, Rust macht nur update/render.

**Delta Time:**

- Zeit zwischen Frames variiert (mal 16ms, mal 20ms)
- Ohne Delta Time: Spiel läuft auf 144Hz Monitor schneller als auf 60Hz
- Bewegung = Geschwindigkeit × Delta Time

**Output:** Du verstehst Game Loop Konzept und Delta Time.

---

### 2.6 Keyboard Input

**Ziel:** Tastatureingaben verarbeiten.

**Lerninhalt:**

**Zwei Ansätze:**

**Option A: Input-State in JS, Abfrage aus Rust**

- JS speichert welche Tasten gedrückt sind
- Rust fragt ab: `is_key_pressed("Space")`

**Option B: Event Listener in Rust**

- `web_sys::window().add_event_listener_with_callback()`
- Braucht Closure die "geforgetted" wird (`.forget()`)

**Empfehlung:** Starte mit Option A - einfacher zu debuggen.

**Aufgabe:** Implementiere selbst:

1. In JS: `keydown`/`keyup` Listener die gedrückte Tasten tracken
2. Eine Rust-Funktion die den aktuellen Input-State bekommt
3. Teste: Bei Leertaste soll sich etwas auf dem Canvas bewegen

**Output:** Du kannst Tastatureingaben verarbeiten.

---

## Phase 3: Das Spiel entwickeln

### 3.1 Projekt-Setup

**Ziel:** Das WASM-Spielprojekt aufsetzen.

**Aufgaben:**

- [ ] Neues Verzeichnis `rust-game/` im Blog-Projekt erstellen
- [ ] `cargo init --lib` ausführen
- [ ] Cargo.toml konfigurieren (wasm-bindgen, web-sys mit Features)
- [ ] Basis-Dateistruktur planen:
  - `lib.rs` - WASM Entry Point, exportierte Funktionen
  - `game.rs` - GameState, update/render Logik
  - `player.rs` - Player Struct
  - `obstacle.rs` - Obstacle Struct

**Output:** Projektgerüst steht, kompiliert zu WASM.

---

### 3.2 Rendering-Grundgerüst

**Ziel:** Etwas auf dem Canvas sehen - visuelles Feedback von Anfang an!

**Aufgaben:**

- [ ] Canvas-Context holen und speichern
- [ ] `clear()` Funktion - Canvas leeren
- [ ] `draw_rect(x, y, w, h, color)` Hilfsfunktion
- [ ] Testweise ein Rechteck zeichnen
- [ ] Boden als Linie zeichnen

**Warum zuerst?** Du willst sofort sehen was passiert wenn du Code änderst.

**Output:** Du kannst Rechtecke und Linien auf das Canvas zeichnen.

---

### 3.3 Game State Struct

**Ziel:** Zentrale Spielzustandsverwaltung.

**Aufgaben:**

- [ ] `GameState` Struct mit:
  - `player: Player`
  - `obstacles: Vec<Obstacle>`
  - `score: u32`
  - `is_game_over: bool`
  - Canvas-Dimensionen
- [ ] `GameState::new()` - Initialer Zustand
- [ ] `GameState::update(delta_time, input)` - Logik pro Frame
- [ ] `GameState::render(ctx)` - Alles zeichnen

**Output:** Zentraler Spielzustand existiert.

---

### 3.4 Player mit Sprung-Physik

**Ziel:** Springende Spielfigur implementieren.

**Aufgaben:**

- [ ] `Player` Struct:
  - Position (`x`, `y`)
  - Geschwindigkeit (`velocity_y`)
  - Dimensionen (`width`, `height`)
  - `is_on_ground: bool`
- [ ] `Player::new(x, ground_y)`
- [ ] `Player::update(delta_time)` - Physik:
  - Gravitation anwenden
  - Position aktualisieren
  - Boden-Kollision prüfen
- [ ] `Player::jump()` - Nur wenn auf dem Boden
- [ ] `Player::render(ctx)`

**Physik-Konstanten (zum Experimentieren):**

- `GRAVITY` - Wie schnell fällt man
- `JUMP_VELOCITY` - Wie hoch springt man (negativ!)
- Tipp: Schnellerer Fall fühlt sich besser an

**Output:** Spielfigur kann springen mit guter Physik.

---

### 3.5 Obstacle Struct

**Ziel:** Hindernisse die von rechts kommen.

**Aufgaben:**

- [ ] `Obstacle` Struct:
  - Position (`x`, `y`)
  - Dimensionen (`width`, `height`)
- [ ] `Obstacle::new(x, ground_y)`
- [ ] `Obstacle::update(delta_time, speed)` - Bewegt nach links
- [ ] `Obstacle::is_off_screen()` - True wenn links raus
- [ ] `Obstacle::render(ctx)`

**Output:** Hindernisse bewegen sich von rechts nach links.

---

### 3.6 Obstacle Spawning

**Ziel:** Regelmäßig neue Hindernisse erzeugen.

**Aufgaben:**

- [ ] `spawn_timer: f64` im GameState
- [ ] Konstanten: `MIN_SPAWN_INTERVAL`, `MAX_SPAWN_INTERVAL`
- [ ] In `update()`:
  - Timer runterzählen
  - Bei 0: Neues Obstacle spawnen, Timer zurücksetzen (zufällig)
  - Obstacles die off-screen sind entfernen

**Output:** Hindernisse erscheinen in zufälligen Abständen.

---

### 3.7 Kollisionserkennung

**Ziel:** Erkennen wenn Spieler ein Hindernis berührt.

**Aufgaben:**

- [ ] `Hitbox` Struct oder Methode `get_hitbox()` auf Player/Obstacle
- [ ] AABB Kollision implementieren:
  ```
  Kollision wenn:
  - a.left < b.right UND
  - a.right > b.left UND
  - a.top < b.bottom UND
  - a.bottom > b.top
  ```
- [ ] In `update()`: Alle Obstacles gegen Player prüfen
- [ ] Bei Kollision: `is_game_over = true`

**Output:** Spiel erkennt Kollisionen korrekt.

---

### 3.8 Score System

**Ziel:** Punktezählung und Anzeige.

**Aufgaben:**

- [ ] Score erhöht sich mit der Zeit (oder pro übersprungenes Hindernis)
- [ ] Score auf Canvas anzeigen (Text zeichnen mit `ctx.fill_text()`)
- [ ] Optional: Highscore in localStorage speichern (via JS)

**Output:** Spieler sieht seinen Score.

---

### 3.9 Game Over & Restart

**Ziel:** Spielende-Zustand handhaben.

**Aufgaben:**

- [ ] Bei `is_game_over`:
  - Update stoppt (keine Bewegung mehr)
  - "Game Over" Text anzeigen
  - Finalen Score anzeigen
  - "Press Space to Restart" Hinweis
- [ ] Bei Tastendruck: `GameState::reset()` aufrufen

**Output:** Kompletter Spielzyklus funktioniert.

---

### 3.10 Schwierigkeitsgrad

**Ziel:** Spiel wird progressiv schwieriger.

**Aufgaben:**

- [ ] Geschwindigkeit der Hindernisse steigt mit Score
- [ ] Spawn-Intervall sinkt mit Score
- [ ] Maximum definieren (nicht unmöglich machen)

**Formel-Idee:**

```
speed = BASE_SPEED + (score / 100) * SPEED_INCREMENT
interval = max(MIN_INTERVAL, BASE_INTERVAL - score * 0.01)
```

**Output:** Spiel fordert den Spieler mit steigendem Score.

---

### 3.11 Pixel Art Rendering

**Ziel:** Minimalistischer Pixel-Look passend zum Blog.

**Aufgaben:**

- [ ] Spieler als Pixel-Entwickler (~8x12 Pixel, einfache Form)
- [ ] Hindernisse als "Bugs" (einfache Käfer-Form)
- [ ] Farbschema aus Blog übernehmen:
  - CSS-Variablen auslesen oder hardcoden
  - Primärfarbe für Spieler
  - Akzentfarbe für Hindernisse
- [ ] Optional: 2-Frame Lauf-Animation

**Tipp:** Pixel Art = kleine Rechtecke zeichnen. Kein Sprite-Loading nötig.

**Output:** Spiel hat konsistenten Pixel-Art-Stil.

---

### 3.12 Touch/Mobile Support

**Ziel:** Auf Mobilgeräten spielbar.

**Aufgaben:**

- [ ] Touch Event Listener (touchstart = Sprung)
- [ ] Canvas-Größe responsiv (oder feste Größe die gut aussieht)
- [ ] Testen auf echtem Gerät oder DevTools

**Output:** Spiel funktioniert auf Mobilgeräten.

---

### 3.13 Integration in Next.js

**Ziel:** WASM-Spiel in die Website einbinden.

**Aufgaben:**

- [ ] Build-Script: `wasm-pack build --target web`
- [ ] Output nach `public/wasm/` kopieren
- [ ] React-Komponente `<JumpGame />`:
  - Canvas Element
  - WASM laden (dynamic import, client-side only)
  - Game Loop starten
  - Cleanup bei Unmount
- [ ] In Hauptseite einbinden (unterhalb Social Icons)

**Next.js Besonderheiten:**

- WASM nur client-side laden (`useEffect`)
- Dynamic import: `await import('../public/wasm/...')`

**Output:** Spiel läuft auf der Website.

---

### 3.14 Polish & Feinschliff

**Ziel:** Details die das Spiel rund machen.

**Aufgaben:**

- [ ] Pause wenn Tab nicht fokussiert (`document.hidden`)
- [ ] Loading State während WASM lädt
- [ ] Fallback/Hinweis wenn WASM nicht unterstützt
- [ ] Sound-Effekte? (optional - kann auf Blog störend sein)
- [ ] Start-Screen mit "Press Space to Start"

**Output:** Poliertes, fertiges Spiel.

---

## Review-Checkliste (nach Abschluss)

- [ ] Code ist verständlich ohne Kommentare lesen zu müssen
- [ ] Keine unnötigen Abstraktionen
- [ ] Alle Edge Cases behandelt (Tab-Wechsel, Resize, etc.)
- [ ] Performance ist gut (60fps)
- [ ] Delta Time korrekt implementiert (läuft auf allen Monitoren gleich schnell)
- [ ] Funktioniert auf Desktop und Mobile
- [ ] Stil passt zum Rest der Website

---

## Ressourcen

**Rust:**

- [The Rust Book](https://doc.rust-lang.org/book/) - Offizielle Dokumentation
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/) - Praktische Beispiele
- [Rustlings](https://github.com/rust-lang/rustlings) - Interaktive Übungen

**WebAssembly:**

- [Rust and WebAssembly Book](https://rustwasm.github.io/docs/book/)
- [wasm-bindgen Guide](https://rustwasm.github.io/docs/wasm-bindgen/)

**Game Dev:**

- [Game Programming Patterns](https://gameprogrammingpatterns.com/) - Allgemeine Patterns

---

## Hinweise

**Empfohlene Reihenfolge:**

1. Phase 1 komplett durcharbeiten (Rust Basics sind fundamental)
2. Phase 2 durcharbeiten (WASM-Grundlagen)
3. Phase 3 Schritt für Schritt (Spiel entwickeln)

**Bei Problemen:**

- Compiler-Fehler genau lesen - Rust's Fehlermeldungen sind sehr gut
- The Rust Book hat zu fast jedem Thema ein Kapitel
- Bei WASM-spezifischen Problemen: wasm-bindgen Guide

Viel Erfolg!

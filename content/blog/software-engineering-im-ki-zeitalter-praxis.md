---
title: "Software Engineering im KI-Zeitalter (Teil 2: Praxis)"
date: "2026-01-26"
excerpt: "Praxisguide Teil 2: Templates, Commands, Agents und das Autonomie-Spektrum zwischen MAD und Ralph"
tags: ["AI", "Claude Code", "Workflow", "Autonomie", "Best Practices"]
---

_Dies ist Teil 2 einer dreiteiligen Serie._

- _[Teil 1: Theorie](./warum-gute-entwickler-mit-ai-besser-werden)_
- Teil 3: Zukunft (comming soon)

---

## Inhaltsverzeichnis

- [Einleitung](#einleitung)
- [Prompt-Templates](#prompt-templates)
- [Context-Isolation](#context-isolation)
- [Agents & Plugins](#agents--plugins)
- [Session-Management](#session-management)
- [Die Spielregeln: Mensch und Agent als Team](#die-spielregeln-mensch-und-agent-als-team)
- [Wie viel Autonomie ist sinnvoll? MAD vs. Ralph erklärt](#wie-viel-autonomie-ist-sinnvoll-mad-vs-ralph-erklärt)
- [Fazit: Lessons Learned](#fazit-lessons-learned)

## Einleitung

Aus dem ursprünglich geplanten Follow-up zu meinem ersten Artikel ist eine Trilogie geworden. Das Thema war einfach zu groß für einen einzigen Nachfolger: [Teil 1](./warum-gute-entwickler-mit-ai-besser-werden) behandelt die Theorie – warum Zerlegung wichtig ist und wie Fehlerraten funktionieren. Dieser zweite Teil hier zeigt mein konkretes Praxis-Setup. Und in Teil 3 wird es um die Zukunft gehen – was passiert, wenn diese Patterns industriell skaliert werden.

Für PoCs und Prototyping bin ich in den letzten Wochen komplett auf Maximal Agentic Decomposition (MAD) aus Teil 1 umgestiegen. Mit der Zeit haben sich Workflows, Tools und kleinere Kniffe ergeben – manche verbessern nur die Quality of Life, andere die konkreten Ergebnisse erheblich. Inzwischen fühlt sich mein Setup effizient und ausgereift an. Hier stelle ich es euch vor: konkrete Templates, Tools und Entscheidungshilfen.

## Prompt-Templates

Während der Nutzung von MAD und dem Erstellen von granularen Arbeitspaketen ist mir zunächst eines aufgefallen: Der Flow für die Planung und das Schneiden der Arbeitspakete ist immer gleich. Mir kam also die Idee, zumindest dafür schon mal eine Art Template zu nutzen.

Mittlerweile habe ich für die wichtigsten Phasen meiner Arbeit standardisierte Prompts, die ich nur noch mit dem konkreten Vorhaben befülle. Das spart Zeit, sorgt für konsistente Ergebnisse und reduziert die kognitive Last – ich muss nicht jedes Mal neu überlegen, wie ich die Anfrage formuliere.

### MAD-Kickoff

Der wichtigste Prompt: Hier startet jedes größere Vorhaben. Das Template zerlegt das Feature in testbare Arbeitspakete und definiert gleich die Tests dazu (TDD-Ansatz). Wichtig: MAD lohnt sich erst ab einer gewissen Komplexität – wenn mehr als eine Datei betroffen ist oder mehr als eine Verantwortlichkeit im Spiel ist. Für kleine, isolierte Änderungen ist der Overhead unnötig.

```markdown
Wende MAD (Maximal Agentic Decomposition) auf folgendes Feature an:

[VORHABEN HIER EINFÜGEN]

Schwellenwert: Nur anwenden wenn >1 Datei betroffen ODER >1 Verantwortlichkeit.
Für kleine Features direkt umsetzen.

Gehe dabei wie folgt vor:

1. **Analyse & Zerlegung**
   - Zerlege das Vorhaben in die kleinstmöglichen, unabhängigen Arbeitspakete
   - Kriterien pro Arbeitspaket:
     - Max 1 Verantwortlichkeit (eine Sache tun, die gut tun)
     - Max ~50 Zeilen Produktivcode
     - In <30 Min umsetzbar
     - Durch mindestens einen automatisierten Test verifizierbar
   - Pro Paket definieren: Input-Typ, Output-Typ, Seiteneffekte, Akzeptanzkriterien
   - Abhängigkeits-Graph erstellen: Welches Paket hängt von welchem ab? Reihenfolge ableiten.

2. **Test-First Definition (TDD)**
   - Schreibe für jedes Arbeitspaket zuerst den/die Test(s)
   - Führe jeden Test einmal aus, um zu verifizieren, dass er erwartungsgemäß fehlschlägt (Red)
   - Tests dürfen während der Implementierungsphase NICHT geändert werden

3. **Implementierungsplan**
   - Priorisierte Reihenfolge basierend auf Abhängigkeits-Graph
   - Pro Paket: Implementiere nur so viel Code, bis der Test grün wird (Green)
   - Fortschritts-Tracking: [ ] Paket X: [Beschreibung] - Status: Red/Green/Done

4. **Scope-Guard**
   - Während der Implementierung KEINE neuen Pakete hinzufügen ohne Rücksprache
   - Abbruchkriterium: Wenn der Plan nicht passt → STOPP, Plan anpassen, nicht weiterbauen

5. **Output-Format**
   Erstelle den Plan als Markdown mit folgender Struktur:
   - Übersicht des Vorhabens
   - Liste aller Arbeitspakete mit: ID, Beschreibung, Input/Output/Seiteneffekte, Test-Kriterien, Abhängigkeiten
   - Abhängigkeits-Graph (welches Paket blockiert welches)
   - Implementierungsreihenfolge
   - Fortschritts-Tracker (Checkbox-Liste)

Starte noch nicht mit der Implementierung. Der Plan wird erst von mir gereviewet und explizit freigegeben.
```

### Plan-Review & Interview

Bevor ich mit der Implementierung starte, lasse ich den Plan nochmal prüfen. Das Template stellt sicher, dass keine Lücken übersehen werden – und fragt aktiv nach, wenn etwas unklar ist.

```markdown
Führe einen dreistufigen Review-Prozess des Plans durch:

**Stufe 1: Autonomie- & Qualitäts-Check**
Prüfe jedes Arbeitspaket gegen die MAD-Kriterien:

- Max 1 Verantwortlichkeit? Max ~50 Zeilen? In <30 Min umsetzbar?
- Input-Typ, Output-Typ und Seiteneffekte klar definiert?
- Durch mindestens einen automatisierten Test verifizierbar?
- Abhängigkeits-Graph korrekt? Keine zirkulären Abhängigkeiten?
- Gibt es versteckte Annahmen oder unklare Anforderungen?

Wenn ein Paket die Kriterien nicht erfüllt → weiter zerlegen oder begründen warum nicht.

**Stufe 2: Interview**
Nutze AskUserQuestion, um gezielt nachzufragen:

- Technische Implementierung: Frameworks, Libraries, Architekturentscheidungen
- UI/UX: Benutzerinteraktion, Darstellung, Flows (falls relevant)
- Edge Cases: Grenzfälle, Fehlerszenarien, unerwartete Eingaben
- Concerns: Sicherheit, Performance, Wartbarkeit
- Tradeoffs: Bekannte Kompromisse, akzeptable Einschränkungen
- Priorisierung: Must-have vs. Nice-to-have Features

Wichtig: Lieber eine Frage zu viel als eine zu wenig.

**Stufe 3: Finalisierung**

- Plan mit Erkenntnissen aus dem Interview aktualisieren
- Scope-Guard bestätigen: "Das ist der Scope. Keine Erweiterungen ohne Rücksprache."
- Plan als "Bereit zur Implementierung" markieren → erst nach explizitem OK starten
```

### Implementierungs-Kickoff

Wenn der Plan steht und freigegeben ist, starte ich die Implementierung mit diesem Template. Es sorgt für einen strukturierten TDD-Zyklus mit regelmäßigen Checkpoints.

```markdown
Der Plan ist freigegeben. Starte die Implementierung mit folgender Vorgehensweise:

1. Zeige mir das erste Arbeitspaket mit seinen Tests
2. Führe die Tests aus (erwartetes Ergebnis: Fehlschlag)
3. Implementiere den minimal notwendigen Code
4. Führe die Tests erneut aus (erwartetes Ergebnis: Erfolg)
5. Dokumentiere den Fortschritt im Plan
6. Fahre mit dem nächsten Arbeitspaket fort

Bei Problemen: Stoppe und frage nach, bevor du Annahmen triffst.
Nach jedem 3. Arbeitspaket: Kurzer Zwischen-Checkpoint mit Statusbericht.
```

### Code-Review

Nach der Implementierung oder bei Pull Requests nutze ich dieses Template für strukturierte Reviews. Der Fokus liegt auf dem "5-Sekunden-Test" – ist der Code sofort verständlich? Neu dazu gekommen ist ein dreistufiges Severity-System: MUSS blockiert den Merge, SOLLTE wird vorher gefixt, VORSCHLAG ist optional. Das verhindert endlose Diskussionen über Stilfragen.

```markdown
Führe ein Code-Review der letzten Änderungen durch.

**1. Plan-Abgleich** (falls MAD-Arbeitspaket vorhanden):

- Erfüllt der Code die Akzeptanzkriterien des Arbeitspakets?
- Stimmen Input/Output/Seiteneffekte mit der Paket-Definition überein?
- Scope-Guard: Wurde nur das implementiert, was im Paket steht? Kein Scope-Creep?

**2. Lesbarkeit & Namensqualität**:

- Ist der Code in 5 Sekunden verständlich?
- Aussagekräftige Namen? Keine Abkürzungen (tmp, val, x)?
- Klare Struktur? Oder muss man scrollen/springen um den Flow zu verstehen?

**3. YAGNI & Einfachheit**:

- Gibt es unnötige Abstraktionen oder Overengineering?
- Wurde Code für hypothetische Zukunfts-Anforderungen geschrieben?
- Könnte man es einfacher lösen ohne Funktionalität zu verlieren?

**4. Tests**:

- Sind alle Akzeptanzkriterien durch Tests abgedeckt?
- Edge Cases: Grenzwerte, leere Eingaben, Fehlerfälle?
- Sind die Tests selbst lesbar und wartbar?

**5. Sicherheit** (OWASP Top 10):

- Input-Validierung an System-Grenzen?
- Injection-Risiken (SQL, Command, XSS)?
- Secrets im Code?

**6. Konsistenz**:

- Passt der Code zum bestehenden Stil der Codebase?
- Fehlerbehandlung konsistent mit dem Rest des Projekts?

**Feedback-Format**:

- Referenzen mit Datei:Zeile
- Severity pro Finding:
  - MUSS: Bugs, Sicherheitslücken, Plan-Abweichungen → blockiert Merge
  - SOLLTE: Lesbarkeit, Naming, fehlende Tests → sollte vor Merge gefixt werden
  - VORSCHLAG: Stilfragen, alternative Ansätze → kann ignoriert werden
```

### Debugging-Session

Bei Bugs starte ich mit diesem Template eine systematische Fehlersuche. Wichtig: Erst Hypothesen bilden und priorisieren, dann einen Test schreiben, der den Bug reproduziert, dann fixen -- und am Ende sicherstellen, dass nichts anderes kaputtgegangen ist.

```markdown
Ich habe ein Problem: [PROBLEMBESCHREIBUNG]

Gehe systematisch vor:

**1. Eingrenzung**

- Welche Komponente ist betroffen?
- Seit wann tritt das Problem auf? Was hat sich zuletzt geändert?
- Ist das Problem reproduzierbar? Unter welchen Bedingungen?
- Symptome sammeln: Fehlermeldungen, Logs, Stacktraces, Screenshots

**2. Hypothesen bilden & priorisieren**

- Mindestens 2-3 Hypothesen zur Ursache formulieren
- Nach Wahrscheinlichkeit priorisieren (häufigste Ursache zuerst)
- Pro Hypothese: Wie kann ich sie bestätigen oder widerlegen?

**3. Root Cause identifizieren**

- Hypothesen systematisch prüfen (eine nach der anderen)
- Unterscheide Symptom vs. Ursache: "Warum?" bis zur eigentlichen Ursache
- Root Cause mit Datei:Zeile dokumentieren

**4. Bug-reproduzierender Test**

- Test schreiben, der das Fehlverhalten reproduziert
- Test ausführen → muss fehlschlagen (Red)
- STOPP: Test und Hypothese zeigen, Fix-Strategie besprechen

**5. Fix implementieren**

- Minimal-invasiv: Nur die Root Cause beheben, kein Refactoring nebenbei
- Scope-Guard: Wenn der Fix andere Stellen berührt → Rücksprache
- Bug-Test ausführen → muss grün werden (Green)

**6. Regression prüfen**

- ALLE bestehenden Tests ausführen → müssen weiterhin grün sein
- Wenn andere Tests brechen: Nicht blind fixen, sondern verstehen warum
- Erst nach grüner Test-Suite → "Fix fertig" melden
```

### Von Templates zu Custom Commands

Die Templates oben sind die Grundlage – aber jedes Mal den Prompt rauskopieren und einfügen ist unnötig. Deshalb habe ich für die wichtigsten Templates eigene [Custom Slash Commands](https://docs.anthropic.com/en/docs/claude-code/tutorials/slash-commands) angelegt:

| Command           | Template                | Aufruf-Beispiel                             |
| ----------------- | ----------------------- | ------------------------------------------- |
| `/my-mad`         | MAD-Kickoff             | `/my-mad User-Authentifizierung mit OAuth2` |
| `/my-plan-review` | Plan-Review & Interview | `/my-plan-review`                           |
| `/my-review`      | Code-Review             | `/my-review`                                |
| `/my-debug`       | Debugging-Session       | `/my-debug Login schlägt nach Timeout fehl` |

Jeder Command ist eine Markdown-Datei unter `~/.claude/commands/` (global) oder `.claude/commands/` (projektspezifisch), die das jeweilige Template enthält. `$ARGUMENTS` wird beim Aufruf durch den Text nach dem Command-Namen ersetzt – bei `/my-mad User-Auth mit OAuth2` landet "User-Auth mit OAuth2" direkt im Prompt.

**Warum das `my-`Prefix?** Community-Plugins bringen oft eigene Slash Commands mit – `/review`, `/debug` und ähnliche Namen sind schnell vergeben. Das `my-`Prefix verhindert Namenskollisionen und macht sofort klar, welche Commands meine eigenen sind und welche von Plugins kommen. Wenn ich `/my-review` tippe, weiß ich, dass mein Template läuft – nicht das eines Plugins mit anderem Verhalten.

Der Vorteil gegenüber Copy-Paste ist nicht nur Bequemlichkeit. Custom Commands sind versionierbar, teilbar und projektspezifisch anpassbar. Ein Team kann sich auf gemeinsame Commands einigen und sie ins Repository committen – jeder arbeitet dann mit denselben Workflows.

### Warum Templates besser sind

Der Vorteil ist nicht nur Zeitersparnis. Templates sorgen für:

- **Konsistenz**: Jedes Feature durchläuft denselben strukturierten Prozess
- **Weniger kognitive Last**: Ich überlege nicht "wie formuliere ich das?", sondern nur "was will ich?"
- **Wiederholbare Qualität**: Die Ergebnisse schwanken weniger, weil der Prozess gleich bleibt
- **Lerneffekt**: Mit der Zeit optimiere ich die Templates basierend auf Erfahrungen

## Context-Isolation

In [Teil 1](./warum-gute-entwickler-mit-ai-besser-werden) haben wir gesehen, dass sich Fehlerwahrscheinlichkeiten pro Reasoning-Schritt multiplizieren. MAD senkt die Anzahl der Schritte – aber es gibt einen zweiten Hebel: die Fehlerrate _pro_ Schritt. Und die steigt, wenn der Context mit irrelevantem Rauschen gefüllt ist. 10.000 Zeilen Test-Output im Context zwingen das Modell, relevante Information aus einer Wand von Noise zu filtern. Das Ergebnis: ungenauere Antworten, vergessene Entscheidungen, inkonsistente Ergebnisse.

Die Lösung: Verbose Operationen – Tests ausführen, Logs analysieren, dutzende Dateien durchsuchen – laufen in einem isolierten Context-Fenster ab. Nur das Ergebnis kommt zurück.

```
Hauptkonversation
│
├─► Subagent startet (eigener Context)
│   ├─ Liest 50 Dateien
│   ├─ Führt Tests aus
│   └─ Analysiert 10.000 Zeilen Output
│
└─◄ Zurück: "3 Tests fehlgeschlagen: X, Y, Z"
```

Du zahlst nur für das Ergebnis, nicht für den Prozess. Statt 10.000 Zeilen Test-Output landen drei Zeilen Zusammenfassung im Context. MAD senkt die Schrittzahl, Context-Isolation senkt die Fehlerrate pro Schritt – beides zusammen ist der Hebel. Welche Agents dieses Prinzip in Claude Code umsetzen, dazu mehr im nächsten Kapitel.

## Agents & Plugins

Wer mit Claude Code arbeitet, nutzt Agents und Plugins oft, ohne es bewusst zu merken. Im Hintergrund delegiert Claude Code Teilaufgaben an spezialisierte **Built-in Agents**: Der Explore-Agent recherchiert die Codebase im Read-only-Modus, der Plan-Agent entwirft Architekturen, und der general-purpose Agent übernimmt komplexe Multi-Step-Tasks. Alle drei laufen in isoliertem Context – Claude Code entscheidet dabei selbst, wann ein Subagent sinnvoll ist. Man merkt es an der Statuszeile – und daran, dass der Context nicht mit tausenden Zeilen Test-Output zugemüllt wird.

Daneben gibt es **Community-Plugins**, die sich über den Plugin-Marketplace installieren lassen. In meinem Setup nutze ich unter anderem:

- `/commit` und `/commit-push-pr` – Strukturierte Commits und PRs, ohne manuell `git add` und Commit-Messages formulieren zu müssen
- `/feature-dev` – Geführte Feature-Entwicklung mit spezialisierten Agenten (code-architect, code-explorer, code-reviewer)
- `/code-review` – PR-Reviews auf Knopfdruck

Das Zusammenspiel aus Plugins, Built-in Agents und einer gut gepflegten **CLAUDE.md** ergibt ein Setup, das im Hintergrund mitdenkt. Die CLAUDE.md fungiert dabei als eine Art stille Konfiguration: Workflow-Trigger erkennen automatisch, ob ich gerade debugge oder ein Feature plane, und die Review-Checkliste wird nach jeder Änderung angewandt – ohne dass ich sie jedes Mal explizit anfordern muss.

> **Info-Box: Skills, Plugins und eigene Commands**
>
> Claude Code hat ein wachsendes Ökosystem an **Community-Plugins**, die sich über den Plugin-Marketplace installieren lassen. Skills sind dabei vorgefertigte Workflows, die automatisch erkannt und getriggert werden – oder manuell via `/skill-name` aufrufbar sind:
>
> | Skill               | Zweck                                                    |
> | ------------------- | -------------------------------------------------------- |
> | `/commit`           | Strukturierte Git-Commits                                |
> | `/code-review`      | PR-Reviews auf Knopfdruck                                |
> | `/session-handover` | Strukturierte Session-Übergabe                           |
> | `/feature-dev`      | Geführte Feature-Entwicklung mit spezialisierten Agenten |
>
> Alle verfügbaren Skills zeigt `/skills` an.
>
> **Für einfachere, eigene Workflows** gibt es Custom Slash Commands – eine Markdown-Datei im `commands`-Verzeichnis:
>
> - `.claude/commands/mein-command.md` — **projekt-spezifisch**
> - `~/.claude/commands/mein-command.md` — **global**
>
> Der Inhalt ist reines Markdown – eine Prompt-Vorlage, die Claude beim Aufruf als Anweisung erhält. `$ARGUMENTS` wird beim Aufruf durch den Text nach dem Command-Namen ersetzt.
>
> **Abgrenzung:** Skills/Plugins für komplexe Workflows mit eigenen Subagents, Tool-Einschränkungen oder isoliertem Context. Custom Commands für leichtgewichtige, projektspezifische Prompts.

## Session-Management

Context-Isolation hilft gegen Rauschen innerhalb einer Konversation. Aber es gibt noch ein zweites Problem: Der Context füllt sich über die Dauer einer Session auch mit _relevantem_ Inhalt – und irgendwann wird es zu viel. Die Statuszeile in Claude Code zeigt die Context-Auslastung in Prozent. Ab etwa **50%** merkt man, dass Antworten ungenauer werden – Claude "vergisst" Entscheidungen von früher in der Session oder ignoriert Teile der CLAUDE.md. Ein guter Zeitpunkt zum Wechseln ist bei **30-40%** verbleibendem Context, nicht erst wenn es eng wird. Wer bis 90%+ wartet, arbeitet die letzten Prozente mit spürbar schlechterer Qualität.

**Option 1: Context komprimieren (ohne Session-Wechsel)**

Bevor man die Session wechselt, lohnt sich ein Versuch mit `/compact`. Das komprimiert die bisherige Konversation und schafft wieder Platz:

```bash
/compact                      # Allgemeine Komprimierung
/compact focus on auth-logic  # Mit Fokus: behält nur Relevantes
```

`/compact` mit Fokus ist besonders effektiv – statt alles gleichmäßig zu komprimieren, behält Claude gezielt den Kontext zu einem Thema und verwirft den Rest.

**Option 2: Session wechseln**

Wenn `/compact` nicht mehr reicht oder die Session thematisch abgeschlossen ist:

```bash
/rename feature-xyz           # Session benennen
# Session beenden (Ctrl+C)
claude --resume feature-xyz   # Später nahtlos fortsetzen
```

Bei `--resume` bleibt die volle Conversation-History erhalten – inklusive Code-Änderungen, Architektur-Entscheidungen und CLAUDE.md. Nur Tool-Permissions müssen neu bestätigt werden.

**Option 3: Frische Session mit Übergabe**

Manchmal will man bewusst eine frische Session starten – zum Beispiel wenn der bisherige Kontext mehr Ballast als Hilfe ist. Das Problem: Die neue Session weiß nichts von der alten. Die Lösung ist ein kurzes Übergabe-Prompt, das den Stand zusammenfasst: Was wurde erledigt, welche Entscheidungen stehen noch offen, was ist der nächste Schritt, welche Dateien sind relevant.

Dieses Übergabe-Prompt jedes Mal von Hand zu schreiben ist mühsam – und genau hier zeigt sich ein praktischer Anwendungsfall für eigene Commands (siehe [Agents & Plugins](#agents--plugins)). Ein `/session-handover` Command kann die aktuelle Konversation analysieren und automatisch eine strukturierte Übergabe generieren:

```bash
/session-handover    # Generiert Übergabe-Zusammenfassung
# → Output kopieren
# → Neue Session starten
# → Output als Startprompt einfügen
```

Der Vorteil: Die neue Session startet mit einem sauberen, fokussierten Context statt mit hunderten Zeilen alter Konversation – und man vergisst keine wichtigen Entscheidungen bei der Übergabe. Gerade bei langen Feature-Entwicklungen über mehrere Tage ist das oft effektiver als `--resume`, weil man bewusst entscheidet, welcher Kontext noch relevant ist.

## Die Spielregeln: Mensch und Agent als Team

Bisher ging es um Werkzeuge – Templates, Agents, Session-Management. Aber Werkzeuge allein reichen nicht. Was mindestens genauso wichtig ist: klare Regeln für die Zusammenarbeit zwischen Mensch und Agent. Ohne diese Regeln passiert, was bei jedem Pair-Programming ohne Absprachen passiert – einer rast voraus, der andere verliert den Überblick.

### Funktion für Funktion

Die wichtigste Regel in meinem Setup: **Der Agent implementiert nie autonom mehrere Funktionen am Stück.** Der Ablauf ist immer gleich:

1. Eine Funktion/Komponente schreiben
2. Stopp – zeigen und erklären: Was macht sie? Warum diese Lösung? Welche Alternativen gab es?
3. Feedback einarbeiten
4. Erst nach OK → nächste Funktion

**Faustregel:** Sobald eine zweite Datei angefasst wird → STOPP und zeigen.

Das klingt langsam, ist es aber nicht. Die meisten Fehler entstehen nicht beim Schreiben, sondern beim Übersehen – und die Kosten für einen übersehenen Fehler steigen exponentiell, je mehr Code bereits darauf aufbaut. Lieber nach jeder Funktion 30 Sekunden investieren als nach 500 Zeilen eine Stunde debuggen.

### Planung: Arbeitspaket für Arbeitspaket

Dasselbe Prinzip gilt für die Planungsphase: Nicht den gesamten Plan auf einmal entwerfen lassen, sondern iterativ – erstes Arbeitspaket entwerfen, Feedback geben, finalisieren, dann das nächste. Das verhindert, dass man am Ende einen 20-Pakete-Plan reviewt und dabei die Hälfte der Probleme übersieht.

### Post-Implementation Review

Nach Abschluss eines Arbeitspakets gehe ich jede Funktion nochmals durch:

- Was macht sie?
- Warum so und nicht anders?
- Welche Edge Cases gibt es?

Das Ziel: Ich muss jede Funktion in eigenen Worten erklären können. Code, den ich nicht erklären kann, ist Code, den ich nicht warten kann.

### Rollenverteilung nach Kontext

Nicht jede Aufgabe braucht dasselbe Maß an Kontrolle. In meinem Setup variiert die Rollenverteilung je nach Kontext:

| Kontext                | Meine Rolle          | Agent-Rolle                                               |
| ---------------------- | -------------------- | --------------------------------------------------------- |
| Kernlogik              | Schreibe selbst      | Pair-Partner: Review, Fragen, Alternativen                |
| Neue Sprache/Framework | Schreibe mit Support | Co-Pilot: Mehr Vorschläge, erklärt Idiome                 |
| Frontend               | Lerne aktiv          | Schreibt + erklärt WARUM bei jedem Schritt                |
| Boilerplate            | Reviewe              | Schreibt (Config, Types, Setup-Code)                      |
| Scaffolding            | Gebe Vorgaben        | Erstellt autonom (Build-Config, Ordnerstruktur, CI-Setup) |

**Der entscheidende Punkt:** Sobald es an Business-Logik geht – auch wenn es repetitiv aussieht – wird gemeinsam gearbeitet. Scaffolding (Projektstruktur, Build-Dateien, Config) darf der Agent autonom erstellen. Aber Klassen, Funktionen und Logik? Zurück in den Pair-Modus.

### Verification: Evidenz vor Behauptung

Eine letzte Regel, die sich als unverzichtbar herausgestellt hat: **Keine Completion-Claims ohne Verifikation.** Bevor etwas als "fertig" gilt:

1. Build prüfen – kompiliert/baut das Projekt fehlerfrei?
2. Tests laufen lassen – alle grün?
3. Lint prüfen – keine neuen Warnings?
4. Manuell verifizieren – Ergebnis tatsächlich im Browser/Terminal prüfen

Erst dann ist es fertig. Klingt offensichtlich, aber ohne diese explizite Regel neigen Agents dazu, nach dem letzten Code-Edit "fertig" zu melden – ohne den Build überhaupt ausgeführt zu haben.

## Wie viel Autonomie ist sinnvoll? MAD vs. Ralph erklärt

Mit den Spielregeln im Hinterkopf stellt sich die nächste Frage: Wie viel Kontrolle brauche ich eigentlich?

| Aspekt          | MAD (manuell)           | Ralph (autonom)             |
| --------------- | ----------------------- | --------------------------- |
| Kontrolle       | Pro Schritt             | Pro Iteration               |
| Aufwand         | Höher                   | Niedriger                   |
| Fehler-Feedback | Sofort                  | Verzögert                   |
| Ideal für       | Kritische Logik, Lernen | Boilerplate, Known Patterns |

MAD kennen wir aus Teil 1: maximale Kontrolle, jeder Schritt einzeln. Auf der anderen Seite des Spektrums steht **Ralph** – ein Workflow, der Claude autonom iterieren lässt.

### Der Ralph Workflow

[Ralph](https://github.com/frankbria/ralph-claude-code) ist ein Bash-basierter Wrapper um Claude Code, der autonome Iterationsschleifen ermöglicht. Das Prinzip: Du gibst einen Plan vor, Ralph lässt Claude so lange arbeiten, bis alles abgehakt ist – oder ein Sicherheitsmechanismus greift (z.B. zu viele Loops ohne Fortschritt). Details zur Konfiguration und den Exit-Bedingungen finden sich im [Repository](https://github.com/frankbria/ralph-claude-code).

Das klingt verlockend – und für bestimmte Aufgaben funktioniert es hervorragend. Aber es gibt einen Haken.

### Was aber, wenn der Plan Lücken hat?

"Garbage In, Garbage Out" kennt jeder. Mit autonomen Workflows wird daraus "Garbage In, Garbage Out – but the garbage comes out a lot faster than it went in". Claude implementiert _genau das_, was im Plan steht – nicht mehr, nicht weniger. Fehlende Edge Cases im Plan bedeuten fehlende Edge Cases im Code. Und das erkennt man oft erst spät.

```
Plan: "Implementiere User-Login mit Email/Passwort"
Vergessen: Rate-Limiting, Account-Lockout, Passwort-Komplexität

→ Ralph iteriert 5x, meldet "fertig"
→ Code funktioniert, aber ist unsicher
→ Erkennung erst im Security-Review
```

Die Reparatur ist dann oft aufwändiger als die manuelle Implementierung gewesen wäre. Die Erkenntnis: Je autonomer der Workflow, desto wasserdichter muss der Plan sein.

### Wann welchen Ansatz wählen?

```
Neues Feature mit unklaren Requirements
└─► MAD (maximale Kontrolle, Interview-Phase)

Gut verstandenes Pattern (CRUD, Standard-API)
└─► Ralph (autonom iterieren)

Sicherheitskritischer Code
└─► MAD + manuelles Review (niemals autonom)

Refactoring mit klaren Regeln
└─► Ralph (gut definierte Transformationen)

Debugging komplexer Bugs
└─► MAD (Hypothese → Test → Fix pro Schritt)

Boilerplate generieren
└─► Ralph (schnell, Fehler leicht erkennbar)
```

### Meine 5 Cent dazu: Kontrolle vor Geschwindigkeit

Ich selbst nutze Ralph bewusst nicht. Der Effizienzgewinn durch einen KI-Agenten ist bereits so hoch, dass ich mir die Kontrolle über jeden Schritt leisten kann – und will. Meine Zeit investiere ich lieber in die Planungsphase und in das Review des generierten Codes, statt Claude autonom iterieren zu lassen und das Ergebnis hinterher aufzuräumen.

Das heißt nicht, dass Ralph schlecht ist – für gut verstandene Patterns und Boilerplate kann autonome Iteration der richtige Ansatz sein. Aber für mich überwiegt das Risiko: Wer den Code nicht Schritt für Schritt begleitet, verliert das Verständnis dafür. Und Code, den man nicht versteht, wird zum Wartungsrisiko.

## Fazit: Lessons Learned

Was als Experiment mit MAD begann, ist inzwischen mein normaler Workflow für Hobby-Projekte und PoCs. Anpassungen an kritischen Codebases und -stellen übernehme ich jedoch nach wie vor selbst und werde das auch in Zukunft so handhaben. Die wichtigste Erkenntnis: KI-Agenten haben unendlich viel Potenzial und bringen einen bunten Strauß an Tooling mit, den man nutzen kann, aber nicht muss – die Arbeitsweise mit dem LLM unter gewissen Regeln ist ausschlaggebend, alles andere ist der Zucker oben drauf, der den eigenen Workflow verfeinert. Was sich bei mir bewährt hat, sind die hier vorgestellten Flows: Templates sorgen für konsistente Planung, Context-Isolation hält den Kontext sauber, Session-Management verhindert den schleichenden Qualitätsverlust, und das Autonomie-Spektrum gibt mir die Flexibilität, zwischen voller Kontrolle und autonomer Iteration zu wechseln – auch wenn ich letzteres nicht empfehlen kann.

Wenn ich eine Sache herausgreifen müsste, ist es die, die ich im ersten Teil meiner Trilogie zu KI-Agenten bereits erkennen konnte: **Die Qualität der Planung bestimmt alles.** Je autonomer man arbeiten will, desto wasserdichter muss der Plan sein. Ralph ohne soliden Plan ist wie Autofahren ohne Lenkrad – es geht schnell, aber nicht in die richtige Richtung.

In Teil 3 schauen wir dann über den eigenen Workflow hinaus: Was passiert, wenn diese Patterns industriell skaliert werden? Das [SASE-Paper](https://arxiv.org/html/2509.06216v2) liefert einen wissenschaftlichen Rahmen dafür – und zeigt, wohin die Reise für unser Berufsfeld geht.

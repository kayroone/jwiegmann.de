---
title: "Software Engineering im KI-Zeitalter (Teil 2: Praxis)"
date: "2026-01-26"
excerpt: "Praxisguide Teil 2: Templates, Commands, Agents und das Autonomie-Spektrum zwischen MAD und Ralph"
tags: ["AI", "Claude Code", "Workflow", "Autonomie", "Best Practices"]
---

_Dies ist Teil 2 einer dreiteiligen Serie._

- _[Teil 1: Theorie](./warum-gute-entwickler-mit-ai-besser-werden)_
- _Teil 3: Zukunft (coming soon)_

---

## Inhaltsverzeichnis

- [Einleitung](#einleitung)
- [Prompt-Templates](#prompt-templates)
- [Context-Isolation](#context-isolation)
- [Agents & Plugins](#agents--plugins)
- [Session-Management](#session-management)
- [Wie viel Autonomie ist sinnvoll? MAD vs. Ralph erklärt](#wie-viel-autonomie-ist-sinnvoll-mad-vs-ralph-erklärt)
- [Fazit: Lessons Learned](#fazit-lessons-learned)

## Einleitung

Aus dem ursprünglich geplanten Follow-up zu meinem ersten Artikel ist eine Trilogie geworden. Das Thema war einfach zu groß für einen einzigen Nachfolger: [Teil 1](./warum-gute-entwickler-mit-ai-besser-werden) behandelt die Theorie – warum Zerlegung wichtig ist und wie Fehlerraten funktionieren. Dieser zweite Teil hier zeigt mein konkretes Praxis-Setup. Und in Teil 3 wird es um die Zukunft gehen – was passiert, wenn diese Patterns industriell skaliert werden.

Für PoCs und Prototyping bin ich in den letzten Wochen komplett auf Maximal Agentic Decomposition (MAD) aus Teil 1 umgestiegen. Mit der Zeit haben sich Workflows, Tools und kleinere Kniffe ergeben – manche verbessern nur die Quality of Life, andere die konkreten Ergebnisse erheblich. Inzwischen fühlt sich mein Setup effizient und ausgereift an. Hier stelle ich es euch vor: konkrete Templates, Tools und Entscheidungshilfen.

## Prompt-Templates

Während der Nutzung von MAD und dem Erstellen von granularen Arbeitspaketen ist mir zunächst eines aufgefallen: Der Flow für die Planung und das Schneiden der Arbeitspakete ist immer gleich. Mir kam also die Idee, zumindest dafür schon mal eine Art Template zu nutzen.

Mittlerweile habe ich für die wichtigsten Phasen meiner Arbeit standardisierte Prompts, die ich nur noch mit dem konkreten Vorhaben befülle. Das spart Zeit, sorgt für konsistente Ergebnisse und reduziert die kognitive Last – ich muss nicht jedes Mal neu überlegen, wie ich die Anfrage formuliere.

### MAD-Kickoff

Der wichtigste Prompt: Hier startet jedes größere Vorhaben. Das Template zerlegt das Feature in testbare Arbeitspakete und definiert gleich die Tests dazu (TDD-Ansatz).

```markdown
Wende MAD (Maximal Agentic Decomposition) auf folgendes Feature an:

[VORHABEN HIER EINFÜGEN]

Gehe dabei wie folgt vor:

1. **Analyse & Zerlegung**
   - Zerlege das Vorhaben in die kleinstmöglichen, unabhängigen Arbeitspakete
   - Jedes Arbeitspaket muss durch mindestens einen automatisierten Test verifizierbar sein
   - Definiere klare Eingaben, Ausgaben und Akzeptanzkriterien pro Paket

2. **Test-First Definition (TDD)**
   - Schreibe für jedes Arbeitspaket zuerst den/die Test(s)
   - Führe jeden Test einmal aus, um zu verifizieren, dass er erwartungsgemäß fehlschlägt (Red)
   - Dokumentiere das erwartete Fehlverhalten

3. **Implementierungsplan**
   - Erstelle eine priorisierte Reihenfolge der Arbeitspakete (Abhängigkeiten beachten)
   - Pro Paket: Implementiere nur so viel Code, bis der Test grün wird (Green)
   - Tests dürfen während der Implementierungsphase NICHT geändert werden

4. **Fortschritts-Tracking**
   - Nach jedem abgeschlossenen Arbeitspaket: Dokumentiere Status, Erkenntnisse, ggf. Anpassungen
   - Format: [ ] Paket X: [Beschreibung] - Status: Red/Green/Done

5. **Output-Format**
   Erstelle den Plan als Markdown mit folgender Struktur:
   - Übersicht des Vorhabens
   - Liste aller Arbeitspakete mit: ID, Beschreibung, Test-Kriterien, Abhängigkeiten
   - Implementierungsreihenfolge
   - Fortschritts-Tracker (Checkbox-Liste)
```

### Plan-Review & Interview

Bevor ich mit der Implementierung starte, lasse ich den Plan nochmal prüfen. Das Template stellt sicher, dass keine Lücken übersehen werden – und fragt aktiv nach, wenn etwas unklar ist.

```markdown
Führe jetzt einen dreistufigen Review-Prozess durch:

**Stufe 1: Autonomie-Check**
Lies den erstellten Plan mit allen Arbeitspaketen und prüfe:

- Kann jedes Arbeitspaket unabhängig von den anderen umgesetzt werden?
- Ist jedes Arbeitspaket durch einen automatisierten Test verifizierbar?
- Sind alle Abhängigkeiten zwischen Paketen explizit dokumentiert?
- Gibt es versteckte Annahmen oder unklare Anforderungen?

Dokumentiere gefundene Probleme und schlage Anpassungen vor.

**Stufe 2: Detailliertes Interview**
Nutze das AskUserQuestion-Tool, um mich zu folgenden Aspekten zu befragen:

- Technische Implementierung: Frameworks, Libraries, Architekturentscheidungen
- UI/UX: Benutzerinteraktion, Darstellung, Flows (falls relevant)
- Edge Cases: Grenzfälle, Fehlerszenarien, unerwartete Eingaben
- Concerns: Sicherheit, Performance, Wartbarkeit
- Tradeoffs: Bekannte Kompromisse, akzeptable Einschränkungen
- Priorisierung: Must-have vs. Nice-to-have Features

Frage gezielt nach - stelle lieber eine Frage zu viel als eine zu wenig.

**Stufe 3: Finalisierung**
Aktualisiere den Plan mit allen Erkenntnissen aus dem Interview.
Markiere den Plan als "Bereit zur Implementierung".
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

Nach der Implementierung oder bei Pull Requests nutze ich dieses Template für strukturierte Reviews. Der Fokus liegt auf dem "5-Sekunden-Test" – ist der Code sofort verständlich?

```markdown
Führe ein Code-Review der letzten Änderungen durch. Fokussiere auf:

1. **Korrektheit**: Erfüllt der Code die Anforderungen aus dem Plan?
2. **Lesbarkeit**: Ist der Code in 5 Sekunden verständlich?
3. **Einfachheit**: Gibt es unnötige Abstraktionen oder Overengineering?
4. **Tests**: Sind alle Edge Cases abgedeckt?
5. **Sicherheit**: OWASP Top 10 Prüfung
6. **Konsistenz**: Passt der Code zum bestehenden Stil der Codebase?

Gib konkretes Feedback mit Datei:Zeile Referenzen.
Unterscheide zwischen: Muss geändert werden / Sollte geändert werden / Vorschlag
```

### Debugging-Session

Bei Bugs starte ich mit diesem Template eine systematische Fehlersuche. Wichtig: Erst einen Test schreiben, der den Bug reproduziert, dann fixen.

```markdown
Ich habe ein Problem: [PROBLEMBESCHREIBUNG]

Gehe systematisch vor:

1. Reproduziere das Problem (verstehe den Fehler genau)
2. Formuliere eine Hypothese zur Ursache
3. Sammle Beweise (Logs, Stacktraces, Testfälle)
4. Identifiziere die Root Cause
5. Schlage eine Lösung vor - erkläre das "Warum"
6. Schreibe erst einen Test, der den Bug reproduziert
7. Implementiere den Fix
8. Verifiziere, dass der Test jetzt grün ist
```

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

Wer mit Claude Code arbeitet, nutzt Agents und Plugins oft, ohne es bewusst zu merken. Im Hintergrund delegiert Claude Code Teilaufgaben an spezialisierte **Built-in Agents**: Der Explore-Agent recherchiert die Codebase (günstig, weil er auf dem kleineren Haiku-Modell läuft), der Plan-Agent entwirft Architekturen im Read-only-Modus, und der general-purpose Agent übernimmt komplexe Multi-Step-Tasks. Der Clou: Claude Code entscheidet selbst, wann ein Subagent sinnvoll ist. Man merkt es an der Statuszeile – und daran, dass der Context nicht mit tausenden Zeilen Test-Output zugemüllt wird.

Daneben gibt es **Community-Plugins**, die sich über den Plugin-Marketplace installieren lassen. In meinem Setup nutze ich unter anderem:

- `/commit` und `/commit-push-pr` – Strukturierte Commits und PRs, ohne manuell `git add` und Commit-Messages formulieren zu müssen
- `/feature-dev` – Geführte Feature-Entwicklung mit spezialisierten Agenten (code-architect, code-explorer, code-reviewer)
- `/code-review` – PR-Reviews auf Knopfdruck

Das Zusammenspiel aus Plugins, Built-in Agents und einer gut gepflegten **CLAUDE.md** ergibt ein Setup, das im Hintergrund mitdenkt. Die CLAUDE.md fungiert dabei als eine Art stille Konfiguration: Workflow-Trigger erkennen automatisch, ob ich gerade debugge oder ein Feature plane, und die Review-Checkliste wird nach jeder Änderung angewandt – ohne dass ich sie jedes Mal explizit anfordern muss.

> **Info-Box: Eigene Commands erstellen**
>
> Wer wiederkehrende Workflows hat, die kein bestehendes Plugin abdeckt, kann eigene Custom Slash Commands schreiben. Ein Command ist eine einfache Markdown-Datei im `commands`-Verzeichnis:
>
> - `.claude/commands/mein-command.md` — **projekt-spezifisch**
> - `~/.claude/commands/mein-command.md` — **global**
>
> Der Inhalt ist reines Markdown – eine Prompt-Vorlage, die Claude beim Aufruf als Anweisung erhält:
>
> ```
> Führe die Tests aus und gib nur eine Zusammenfassung zurück:
> Anzahl bestanden, fehlgeschlagen, und die Fehlermeldungen.
>
> Wenn $ARGUMENTS angegeben: Führe nur die Tests für dieses Modul aus.
> ```
>
> `$ARGUMENTS` ist ein Platzhalter, der beim Aufruf durch den Text nach dem Command-Namen ersetzt wird:
>
> `/user:test-runner auth-module` setzt `$ARGUMENTS` auf `auth-module`.
>
> **Wann lohnt sich ein eigener Command?**
>
> Wenn du denselben Prompt-Workflow mindestens 3x pro Woche nutzt und er immer gleich abläuft – zum Beispiel ein Session-Handover, der den aktuellen Stand zusammenfasst, oder ein Test-Runner mit festem Output-Format.
>
> **Abgrenzung zu Plugins:**
>
> Für komplexere Workflows – mit eigenen Subagents, Tool-Einschränkungen oder isoliertem Context – gibt es das Plugin-System mit installierbaren Skills (z.B. `/feature-dev`, `/code-review`). Custom Commands sind die leichtgewichtige Variante für den Alltag.

## Session-Management

Context-Isolation hilft gegen Rauschen innerhalb einer Konversation. Aber es gibt noch ein zweites Problem: Der Context füllt sich über die Dauer einer Session auch mit _relevantem_ Inhalt – und irgendwann wird es zu viel. Die Statuszeile in Claude Code zeigt die Context-Auslastung in Prozent. Ab etwa **60-70%** merkt man, dass Antworten ungenauer werden – Claude "vergisst" Entscheidungen von früher in der Session oder ignoriert Teile der CLAUDE.md. Spätestens bei **80%** sollte man wechseln, nicht erst wenn der Context voll ist. Wer bis 95% wartet, arbeitet die letzten 20% mit spürbar schlechterer Qualität.

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

## Wie viel Autonomie ist sinnvoll? MAD vs. Ralph erklärt

Bisher ging es darum, _wie_ man mit Claude Code arbeitet: Templates, Context-Isolation, Session-Management. Aber eine Frage haben wir noch nicht beantwortet: Wie viel Kontrolle brauche ich eigentlich?

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

"Garbage In, Garbage Out" kennt jeder. Mit autonomen Workflows wird daraus "Garbage In, Garbage Out – aber jetzt mit Turbo". Claude implementiert _genau das_, was im Plan steht – nicht mehr, nicht weniger. Fehlende Edge Cases im Plan bedeuten fehlende Edge Cases im Code. Und das erkennt man oft erst spät.

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

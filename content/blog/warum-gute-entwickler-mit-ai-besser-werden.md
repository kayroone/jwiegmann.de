---
title: "Software Engineering im KI-Zeitalter (Teil 1: Theorie)"
date: "2026-01-05"
excerpt: "Ein Praxisguide: Wie präzises Prompting zu sauberem Code führt und warum AI ein Verstärker ist, kein Ersatz"
tags:
  ["AI", "Claude Code", "Prompting", "Software Engineering", "Best Practices"]
---

_Dies ist Teil 1 einer dreiteiligen Serie._

- _[Teil 2: Praxis](./software-engineering-im-ki-zeitalter-praxis)_
- Teil 3: Zukunft (comming soon)

---

> **TL;DR:** KI ist ein Verstärker, kein Ersatz. Komplexe Prompts scheitern mathematisch (~99,99% Fehlerrate bei 1.000 internen Schritten). Die Lösung: Maximal Agentic Decomposition (MAD), also Aufgaben in 5-15 minimale Einzelschritte zerlegen. Context Engineering und systematische Verifikation sind entscheidend. Blindes Vertrauen ist gefährlich.

## Inhaltsverzeichnis

- [Einleitung](#einleitung)
- [Warum komplexe Prompts scheitern](#warum-komplexe-prompts-scheitern)
- [Maximal Agentic Decomposition (MAD)](#maximal-agentic-decomposition-mad)
- [Die Anatomie eines effektiven Prompts](#die-anatomie-eines-effektiven-prompts)
- [Mein persönliches Fazit](#mein-persönliches-fazit)
- [Quellenübersicht](#quellenübersicht)
- [Anhang: Kurzreferenz & Best Practices](#anhang-kurzreferenz--best-practices)

## Einleitung

Die Stimmung in der deutschen Entwicklerszene ist angespannt. An der Börse bildet sich eine KI-Blase, Unternehmen kündigen Mitarbeiter, und sofort heißt es: "Die KI nimmt uns die Jobs weg." Nur wie so oft: so einfach ist es nicht.

KI ist ein Werkzeug. Meiner Meinung nach das mächtigste, das wir als Entwickler je bekommen haben. Sie beschleunigt Routineaufgaben, hilft beim Refactoring, generiert Boilerplate in Sekunden. Aber sie bleibt genau das: ein Werkzeug. Kein Wundermittel. Und erst recht kein eigener autarker Softwareentwickler, der uns die Jobs wegnimmt.

"A fool with a tool is still a fool". Dieser Spruch ist aktueller denn je und passt in diesem Kontext wohl ganz gut. KI ersetzt kein gutes Software-Engineering. Sie verstärkt, was schon da ist. Gute Entwickler werden effizienter. Schlechte produzieren mehr Technical Debt oder schlimmer noch: kritische Sicherheitslücken.

**Die Arbeitsweise mit der KI ist der entscheidende Faktor.** Nicht das eingesetzte Modell, nicht die "perfekte Formulierung", sondern wie du die Aufgabe zerlegst, wie du Context lieferst, wie du Ergebnisse verifizierst.

Für diese Vorgehensweise gibt es mittlerweile wissenschaftliche Erkenntnisse: **Maximal Agentic Decomposition (MAD)**, die extreme Zerlegung komplexer Aufgaben in chirurgisch kleine Tasks ([MAKER-Paper](#quellenübersicht), 2025), und die Forschung zu **LLM-as-Judge Bias**, die zeigt, warum blindes Vertrauen auf KI-Bewertungen systematisch zu falschen Qualitätseinschätzungen führt ([LLM-as-Judge Paper](#quellenübersicht), 2025). Beide Konzepte belegen empirisch, was viele Entwickler intuitiv spüren: Die Art, wie man mit KI zusammenarbeitet, macht den entscheidenden Unterschied.

KI wird kein vorübergehender Trend sein, sondern unseren Arbeitsalltag - nicht nur in der Softwareentwicklung - dauerhaft prägen. Deshalb ist es entscheidend, den richtigen Umgang damit zu erlernen. Dieser Artikel zeigt dir genau das: Wie du KI einsetzt, um als Softwareentwickler effizienter zu werden, aber auch welche Risiken mit der Nutzung einhergehen.

## Warum komplexe Prompts scheitern

Starten wir mit einem simplen Beispiel: Du bist Softwareentwickler und hast die Arbeit mit Large Language Models (LLM) für dich entdeckt. Du sollst einen neuen Spring Boot Service schreiben, der Service soll einen Authentifizierungs-Layer besitzen, fachliche Validierungsregeln anwenden und CRUD-Operationen auf der Datenbank ausführen. Du startest dein LLM und schreibst ihm genau das: "Baue mir einen Spring Boot Service mit funktionierender Authentifizierung, Validierung für die Input-Daten und einem Service, der in der Lage ist, CRUD-Operationen auf der Datenbank auszuführen".

Das LLM beginnt zu arbeiten und generiert das, was aus seiner Sicht am wahrscheinlichsten passt. Es wählt Framework X für die Authentifizierung, bindet eigenständig Frameworks zur Validierung ein, nutzt unter Umständen keine Bean-Validation, obwohl du diese in allen anderen Services verwendest. Auch die Datenbank-Engine wurde anders gewählt: Ihr verwendet im Projekt MySQL, implementiert wurde PostgreSQL.

Das Ergebnis ist also fundamental anders als das, was du eigentlich wolltest. Obwohl es irgendwie in die richtige Richtung geht, kannst du damit trotzdem nichts anfangen. Oder noch schlimmer: Es wurden veraltete Libraries eingebunden, die mittlerweile als unsicher eingestuft werden. Das LLM hat also aktiv Sicherheitslücken in deinen Service eingebaut. Aber warum?

Ein LLM ist eine "Next-Token-Prediction-Machine". Es berechnet anhand der Daten, mit denen es trainiert wurde, immer die höchste Wahrscheinlichkeit für das Wort, das als nächstes folgen soll. Das gilt auch beim Coden.

LLM haben eine sog. **persistente Fehlerrate pro Reasoning-Schritt**. Was nach außen wie "ein Prompt" aussieht, ist intern eine komplexe Kette von hunderten Entscheidungen: API-Design überlegen, Datenmodell strukturieren, Validierungslogik implementieren, Error-Cases behandeln, Authentication-Flow entwerfen, Tests schreiben uvm.. Jeder dieser internen Schritte kann fehlschlagen, und die Wahrscheinlichkeiten multiplizieren sich. Was genau heißt das jetzt?

Eine Antwort darauf liefert uns das [MAKER-Paper](#quellenübersicht): Selbst bei einer minimalen Fehlerrate von nur 1% pro Schritt bedeutet das bei 100 internen Schritten eine Gesamtfehlerwahrscheinlichkeit von ~63%. Bei 1.000 Schritten? Praktisch 100% (99,99%) Fehlerwahrscheinlichkeit. Dein "simpler" Prompt für den Spring Boot Service? Intern hunderte von Entscheidungen, jede einzelne eine potenzielle Fehlerquelle.

### Info-Box: MAKER Paper - Persistente Fehlerraten

> **📊 Forschung: MAKER Paper (November 2025)**
> _Cognizant AI Lab & UT Austin_ • [arxiv.org/abs/2511.09030](https://arxiv.org/abs/2511.09030)
>
> LLMs haben eine **persistente Fehlerrate** pro Reasoning-Schritt. Die Konsequenzen bei komplexen Prompts:
>
> | Fehlerrate pro Schritt | Bei 100 Schritten | Bei 1.000 Schritten  |
> | ---------------------- | ----------------- | -------------------- |
> | **1%**                 | ~63% Gesamtfehler | ~99,99% Gesamtfehler |
> | **0,1%**               | ~10% Gesamtfehler | ~63% Gesamtfehler    |
>
> **Warum steigt die Fehlerrate exponentiell?**
>
> Die Erfolgswahrscheinlichkeiten multiplizieren sich: Bei 1% Fehlerrate pro Schritt bedeutet das (0,99)^100 = 36,6% Erfolg → 63,4% Fehler. Jeder weitere Schritt verschlechtert die Gesamtwahrscheinlichkeit überproportional. Das erklärt, warum komplexe Aufgaben in einem Rutsch oft scheitern: Die Fehlerrate explodiert mit der Anzahl interner Entscheidungen.

### Die Konsequenz

Ein komplexer Prompt ist keine atomare Operation, sondern eine versteckte Kette von hunderten Einzelentscheidungen, bei der sich die Fehlerwahrscheinlichkeiten multiplizieren. Dein "Baue mir einen Service" löst intern einen komplexen Reasoning-Prozess aus: Welche Libraries? Welche Patterns? Welche Datenbank? Wie Authentication? Welche Validierung? Jede dieser Entscheidungen baut auf der vorherigen auf, und ein früher Fehler pflanzt sich durch die gesamte Kette fort.

### Die Lösung

Die Antwort ist nicht, "bessere" oder "präzisere" Prompts zu schreiben. Die Antwort ist: Extreme Zerlegung in minimale Einzelschritte. Statt einem 1.000-Schritte-Prompt mit 99,99% Fehlerwahrscheinlichkeit → zehn 100-Schritte-Prompts mit je 63% Fehlerwahrscheinlichkeit. Oder noch besser: hundert 10-Schritte-Prompts mit je ~10% Fehlerwahrscheinlichkeit. Wie genau das geht, wird im nächsten Kapitel mit Maximal Agentic Decomposition - kurz MAD - genauer beschrieben.

## Maximal Agentic Decomposition (MAD)

Statt "Baue mir eine komplette REST-API mit Authentication, CRUD-Operationen und Validierung" sieht der Prozess eher so aus: Erst nur die Ressource klären. Dann nur die HTTP-Methode. Dann nur die Request-Felder. Jede Entscheidung ein eigener Schritt, jedes Ergebnis sofort verifiziert. Das [MAKER-Paper](#quellenübersicht) nennt diesen Ansatz Maximal Agentic Decomposition (MAD), die konsequente Zerlegung bis zur kleinsten sinnvoll testbaren Einheit.

Wann ist ein Schritt klein genug? Das [MAKER-Paper](#quellenübersicht) gibt eine klare Antwort: Alles, was über 50 Zeilen Code hinausgeht, ist zu groß. Meiner persönlichen Erfahrung nach sind selbst 50 Zeilen zu groß, besser wären 10. Zudem gilt: Wenn du das Ergebnis in Sekunden prüfen kannst, wenn Fehler sofort auffallen, und wenn du bei einem falschen Ergebnis nicht raten musst, was schiefgelaufen ist, dann hast du die richtige Größe gewählt. Wer mit JIRA oder ähnlichen Tools arbeitet, kennt das Prinzip: Ein gutes Ticket hat eine klare Beschreibung, messbare Akzeptanzkriterien und ist unabhängig abarbeitbar. MAD überträgt genau das auf Prompts. Ein Prompt = ein Ticket. Klarer Input, definierter Output, verifizierbare Akzeptanzkriterien. Ein Fehler in Schritt 7 kompromittiert nicht die Schritte 1-6.

Das Paper zeigt zudem etwas Kontraintuitives: Bei gut zerlegten Aufgaben schneiden kleinere, günstigere Modelle genauso gut ab wie große Reasoning-Modelle. Im Experiment war gpt-4.1-mini ausreichend, nicht weil es "schlauer" ist, sondern weil jeder Einzelschritt einfach genug war. Die Intelligenz steckt in der Zerlegung, nicht nur im Modell.

Aber wie geht man jetzt konkret vor? Gibt es ein Pattern für effektive Prompts? Im nächsten Kapitel beleuchte ich dazu meine persönlichen Erfahrungen mit dem LLM Claude Code.

## Die Anatomie eines effektiven Prompts

Basierend auf den [Anthropic Best Practices](#quellenübersicht) (2024), den Guidelines des Frameworks [Fabric](#quellenübersicht) und den wissenschaftlichen Ansätzen aus den Papern [MAKER](#quellenübersicht) (2025) und [LLM-as-Judge](#quellenübersicht) (2025) habe ich mich also selbst ran gemacht und den bereits als Beispiel genannten Spring Boot REST Service mit Hilfe der KI Claude Code geschrieben. Wie bin ich vorgegangen?

### 1. Context Engineering - Den Rahmen schaffen

Claude weiß nicht, dass wir im Team Spring Boot 3.2 mit Java 21 verwenden, dass unsere Services dem ECB-Pattern folgen, oder dass wir Bean Validation statt manueller Checks einsetzen. Ohne diesen Kontext rät das Modell, und es rät oft falsch.

Der erste Schritt ist daher ein Markdown-File mit dem Projektkontext: Tech-Stack, Architektur-Entscheidungen, Constraints, bestehende Conventions. Das ist die "Single Source of Truth", auf die sich alle weiteren Prompts beziehen. Bereits hier gilt, je genauer du wirst, umso genauer sind später die Ergebnisse, die das LLM liefert. Im besten Fall kann hier bereits auf ein Referenz-Projekt verwiesen werden, das bereits den Ziel-Context implementiert. Ein exemplarisches Project-Context Markdown-File könnte daher wie folgt aussehen:

```markdown
# Projektkontext: User-Service

## Tech-Stack

- Java 21, Spring Boot 3.2
- MySQL 8.0, Spring Data JPA
- Bean Validation (jakarta.validation)
- Lombok für Boilerplate-Reduktion

## Architektur

- Package-Struktur: ECB-Pattern (Entity, Control, Boundary)
- REST-Controller in `boundary/`, Services in `control/`, Entities in `entity/`
- DTOs für API-Kommunikation, Entities für Persistenz

## Constraints

- Keine Records verwenden (Lombok @Data stattdessen)
- Constructor Injection mit @RequiredArgsConstructor
- Fehlerbehandlung zentral via @ControllerAdvice
- API-First: OpenAPI-Spec existiert bereits

## Bestehende Referenz

- Siehe `order-service/` für identische Struktur
```

### 2. MAD anwenden - Chirurgisch kleine Tasks

Mit dem Projektkontext steht das "Was". Jetzt kommt das "Wie": die Zerlegung in Arbeitspakete. Statt "Implementiere den User-Service" definiere ich jeden Schritt einzeln im selben MD-File, mit klarer Notation: Was ist der Input? Was ist der erwartete Output? Welche Edge Cases gibt es? Diese Arbeitspakete ordne ich Implementierungsphasen zu. Am Ende steht ein vollständiger Entwicklungsplan vom leeren Projekt bis zum fertigen Service.

Der Vergleich zur Sprint-Planung liegt nahe: Bevor das Team loslegt, werden alle Tickets gesichtet und detailliert refined. Je sauberer die Ticket-Beschreibung, desto wahrscheinlicher ein lauffähiges Inkrement am Sprint-Ende. Genauso hier: erst wenn der Plan steht, ergibt es Sinn, mit Claude Code im Planungsmodus darüber zu gehen.

```markdown
## Implementierungsplan: User-Service

### Phase 1: Datenschicht

#### 1.1 User Entity erstellen

- **Input:** Projektkontext (siehe oben), Felder: id, email, firstName, lastName, createdAt
- **Output:** `entity/User.java` mit JPA-Annotations, Lombok @Data
- **Edge Cases:** email muss unique sein (DB-Constraint)

#### 1.2 UserRepository erstellen

- **Input:** User Entity aus 1.1
- **Output:** `entity/UserRepository.java` als Spring Data JPA Interface
- **Edge Cases:** keine

### Phase 2: Service Layer

#### 2.1 UserService Interface definieren

- **Input:** CRUD-Operationen: create, findById, findAll, update, delete
- **Output:** `control/UserService.java` Interface mit Methodensignaturen
- **Edge Cases:** keine

#### 2.2 UserService Implementation

- **Input:** UserService Interface, UserRepository
- **Output:** `control/UserServiceImpl.java` mit @Service
- **Edge Cases:** findById → Optional.empty bei nicht gefundenem User

### Phase 3: API Layer

#### 3.1 UserDTO erstellen

- **Input:** User Entity Felder (ohne createdAt für Request)
- **Output:** `boundary/UserDTO.java` mit Lombok @Data
- **Edge Cases:** keine

#### 3.2 UserController erstellen

- **Input:** UserService, UserDTO, REST-Konventionen
- **Output:** `boundary/UserController.java` mit GET/POST/PUT/DELETE
- **Edge Cases:** 404 bei nicht gefundenem User, 400 bei Validierungsfehler
```

Steht der Entwicklungsplan, lasse ich Claude Code im Planungsmodus darüber gehen. Der Vorteil: Claude analysiert den Plan, identifiziert fehlende Schritte oder Abhängigkeiten, und schlägt Verfeinerungen vor, bevor eine einzige Zeile Code geschrieben wird. So entstehen Fehler im Plan, nicht im Code. Und Fehler im Plan sind billiger zu beheben.

### 3. Output Requirements

Der Plan steht, die Implementierung beginnt. Aber selbst bei einem kleinen Arbeitspaket wie "1.1 User Entity erstellen" kann Claude in verschiedene Richtungen gehen: Wie viele Zeilen Code? Mit oder ohne Kommentare? Welche Annotations genau? Ohne klare Vorgaben entscheidet das Modell selbst, und entscheidet auch hier oft anders als gewünscht.

Hier verfeinere ich den bereits definierten Output der Arbeitspakete mit expliziten Anforderungen: Maximale Zeilenzahl, erwartetes Format, zu verwendende Libraries. Und genauso wichtig: was explizit nicht verwendet werden soll.

```markdown
#### 1.1 User Entity erstellen (Output um weitere Requirements verfeinert)

- **Input:** Projektkontext, Felder: id, email, firstName, lastName, createdAt
- **Output:** `entity/User.java`
  - Max. 30 Zeilen Code
  - Lombok: @Data, @Entity, @NoArgsConstructor
  - ID: @Id, @GeneratedValue(strategy = GenerationType.IDENTITY)
  - createdAt: @CreationTimestamp
  - Keine Kommentare, keine Javadoc
- **Nicht verwenden:** @Builder, @AllArgsConstructor, manuelle Getter/Setter
- **Edge Cases:** email mit @Column(unique = true)
```

### 4. Red-Flagging - Warnsignale erkennen

Wir haben bereits gelernt, dass nicht jede Antwort von Claude brauchbar ist. Das gilt auch für präzise ausformulierte Prompts. Das [MAKER-Paper](#quellenübersicht) identifiziert klare Warnsignale, die auf fehlerhafte Reasoning-Ketten hindeuten. Wichtig: Diese Antworten nicht reparieren, sondern neu generieren. Meine Erfahrungen sind hier die folgenden:

| Signal                                   | Bedeutung                                    | Aktion                               |
| ---------------------------------------- | -------------------------------------------- | ------------------------------------ |
| **Überlange Antworten** (>50-100 Zeilen) | Das Modell ist "verwirrt" und overanalysiert | Stoppen, Prompt neu formulieren      |
| **Formatierungsfehler**                  | Zeichen für fehlerhafte Reasoning-Kette      | Stoppen, Prompt neu formulieren      |
| **Wirre Struktur**                       | Inkonsistente oder unlogische Gliederung     | Schritt zu groß, granularer zerlegen |

### 5. Voting für kritische Entscheidungen

Bei Architektur-Entscheidungen oder sicherheitskritischem Code reicht eine einzelne Antwort nicht aus. Das [MAKER-Paper](#quellenübersicht) (2025) empfiehlt Voting: Dieselbe Frage mehrfach stellen, mit leicht variiertem Wording, und die Antworten vergleichen. Konsistente Antworten bedeuten hohe Konfidenz. Inkonsistenz zeigt: Hier braucht es tiefere Analyse.

| Ergebnis                 | Bedeutung          | Aktion                     |
| ------------------------ | ------------------ | -------------------------- |
| **3/3 gleich**           | Hohe Konfidenz     | Entscheidung übernehmen    |
| **2/3 gleich**           | Moderate Konfidenz | Manuelle Prüfung empfohlen |
| **Alle unterschiedlich** | Frage zu unklar    | Anforderungen präzisieren  |

**Wichtig:** Bei sicherheitskritischem Code (Authentifizierung, Autorisierung, Kryptographie) oder zentraler Business-Logik (Core Domain) solltest du auch bei 3/3 Konsistenz das Ruder selbst in die Hand nehmen. Voting liefert Konfidenz, keine Garantie. Diese Bereiche sind zu kritisch, um sie vollständig an ein LLM zu delegieren. Hier bleiben manuelle Implementierung und Review unverzichtbar.

Und hier zeigt sich der Unterschied zwischen erfahrenen und unerfahrenen Entwicklern: Voting liefert Konsistenz, nicht Wahrheit. Wer 15 Jahre Java-Erfahrung mitbringt, erkennt, wenn Claude dreimal denselben suboptimalen Ansatz vorschlägt. Die eigene Expertise bleibt der finale Filter. Das LLM ist ein Werkzeug, die eigene Erfahrung sollte immer Vorrang haben.

### Das Ergebnis

Den vollständigen User-Service findest du auf GitHub: [mad-user-service](https://github.com/kayroone/mad-user-service). Er wurde exakt nach dem beschriebenen Vorgehen erstellt, vom Projektkontext über die Arbeitspakete bis zur Implementierung mit Claude Code.

## Mein persönliches Fazit

Mein erster Gedanke, nachdem ich den User-Service mit Claude Code und MAD umgesetzt habe, war: Das hat erschreckend gut geklappt. Der Code ist sauber, gut dokumentiert, vertestet. Besser hätte ich es selbst nicht hinbekommen. Die Zeit, die ich für den Service benötigt habe, ist in etwa dieselbe geblieben, nur hat sich die Aufteilung verschoben: Die Planungsphase hat fast die gesamte Zeit eingenommen, während die eigentliche Implementierung nur noch ein Fingerschnipp war.

Was bedeutet das jetzt für mich? Nun ja, zunächst einmal die bittere Erkenntnis: Ich kenne den Code nicht. Bei komplexen fachlichen Vorhaben wird das kritisch, weil die Codebase mit der Zeit schwer wartbar wird. Des Weiteren hat mir persönlich das Coding gefehlt. Ich bin neben meinem Job als Architekt eben immer noch Softwareentwickler und möchte auch weiterhin selbst Code schreiben. Außerdem habe ich das Gefühl, dass gerade Junioren so das tiefgreifende Verständnis der Technologien nicht vermittelt wird. Als Junior muss man oft hinfallen und wieder aufstehen, um Dinge wirklich zu verstehen. Das geht hier schnell verloren.

Dennoch führt kein Weg daran vorbei: KI ist gekommen, um zu bleiben. Dafür ist sie zu bequem und liefert zu schnell Ergebnisse, als dass sie wieder vom Markt verschwinden würde. Genau deshalb ist es so wichtig, dass wir lernen, wie man richtig und kompetent mit diesen Tools arbeitet, statt uns blind auf sie zu verlassen.

Meine klare Empfehlung ist daher zugleich auch ein Appell: KI-Tools müssen mit Eigenverantwortung und bewusst begrenzt eingesetzt werden. Der Weg dahin führt über die Bildungseinrichtungen, die früh auf die Risiken hinweisen und gleichzeitig lehren müssen, wie man die Tools sinnvoll in den Arbeitsalltag integriert. Wenn ihr zum KI-Tool greift, fragt euch immer: Habe ich das, was ich erreichen möchte, wirklich verstanden, oder nutze ich das Tool nur aus Bequemlichkeit und verliere dabei Wissen?

### Der Entwickler der Zukunft

Der Entwickler der Zukunft wird meiner Meinung nach also kein reiner "Prompt-Schreiber", aber auch kein manueller Coder mehr sein - sondern ein "Engineer von Micro-Workflows". Die neuen Schlüsselkompetenzen sind Task Decomposition (wie die Maximal Agentic Decomposition), Context Engineering, Red-Flagging und systematische Verifikation. Sie ersetzen nicht die klassischen Software-Engineering Skills, sie bauen darauf auf. Architektur, Design Patterns, Clean Code, Testing: All das bleibt die Grundlage, denn KI braucht immer einen kompetenten Menschen, der sie kontrolliert.

Das Wichtigste muss gegeben sein: Das Verständnis für den Code. Wer nicht mehr versteht, was der Code tut, produziert nicht schneller guten Code, sondern schneller einen technischen Schuldenberg.

Damit verabschiede ich mich und wünsche euch ein erfolgreiches Jahr 2026!

Jan

## Quellenübersicht

| #   | Ressource                    | Typ           | Link                                                                                          |
| --- | ---------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| 1   | Anthropic Prompt Engineering | Dokumentation | [docs.anthropic.com](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering) |
| 2   | Fabric Framework             | Framework     | [github.com/danielmiessler/fabric](https://github.com/danielmiessler/fabric)                  |
| 3   | MAKER Paper                  | Paper         | [arxiv.org/abs/2511.09030](https://arxiv.org/abs/2511.09030)                                  |
| 4   | MAKER Video                  | Video         | [youtube.com](https://www.youtube.com/watch?v=gLkehsQy4H4)                                    |
| 5   | LLM-as-Judge Paper           | Paper         | [arxiv.org/abs/2511.21140](https://arxiv.org/abs/2511.21140)                                  |
| 6   | LLM-as-Judge Code            | Code          | [github.com/UW-Madison-Lee-Lab](https://github.com/UW-Madison-Lee-Lab/LLM-judge-reporting)    |
| 7   | Prompt Engineering Guide     | Guide         | [promptingguide.ai](https://www.promptingguide.ai/)                                           |

## Anhang: Kurzreferenz & Best Practices

### Do's

• Extreme Zerlegung anwenden: Teile komplexe Aufgaben in 5-15 minimale Einzelschritte auf (MAD-Prinzip). Jeder Schritt sollte nicht mehr als 10-30 Zeilen Code umfassen und in unter 5 Minuten verifizierbar sein.

• Umfassenden Context liefern: Erstelle ein Projektkontext-Dokument mit Tech-Stack, Architektur-Entscheidungen, bestehenden Conventions und Constraints. Je detaillierter der Context, desto präziser die Ergebnisse.

• Red-Flagging praktizieren: Bei Warnsignalen wie überlangen Antworten (>50-100 Zeilen), Formatierungsfehlern oder wirrer Struktur den Prompt neu formulieren statt die fehlerhafte Antwort zu reparieren.

• Voting bei kritischen Entscheidungen: Stelle dieselbe Frage 3x mit leicht variiertem Wording und vergleiche die Antworten. Bei 3/3 konsistenten Antworten: hohe Konfidenz. Bei inkonsistenten Antworten: Anforderungen präzisieren.

• Jeden Schritt systematisch verifizieren: Überprüfe jeden generierten Code auf Kompilierbarkeit, Unit-Test-Abdeckung, Integration mit bestehendem Code und manuelle Code-Review.

• Manuelle Reviews durchführen: LLM-Reviews sind nur der erste Check. Kritische Business-Logik, Security-Aspekte und Performance-kritische Teile müssen manuell geprüft werden.

### Don'ts

• Große, komplexe Prompts verwenden: Vermeide Prompts wie "Baue mir Feature X komplett". Die Fehlerrate steigt exponentiell mit der Anzahl interner Entscheidungen ([MAKER-Paper](#quellenübersicht): ~99,99% Fehler bei 1.000 Schritten).

• Fehlerhafte Antworten reparieren: Versuche nie, fehlerhaften KI-Code zu korrigieren. Die zugrundeliegende Reasoning-Kette ist bereits kompromittiert. Besser: Prompt neu formulieren oder Schritt granularer zerlegen.

• Blind auf LLM-Reviews vertrauen: KI-Bewertungen haben einen systematischen Bias von 20-30% ([LLM-as-Judge Paper](#quellenübersicht)). Nutze sie nur als ersten Filter, nicht als finale Qualitätssicherung.

• Kleine Unterschiede überbewerten: Unterschiede unter 5% sind oft Rauschen. Konzentriere dich auf signifikante Abweichungen und nutze Integration-Tests als objektive Verifikation.

### Fehlerrate und Schrittgröße

| Prompt-Komplexität        | Interne Schritte | Fehlerrate (bei 1% pro Schritt) | Empfehlung           |
| ------------------------- | ---------------- | ------------------------------- | -------------------- |
| "Baue Feature X komplett" | ~1.000           | ~99,99%                         | Niemals so!          |
| "Implementiere Modul Y"   | ~100             | ~63%                            | Zu groß, zerteilen   |
| "Erstelle Funktion Z"     | ~10              | ~10%                            | Gut, wenn spezifisch |
| "Schreibe Getter für X"   | ~3               | ~3%                             | Optimal              |

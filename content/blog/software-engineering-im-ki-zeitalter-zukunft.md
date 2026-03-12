---
title: "Software Engineering im KI-Zeitalter (Teil 3: Zukunft)"
date: "2026-02-10"
excerpt: "Von Agentic Coding zu Agentic Engineering: Was das SASE-Framework über die Zukunft der Softwareentwicklung mit KI-Agenten verrät"
tags: ["AI", "Software Engineering", "SASE", "Agenten", "Zukunft"]
---

_Dies ist Teil 3 einer dreiteiligen Serie._

- _[Teil 1: Theorie](./warum-gute-entwickler-mit-ai-besser-werden)_
- _[Teil 2: Praxis](./software-engineering-im-ki-zeitalter-praxis)_

---

## Inhaltsverzeichnis

- [Einleitung](#einleitung)
- [Das SASE-Paper](#das-structured-agentic-software-engineering-sase-paper)
- [Die Produktivitäts-Vertrauens-Lücke](#die-produktivitäts-vertrauens-lücke)
- [Neue Artefakte statt Ad-hoc-Prompts](#neue-artefakte-statt-ad-hoc-prompts)
- [Das Reifegradmodell: SE 1.0 bis 5.0](#das-reifegradmodell-se-10-bis-50)
- [Multi-Agent-Teams: Was existiert von der SASE-Paper Theorie bereits heute?](#multi-agent-teams-was-existiert-von-der-sase-paper-theorie-bereits-heute)
- [Fazit: Die Disziplin erfindet sich neu](#fazit-die-disziplin-erfindet-sich-neu)
- [Quellenübersicht](#quellenübersicht)

## Einleitung

Im [ersten Teil](./warum-gute-entwickler-mit-ai-besser-werden) meiner Trilogie zum Thema Software Engineering im KI-Zeitalter ging es um die Theorie -- warum Zerlegung wichtig ist und wie sich Fehlerraten bei komplexen Prompts multiplizieren. Im [zweiten Teil](./software-engineering-im-ki-zeitalter-praxis) habe ich mein persönliches Setup mit Claude Code gezeigt: Templates, Agents, Skills -- und übergreifend den Fokus auf die Planung und Kontrolle der Code-Snippets, die geschrieben werden. Ich bin also bewusst noch weit entfernt von einer Vision (oder Dystopie?), in der Software autonom durch Agenten geschrieben wird. Wie in Teil 1 oft gesagt: Status quo ist KI für mich ein Tool -- wie eine IDE oder ein DBMS -- mehr nicht.

Aber wer sagt mir, dass das so bleibt? Das Potenzial ist da, und bei der rasanten Entwicklung in unserem Bereich ist es durchaus denkbar, dass sich genau das in naher Zukunft ändert. Einen ersten Blick in eine solche Zukunft haben Hassan et al. mit dem [SASE-Paper](https://arxiv.org/html/2509.06216v2) (Structured Agentic Software Engineering) gewagt. Diesem Paper möchte ich den dritten Teil meiner Trilogie widmen: Wie sieht agentengetriebene Softwareentwicklung in der Zukunft aus? Dieser Artikel gibt einen Ausblick auf Basis der Annahmen des Papers -- wie immer gepaart mit meiner eigenen Meinung. Happy reading!

## Das Structured Agentic Software Engineering (SASE) Paper

In meinem bisherigen Setup war immer die Rede von der Arbeit mit _einem_ KI-Agenten. Aber was passiert, wenn ich das hochskaliere? Wenn ich als Entwickler oder Architekt mit 10 Agenten gleichzeitig an mehreren Codebases arbeite -- und das alle Entwickler in einem Projekt tun? Wie sieht die tägliche Arbeit dann aus?

Genau diese Frage stellt das SASE-Paper. Viele Konzepte aus Teil 1 und 2 dieser Trilogie tauchen dort in formalisierter Form wieder auf. MAD wird zu strukturierten "BriefingScripts", meine Templates zu versionierten, maschinenlesbaren Artefakten, die CLAUDE.md zu einem "MentorScript". Das Paper gibt dem, was ich in den ersten beiden Teilen informell beschrieben habe, einen wissenschaftlichen Rahmen.

Im SASE-Paper wird unterschieden zwischen **Agentic Coding** vs. **Agentic Software Engineering**. Agentic Coding ist das, was wir in Teil 1 und 2 gesehen haben -- ein Entwickler steuert einen Agenten, 1:1, that's it. Agentic Software Engineering ist der nächste Schritt: ein Teamsport mit Koordination, Stakeholdern, mehreren Agenten und Qualitätssicherung im großen Stil - meine tägliche Arbeit im Kundenprojekt, nur erweitert durch eine Anzahl n an KI-Agenten, die mit entwickeln. Dieser Sprung -- von Coding zu Engineering -- ist der rote Faden dieses Artikels.

Dieser beschriebene Skalierungseffekt aus dem Paper ist bereits da: Hunderttausende Agent-generierte Pull Requests landen auf GitHub.

## Die Produktivitäts-Vertrauens-Lücke

Wie steht es um die Qualität von diesen Agent-generierte Pull Requests? Dazu liefern das Paper, der [GitClear Report 2025](#quellenübersicht) und [dieser YouTube-Bericht](https://www.youtube.com/watch?v=b9EbCb5A408) eindrucksvolle und auch beängstigende Zahlen:

> **📊 Zahlen zur KI-Code-Qualität**
>
> **SASE-Paper (2025):**
>
> - Agenten werden auf Benchmarks wie SWE-bench getestet: Ein Bug-Ticket rein, ein Patch raus. Wenn der Patch die vorgegebenen Unit-Tests besteht, gilt er als "plausibler Fix". Klingt gut -- aber **29,6% dieser vermeintlich korrekten Fixes verursachen Regressionen** an anderer Stelle, die vom Testset nicht abgedeckt wird.
> - Die Benchmark-Ergebnisse sehen zunächst vielversprechend aus: 12,47% der Issues werden "gelöst". Wenn dann aber Menschen die Patches manuell prüfen -- nicht nur "Tests grün?", sondern "Ist die Lösung sauber, vollständig und ohne Seiteneffekte?" -- **sinkt die Quote auf 3,97%**.
> - Über **68% der Agent-generierten PRs** bleiben lange unreviewed -- niemand schaut drauf.
>
> **GitClear Report (2025)** -- 211 Mio. Zeilen Code analysiert:
>
> - **41% höhere Churn-Rate** bei KI-generiertem Code. Churn-Rate misst, wie viel neu geschriebener Code innerhalb von zwei Wochen wieder geändert oder gelöscht wird -- ein Indikator dafür, dass der Code beim ersten Mal nicht gut genug war.
> - **Kopierte Code-Blöcke** (5+ identische Zeilen an mehreren Stellen) sind 8x häufiger geworden. Code-Duplikation insgesamt hat sich vervierfacht.
> - Der **Anteil von Refactoring-Commits** -- also Änderungen, die bestehenden Code umstrukturieren und verbessern, statt neuen hinzuzufügen -- ist von 25% (2021) auf unter 10% (2024) gefallen. Es wird weniger aufgeräumt, egal ob durch Mensch oder Agent.
>
> **Software-Wartungskosten** ([idealink.tech](#quellenübersicht)):
>
> - Wartung macht **50-80% der Gesamtkosten** eines Software-Projekts aus
> - Testing erhöht Upfront-Kosten um 15-35%, reduziert aber Wartungskosten um 30-50%

Das ist das Ralph-Risiko aus [Teil 2](./software-engineering-im-ki-zeitalter-praxis) -- nur auf einer Organisationsebene. Dort war es ein bewusstes Experiment mit kalkuliertem Risiko: "Garbage In, Garbage Out -- but the garbage comes out a lot faster." In der Industrie passiert genau das im großen Stil. Und wenn man bedenkt, dass Wartung bereits heute 50-80% der Gesamtkosten eines Software-Projekts ausmacht, wird klar: Die eingesparte Entwicklungszeit fließt direkt in steigende Wartungskosten. Das ist kein guter Trade.

Meine Erkenntnis aus Teil 2 bestätigt sich hier im großen Maßstab: **Review und Kontrolle ist der Flaschenhals, nicht Generierung.** Die Annahme, dass der Codeoutput der Flaschenhals der Softwareentwicklung war und ist, zeigt sich damit als falsch. Softwareentwicklung ist mehr als Codeschreiben -- Planung, Organisation, Architektur und natürlich auch der Review-Prozess sind ebenso Teil der Softwareentwicklung wie das Coding. Wenn man jedoch nur eine dieser Säulen mit vermeintlich endloser Effizienz ausstattet, dann brechen die anderen Säulen ein. Es bleibt abzuwarten, wann hier der große Knall kommt -- und er wird kommen, wenn das ein oder andere Softwareprojekt an die Grenzen der Wartbarkeit stößt. Es ist also Zeit sich um die Zukunft Gedanken zu machen.

## Neue Artefakte statt Ad-hoc-Prompts

Das SASE-Paper nimmt diese Zahlen nicht als Argument gegen KI-Agenten -- sondern als Beweis, dass Ad-hoc-Prompting ohne strukturierte Kontrolle nicht skaliert. Die Antwort: sechs formalisierte Artefakte (s.u.), die Review und Qualitätssicherung direkt in den Workflow einbauen -- denn ohne sinkende Fehlerquoten wird agentengetriebene Entwicklung nicht praktikabel.

1. **BriefingScript** -- Eine maschinenlesbare Spezifikation, die vage Tickets ersetzt. Mein MAD-Kickoff-Template aus [Teil 2](./software-engineering-im-ki-zeitalter-praxis) ist eine informelle Vorstufe davon.
2. **LoopScript** -- Definiert den Workflow eines Agenten: welche Schritte in welcher Reihenfolge, mit welchen Checkpoints und Abbruchbedingungen.
3. **MentorScript** -- Team-Normen als Code: Coding-Standards, Architektur-Entscheidungen, Konventionen. Meine CLAUDE.md ist ein primitives MentorScript.
4. **Consultation Request Pack (CRP)** -- Wenn ein Agent nicht weiterkommt, fragt er strukturiert beim Menschen nach -- mit Kontext, Optionen und Empfehlung. Mein Plan-Review-Template funktioniert bereits ähnlich.
5. **Merge-Readiness Pack (MRP)** -- Ein strukturierter Qualitätsnachweis: Testabdeckung, Architektur-Konformität, Security-Check -- alles gebündelt, bevor Code gemergt wird.
6. **Version Controlled Resolution (VCR)** -- Ein versionierter Audit-Trail für Entscheidungen: Wer hat wann warum was entschieden? Nachvollziehbarkeit statt "das war schon immer so".

Wenn ich mir diese sechs Artefakte anschaue, dann fällt mir auf, dass das eigentlich mein persönlicher Workflow - in Teil 2 dieser Blogartikel-Reihe - industriell spezifiziert ist: Mein MAD-Kickoff ist ein handgeschriebenes BriefingScript, die CLAUDE.md ein primitives MentorScript, das Plan-Review-Template ein einfaches CRP. Im SASE-Paper heißen die Dokumente anders und sind keine Ad-hoc-Markdown-Dateien, sondern versionierte, maschinenlesbare Dokumente mit definierten Schnittstellen.

Für Solo-Entwickler wie mich ist dieser Grad an Formalisierung too much -- für große Kundenprojekte, an denen n Agenten-Flotten gemeinsam an einer Codebase arbeiten, schon. Wenn jeder Entwickler seine eigenen Prompt-Templates mitbringt und jeder Agent andere Konventionen lernt, entsteht exakt das Chaos, das die Zahlen aus dem vorherigen Kapitel zeigen -- 41% Churn-Rate und die vervierfachte Code-Duplikation.

Wenn wir davon ausgehen, dass die Entwicklung weiter in die Richtung des Spec-Driven Development geht, dann wird auch diese Formalisierung kommen -- einfach deswegen, weil sie notwendig wird, je mehr Leute an einer Codebase arbeiten. Die Frage ist nur, ob sie organisch aus Best Practices wie meinen wächst oder ob sie top-down durch Tooling erzwungen wird.

Das wirft eine grundsätzliche Frage auf: Wenn die Qualität der Spezifikation wichtiger wird als die Qualität des Codes -- verschieben wir dann nur den Flaschenhals? Statt "wer schreibt den besten Code" wird es "wer schreibt das beste Briefing". Und genau diese Verschiebung beschreibt das SASE-Paper in seinem Reifegradmodell.

## Das Reifegradmodell: SE 1.0 bis 5.0

Das SASE-Paper definiert ein Reifegradmodell für Software Engineering mit KI -- ähnlich den Autonomiestufen beim autonomen Fahren. Die Analogie ist treffend, weil sie sofort verständlich macht, wo wir stehen und wo die Reise hingeht:

| Stufe  | Bezeichnung                      | Beispiel              | Analogie (Fahren)       |
| ------ | -------------------------------- | --------------------- | ----------------------- |
| SE 1.0 | Manuelle Codierung               | Notepad, vi           | Kein Fahrassistent      |
| SE 1.5 | Token-Assistenz                  | IDE Autocomplete      | Tempomat                |
| SE 2.0 | Task-Agentic                     | Copilot               | Teilautomatisierung     |
| SE 3.0 | Goal-Agentic                     | Claude Code, Devin    | Bedingte Automation     |
| SE 4.0 | Spezialisierte Domänen-Autonomie | (noch nicht existent) | Geo-Fenced Self-Driving |
| SE 5.0 | Allgemeine Domänen-Autonomie     | (Forschung)           | Volles autonomes Fahren |

Ich erinnere mich noch gut an den Sprung von SE 1.0 zu SE 1.5: Das Tool Tabnine machte die Runde und war für mich in IntelliJ ein Mindblown-Moment -- ganze Codeblöcke wurden oft fast akkurat vervollständigt. Den Sprung von SE 1.5 zu 2.0 habe ich dann gar nicht so richtig mitbekommen, da ich zu der Zeit in einem Kundenprojekt involviert war, in dem ohnehin keine Assistenten eingesetzt werden durften -- außerdem war das mediale Echo bei Copilot nicht mal ansatzweise so groß wie bei Coding Agents wie Claude Code heutzutage. Ich würde sagen, der Sprung von SE 1.5 zu SE 2.0 war eher graduell -- Autocomplete wurde etwas intelligenter, that's it. Der Sprung von SE 2.0 zu SE 3.0 ist dann qualitativ anders gewesen: Der Agent führt nicht mehr einzelne Befehle aus, sondern verfolgt Ziele in einem definierten Kontext. Mein MAD-Workflow aus [Teil 1](./warum-gute-entwickler-mit-ai-besser-werden) ist ein bewusster Schritt in diese Richtung -- ich formuliere ein Ziel, der Agent zerlegt und plant. Ralph aus [Teil 2](./software-engineering-im-ki-zeitalter-praxis) war ein Experiment, das noch weiter in Richtung SE 3.0 ging -- mit den bekannten Risiken.

Und wo stehen wir heute? Irgendwo am Anfang von SE 3.0 würde ich sagen -- aber mit einem Bein noch in SE 2.0 für kritische Codestellen. Zumindest würde ich diesen Stand anhand meiner eigenen Nutzungsmuster mit KI-Agenten so herleiten: Anpassungen an kritischen Codebases übernehme ich nach wie vor selbst. Ich vermute, dass die meisten professionellen Teams heute genau in diesem Spannungsfeld zwischen SE 2.0 und 3.0 stehen -- vorausgesetzt, das entsprechende Projekt spielt bei dem Ansatz hybrider Teams aus Devs und Agenten mit.

Gerade der nächste Sprung -- SE 3.0 zu SE 4.0 -- wird jedoch eine fundamentale Änderung mit sich bringen und darüber entscheiden, wie autonom Agenten wirklich arbeiten (sollen). Das gesamte Arbeiten mit solchen zum Großteil autonomen Workflows wird auch ganz neue Werkzeuge erfordern. Die Artefakte aus dem vorherigen Kapitel sind ein Anfang -- spricht man aber von ganzer Domänen-Autonomie, braucht es Agenten, die nicht nur Code schreiben, sondern Domänenwissen aufbauen und anwenden. Davon sind wir noch ein gutes Stück entfernt. Was ich persönlich begrüße, da mein Job ansonsten in akuter Gefahr wäre.

## Multi-Agent-Teams: Was existiert von der SASE-Paper Theorie bereits heute?

Wie könnten solche neuen Werkzeuge aussehen? Das SASE-Paper liefert auch hier eine Vision und beschreibt den Entwickler der Zukunft als sog. Agent-Orchestrator. Das ist eigentlich ein alter Hut, den ich aus meinen Anfängen unter Linux (Debian ftw) oft genutzt habe -- Terminal-Multiplexer wie tmux bieten seit einiger Zeit bereits eine Möglichkeit, mehrere Terminals auf einem Screen unterzubringen und Prozesse im Hintergrund laufen zu lassen. Theoretisch könnte man so schon jetzt n Agenten parallel und autark voneinander orchestrieren. Jedoch würden sich die Organisation, das Setup und die Bedienung als Herausforderung gestalten. Genau für diese Orchestrierung von ganzen Agenten-Flotten, wie sie im SASE-Paper beschrieben werden, gibt es bereits erste Frameworks wie die sog. [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD). Aber zunächst wieder zum SASE-Paper.

Das Paper beschreibt dafür zwei neue Umgebungen. Das **Agent Command Environment (ACE)** ist die Kommandozentrale für den Menschen, also den genannten Agent-Orchestrator: eine Inbox für Consultation Requests und Merge-Readiness Packs, Observability über laufende Agenten, Eskalations-Management. Das **Agent Execution Environment (AEE)** ist der Arbeitsbereich der Agenten: Hyper-Debugger, AST-basierte Editoren, semantische Code-Suche -- alles optimiert für maschinelle Verarbeitung statt menschliche Lesbarkeit. Quasi eine futuristische Weiterentwicklung der klassischen IDE wie IntelliJ, VSCode & Co. -- nur komplett ausgelegt für die Arbeit von und mit n KI-Agenten. Erste Ansätze in diese Richtung existieren bereits: Tools wie cmux orchestrieren mehrere Agenten in eigenen Terminalfenstern und bieten einheitliche Notifications, wenn ein Agent menschlichen Input benötigt -- ein primitives ACE mit heutigen Mitteln.

Auch Subagents in Claude Code -- Explore, Plan, general-purpose -- sind weitere primitive Ansätze für Agenten-Spezialisierung. Meine CLAUDE.md ist ein rudimentäres persistentes Gedächtnis. Und BMAD versucht mit seinen 12+ spezialisierten Personas genau das: ACE und AEE mit heutigen Mitteln zu simulieren.

Als ich mir BMAD jedoch genauer angeschaut habe, fiel mir kein realistisches Szenario ein, in dem ich ein solches Agenten-Team heute brauche. Die Koordinationskosten -- wer brieft wen, wer reviewt was, wie löst man Konflikte zwischen Agent-Outputs -- übersteigen aktuell den Nutzen.

Aber was, wenn man die Idee weiterdenkt: Das Paper beschreibt **N-Version Programming** -- pro Ticket werden mehrere Agenten parallel losgeschickt, jeder produziert einen eigenen PR, und der Agent-Orchestrator (Mensch) reviewt und wählt den besten aus. 7 Tickets, 4 Agenten pro Ticket, 28 PRs und am Ende wählt man den besten zum Feature passenden PR aus - technische Expertise vorausgesetzt. Das setzt allerdings auch voraus, dass der Review-Prozess skaliert, und genau da haben wir heute noch ein großes Problem, wie die o.g. Zahlen des SASE-Papers zeigen. Kontraintuitiv ist auch die Erkenntnis des Papers, dass starke Typsysteme (Rust, TypeScript) in einer agentengetriebenen Welt an Bedeutung gewinnen, da der Compiler hier zum "Enabler" wird, weil er dem Agenten sofort Feedback gibt, ob der Code korrekt ist.

Was mich persönlich bei dieser Gedankenreise am meisten beschäftigt: Das Paper beschreibt Agenten mit **persistentem Gedächtnis**, die in Idle-Zeiten weiterarbeiten und proaktiv Wartungsaufgaben nachkommen: Tech-Debt abbauen, Tests ergänzen, Dokumentation aktualisieren. Wenn das wirklich Realität wird, verschiebt sich die Frage fundamental: Sind das dann noch Werkzeuge -- oder Teammitglieder? Was macht das mit dem sozialen Gefüge in Kundenprojekten? Gibt es das dann überhaupt noch?

## Fazit: Die Disziplin erfindet sich neu

Für mich persönlich gab es kein anderes Thema, das jemals so polarisiert hat. Meine Meinung ist: Softwareentwicklung steht vor einem fundamentalen Umbruch. Der Sprung von manuellem Coding, wie wir es kannten, zu agentengetriebener Entwicklung ist ähnlich krass wie der vom Fahrrad zum Auto. Es wird schneller, die Reichweite größer, die Möglichkeiten explodieren. Aber mit dem Auto kamen auch Unfälle, Verkehrsregeln, Führerscheinpflicht und Umweltschäden -- also alles Probleme, die vorher schlicht nicht existierten. So wird und ist es jetzt bei dem Einschlag von KI in unserer Branche auch bereits.

Die Risiken sind real und bereits sichtbar:

**AI Slop überall.** Die Zahlen aus dem GitClear-Report: 41% höhere Churn-Rate, vervierfachte Code-Duplikation, schrumpfender Anteil an Refactoring-Commits. Es wird mehr Code produziert, aber weniger aufgeräumt. Tech Debt goes brrrr.

**Open-Source-Sterben.** Vielleicht das unterschätzteste Risiko: KI-generierte Beiträge fluten Open-Source-Projekte und die ehrenamtlichen Maintainer geben auf. Anfang 2026 haben innerhalb von drei Wochen drei prominente Projekte drastische Maßnahmen ergriffen: cURL stellte sein Bug-Bounty-Programm nach sechs Jahren ein, weil KI-generierte Fake-Reports die echten Meldungen erstickten. Ghostty führte eine Zero-Tolerance-Policy gegen KI-Beiträge ein. tldraw schloss externe Pull Requests komplett. GitHub selbst verglich die Situation mit einem ["Denial-of-Service-Angriff auf menschliche Aufmerksamkeit"](https://github.blog/open-source/maintainers/what-to-expect-for-open-source-in-2026/): 60 Sekunden für den KI-generierten PR, eine Stunde für das Review. Wenn das Open-Source-Ökosystem -- auf dem geschätzt $8,8 Billionen an Software aufbauen -- unter dieser Last zusammenbricht, betrifft das uns alle.

**Wer soll das alles reviewen?** Über 68% der Agent-generierten PRs bleiben laut SASE-Paper lange unreviewed. Gleichzeitig erzeugt KI-generierter Code laut einer [CodeRabbit-Analyse](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report) 1,7-mal mehr Issues als menschlich geschriebener. Die Kombination aus mehr Output und weniger Kontrolle ist gefährlich.

**Was passiert mit unseren Junioren?** Wenn Junior-Aufgaben zunehmend von Agenten übernommen werden -- wo sammeln Berufseinsteiger dann praktische Erfahrung? Das Wort "Kontrolle" zieht sich durch diese Trilogie -- aber wie wollen wir die KI kontrollieren, wenn unsere jüngere Generation nicht mehr die Chance bekommt, sich diese technische Expertise für das Kontrollieren anzueignen? Wer nie selber richtig gecodet oder eine saubere Architektur gebaut hat, kann keinen Agent-Output bewerten. KI-Kompetenzen -- Instruktions-Design, Agent-Management, Qualitätssicherung im großen Stil -- kommen on top. Die absoluten Basics in unserem Bereich werden noch viel wichtiger, nicht weniger wichtig.

In drei Teilen haben wir den Bogen gespannt -- von der Theorie über die persönliche Praxis bis zur wissenschaftlichen Einordnung für die Zukunft. Die Kernaussage meiner Recherchen und die dieser Trilogie über die Zusammenarbeit mit KI-Agenten ist: **Kontrolle vor Effizienz.** Das gilt heute für die Arbeit mit einem einzelnen Agenten genauso wie morgen für die Orchestrierung ganzer Agent-Flotten. Vieles, was ich in Teil 2 informell beschrieben habe -- Templates, CLAUDE.md, Review-Checklisten -- taucht im SASE-Paper in formalisierter Form wieder auf. Die Werkzeuge werden sich ändern, die Prinzipien dahinter nicht. Mark my words.

Die Zukunft gehört meines Erachtens den Entwicklern, die beides können: Software verstehen und Agenten führen. Ob wir das in fünf Jahren als SE 4.0 bezeichnen oder anders, ist völlig egal -- die Disziplin des Software-Engineering erfindet sich gerade neu. Eins ist jedenfalls sicher: Die Zukunft wird abenteuerlich.

Damit verabschiede ich mich mit dieser Trilogie und freue mich wie immer über Feedback, Widerspruch und Diskussion.
Jan

## Quellenübersicht

| #   | Ressource                                            | Typ    | Link                                                                                               |
| --- | ---------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| 1   | SASE Paper (Structured Agentic Software Engineering) | Paper  | [arxiv.org/html/2509.06216v2](https://arxiv.org/html/2509.06216v2)                                 |
| 2   | MAKER Paper                                          | Paper  | [arxiv.org/abs/2511.09030](https://arxiv.org/abs/2511.09030)                                       |
| 3   | GitClear AI Code Quality Research 2025               | Report | [gitclear.com](https://www.gitclear.com/ai_assistant_code_quality_2025_research)                   |
| 4   | The True Cost of Software Maintenance                | Blog   | [idealink.tech](https://idealink.tech/blog/software-development-maintenance-true-cost-equation)    |
| 5   | YouTube-Bericht: KI-Code-Qualität                    | Video  | [youtube.com](https://www.youtube.com/watch?v=b9EbCb5A408)                                         |
| 6   | BMAD-METHOD (Multi-Agent Framework)                  | GitHub | [github.com/bmad-code-org](https://github.com/bmad-code-org/BMAD-METHOD)                           |
| 7   | GitHub Blog: What to expect for open source in 2026  | Blog   | [github.blog](https://github.blog/open-source/maintainers/what-to-expect-for-open-source-in-2026/) |
| 8   | InfoQ: AI "Vibe Coding" Threatens Open Source        | Blog   | [infoq.com](https://www.infoq.com/news/2026/02/ai-floods-close-projects/)                          |
| 9   | CodeRabbit: State of AI vs Human Code Generation     | Report | [coderabbit.ai](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report)        |
| 10  | Jeff Geerling: AI is destroying Open Source          | Blog   | [jeffgeerling.com](https://www.jeffgeerling.com/blog/2026/ai-is-destroying-open-source/)           |

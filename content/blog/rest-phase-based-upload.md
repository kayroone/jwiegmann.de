---
title: "Von NDJSON zu Rest-Phase-Based-Upload: Robuste Systeme für große Datenmengen"
date: "2024-09-12"
excerpt: "Wie ich durch iterative Ansätze ein phasenbasiertes Upload-System entwickelt habe, das große Datentransfers robust und fehlertolerant macht"
tags: [ "spring-boot", "rest-api", "upload", "architecture", "poc", "ndjson" ]
---

# Von NDJSON zu Rest-Phase-Based-Upload: Eine REST-Schnittstelle für große Datenmengen

## Einleitung

Der Kundenauftrag sah vor, dass eine unbekannte Anzahl an Clients an einen unserer Services andocken sollte. Diese Clients sind deutschlandweit verteilt und liefern Zahlungsdatensätze. Man merkt schon, sehr vage formulierte Anforderungen - ganz typisch. Ich habe hier mal alles aufgelistet, was ich zu Beginn wusste:

- 40-50 Millionen Datensätze pro Jahr
- Bis zu 50.000 Datensätze pro fachlicher Einheit
- Zwingend REST-Schnittstelle (keine Alternativen zugelassen)
- Datensätze können voneinander abhängig sein bzw. bauen aufeinander auf
- Alle Datensätze eines Aufrufs haben einen zusammengehörigen fachlichen Identifier
- Es soll die Möglichkeit geben einzelne Payloads erneut hochzuladen bei Fehlern

Natürlich gingen mir sofort die gängigen Fragen durch den Kopf:

- Wie überträgt man zuverlässig so große Datenmengen? Ist Streaming eine Option?
- Was passiert bei Netzwerkfehlern?
- Wie stellt man Datenkonsistenz sicher? Stichwort Idempotenz.
- Gebe ich den Clients eine Option Fehler eigenständig zu korrigieren?

Mit diesen Fragen begab ich mich ins Brainstorming.

## Erste Lösungsansätze

Mein erster Gedanke war, dass ich bei diesen Datenmengen auf Streaming setzen könnte, da auch die weiterverarbeitenden Systeme am Backend-Service bereits auf Streaming via Kafka ausgelegt sind. Die naheliegende Lösung wäre also gewesen, das externe System direkt an Kafka anzubinden. Jedoch gab es die Compliance-Regel, dass für externe Schnittstellen ausschließlich REST bzw. HTTP verwendet werden darf. Nach einer längeren Recherchearbeit bin ich letztlich auf NDJSON gestoßen. NDJSON (Newline Delimited JSON) ist ein Format, bei dem jede Zeile ein eigenständiges JSON-Objekt enthält - also bestens geeignet für Streaming-Szenarien via HTTP, da die Daten Zeile für Zeile über eine offene HTTP-Verbindung übertragen werden können. NDJSON schien auf den ersten Blick gut zu den Anforderungen zu passen. Da ich die Technologie noch nicht kannte, kam die Idee auf, das Ganze in einem PoC zu vertesten. Den PoC findet ihr in meinem folgenden Repository:

Repository: https://github.com/kayroone/rest-ndjson-poc

Der PoC funktionierte technisch einwandfrei. Allerdings stellte sich mit laufender Entwicklung immer mehr heraus, dass die Technologie nicht optimal zu den Anforderungen und dem konkreten Use-Case passt. Das größte Problem: Bei NDJSON-Streaming bleibt die HTTP-Verbindung während der gesamten Übertragung offen. Bricht die Verbindung ab - und bei verteilten Clients in ganz Deutschland ist das durchaus realistisch - ist der komplette Upload verloren. Ein einfaches "Resume" gibt es nicht. Der Client müsste selbst tracken, welche der 50.000 Datensätze bereits übertragen wurden, um im Fehlerfall dort wieder anzuknüpfen. Das widerspricht der Anforderung, dass einzelne Payloads bei Fehlern erneut hochgeladen werden können sollen.

Hinzu kam ein weiteres Problem: Da der Backend-Service horizontal skaliert ist, würde jeder Upload an einen spezifischen Pod gebunden sein. Während der Upload läuft, ist kein Load-Balancing möglich. Startet der Pod neu oder fällt aus, ist der Upload ebenfalls verloren. Also alles zurück auf Null und nochmal ins Brainstorming.

## Das Konzept: Rest-Phase-Based-Upload mit Inbox-Pattern

Was hat mir der PoC mit dem NDJSON-Ansatz gezeigt? Zunächst einmal, dass ich auf einzelne autarke Requests setzen sollte, damit zum einen das Load-Balancing funktioniert und ich mehrere Pods ansteuern kann. Zum anderen aber auch, dass die einzelnen Requests nicht zu groß sein dürfen, da ich sonst vor derselben Problematik stehe wie beim NDJSON-Ansatz. Es müssen also autarke Requests sein, die eine maximale Größe nicht überschreiten - trotzdem kann es vorkommen, dass diese Requests voneinander abhängen, weil die Gesamtmenge an Daten die maximale Request-Größe sprengt und über mehrere Requests verteilt werden muss. Die Payloads mehrerer Requests können dann aufeinander aufbauen und somit fachlich zusammengehören. Die Idee war also, pro Upload einen backendseitigen isolierten Kontext zu schaffen - eine Art Session, die gezielt für einen Upload bestehend aus mehreren Requests verantwortlich ist.

Innerhalb dieser "Upload-Session" können dann Requests mit n Payloads als Batches hochgeladen werden. Soweit so gut - das ist der Happy Path. Was aber, wenn während eines Uploads die Verbindung unterbrochen wird? Oder die backendseitige Verarbeitung für einzelne Payloads fehlschlägt? Und wie gehen wir damit um, wenn derselbe Request mit denselben Payloads doppelt verschickt wird? Neben dem Happy Path muss ich solche Fehlerszenarien mitberücksichtigen - das bedeutet für mich, ich muss backendseitig neben einer Re-Upload-Funktionalität auch eine idempotente Verarbeitung gewährleisten. Idempotent bedeutet, dass der Datenbestand durch das mehrmalige Einlesen derselben Daten unverändert bleibt, sprich, dass wir keine Daten doppelt verarbeiten und auch keine bereits eingelesenen Daten verändern. Hier kommt das sogenannte Inbox-Pattern ins Spiel.

## Die Architektur

Wie sieht das Ganze nun in der Praxis aus? Am besten lässt sich das anhand des Upload-Flows zeigen, der drei zentrale Phasen durchläuft, die in dem folgenden Sequenzdiagramm dargestellt und anschließend erläutert werden.

![Upload-Flow Sequenzdiagramm](/blog-images/rest-phase-based-upload-sequence.svg)

**Phase 1: Initialisierung**

Der Upload-Prozess beginnt mit einem `POST /uploads/init`-Request. Hier übergibt der Client einen fachlichen Identifier, der alle Datensätze dieses Uploads zusammenfasst. Der Service erstellt daraufhin einen Upload-Kontext in der Datenbank und gibt eine eindeutige `uploadId` zurück. Diese `uploadId` ist das Herzstück des gesamten Flows - sie referenziert den isolierten Kontext, in dem alle nachfolgenden Batch-Uploads stattfinden. Wichtig: In dieser Phase werden noch keine Daten übertragen, es wird lediglich die "Session" für den Upload vorbereitet.

**Phase 2: Batch-Upload**

In der zweiten Phase erfolgt die eigentliche Datenübertragung via `POST /uploads/{uploadId}/batch`. Der Client kann nun beliebig viele Batch-Requests absetzen, wobei jeder Request ein Array von Payloads sowie eine fortlaufende Sequenznummer (`seqNo`) enthält. Die Sequenznummer ist entscheidend für die Idempotenz: Kommt derselbe Batch mit derselben `seqNo` mehrfach an, wird er nur einmal verarbeitet. Die Payloads werden zunächst in der Inbox-Tabelle persistiert - also nicht direkt in die Zieltabellen. Das ermöglicht es, fehlerhafte Batches zu identifizieren und gezielt neu hochzuladen, ohne den gesamten Upload zu wiederholen. Der Service validiert die Daten und gibt für jeden Batch ein detailliertes Feedback zurück: Welche Payloads wurden erfolgreich gespeichert, welche sind fehlgeschlagen? Mit diesen Informationen kann der Client dann z.B. fehlerhafte Payloads korrigieren und gezielt neu hochladen.

**Phase 3: Abschluss**

Die letzte Phase wird durch `POST /uploads/{uploadId}/complete` eingeleitet. Hier prüft der Service, ob alle Batches vollständig und fehlerfrei übertragen wurden. Ist das der Fall, startet die Weiterverarbeitung: Die validierten Daten aus der Inbox werden in die finalen Zieltabellen überführt und können dann beispielsweise via Kafka an nachgelagerte Services weitergereicht werden. Der Upload-Kontext wird als abgeschlossen (SEALED) markiert. Sind noch fehlerhafte Batches vorhanden, schlägt der Complete-Request fehl und der Client erhält konkrete Informationen darüber, welche Batches (identifiziert durch ihre `seqNo`) erneut hochgeladen werden müssen. Im SEALED Status ist der Re-Upload von fehlerhaften Payloads erlaubt. Nachdem alle Payloads erfolgreich hochgeladen wurden, startet die asynchrone Verarbeitung. Ist diese ebenfalls erfolgreich, wird die Upload-Session mit dem Status DONE markiert und ist damit abgeschlossen.

## Technische Umsetzung

[Hier gehst du auf die Spring Boot Implementation ein]

Repository: https://github.com/kayroone/rest-phase-based-upload-poc

## Robustheit durch Idempotenz

[Hier erklärst du die Fehlerbehandlung und fachliche Idempotenz durch Hashabgleich]

## Learnings & Fazit

- Reine Payload Obergrenze pro Request reicht nicht aus - es muss eine Obergrenze in MB pro Request sein.

[Hier fasst du zusammen, was du gelernt hast]
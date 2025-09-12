---
title: "Von NDJSON zu Rest-Phase-Based-Upload: Robuste Systeme für große Datenmengen"
date: "2024-09-12"
excerpt: "Wie ich durch iterative Ansätze ein phasenbasiertes Upload-System entwickelt habe, das große Datentransfers robust und fehlertolerant macht"
tags: [ "spring-boot", "rest-api", "upload", "architecture", "poc", "ndjson" ]
---

# Von NDJSON zu Rest-Phase-Based-Upload: Robuste Systeme für große Datenmengen

## Einleitung

Der Kundenauftrag sah vor, dass eine unbekannte Anzahl an Clients an einen unserer Services andocken sollte. Diese Clients sind deutschlandweit verteilt und liefern Zahlungsdatensätze. Man merkt schon, sehr vage formulierte Anforderungen - ganz typisch. Ich habe hier mal alles aufgelistet, was ich zu Beginn wusste:

- 40-50 Millionen Datensätze pro Jahr
- Bis zu 50.000 Datensätze pro fachlicher Einheit
- Zwingend REST-Schnittstelle (keine Alternativen zugelassen)
- Datensätze können voneinander abhängig sein bzw. bauen aufeinander auf
- Alle Datensätze eines Aufrufs haben einen zusammengehörigen fachlichen Identifier

Natürlich gingen mir sofort die gängigen Fragen durch den Kopf:

- Wie überträgt man zuverlässig so große Datenmengen? Ist Streaming eine Option?
- Was passiert bei Netzwerkfehlern?
- Wie stellt man Datenkonsistenz sicher? Stichwort Idempotenz.
- Gebe ich den Clients eine Option Fehler eigenständig zu korrigieren?

Mit diesen Fragen begab ich mich ins Brainstorming.

## Erste Lösungsansätze

[Hier beschreibst du deinen NDJSON-Ansatz und dessen Nachteile]

Repository: https://github.com/kayroone/rest-ndjson-poc

## Das Konzept: Rest-Phase-Based-Upload

[Hier erklärst du die Grundidee des phasenbasierten Uploads]

## Die Architektur

[Hier beschreibst du das Inbox Pattern und die Upload-Phasen]

## Technische Umsetzung

[Hier gehst du auf die Spring Boot Implementation ein]

Repository: https://github.com/kayroone/rest-phase-based-upload-poc

## Robustheit durch Idempotenz

[Hier erklärst du die Fehlerbehandlung und fachliche Idempotenz durch Hashabgleich]

## Learnings & Fazit

[Hier fasst du zusammen, was du gelernt hast]
---
title: "Von NDJSON zu Rest-Phase-Based-Upload: Robuste Systeme für große Datenmengen"
date: "2024-09-12"
excerpt: "Wie ich durch iterative Ansätze ein phasenbasiertes Upload-System entwickelt habe, das große Datentransfers robust und fehlertolerant macht"
tags: [ "spring-boot", "rest-api", "upload", "architecture", "poc", "ndjson" ]
---

# Von NDJSON zu Rest-Phase-Based-Upload: Robuste Systeme für große Datenmengen

## Einleitung

Der Kundenauftrag sah vor, dass eine unbekannte Anzahl an Clients an einen unserer Services andocken sollte. Diese
Clients sind deutschlandweit verteilt und liefern Zahlungsdatensätze. Man merkt schon, sehr vage formulierte Anforderungen
- ganz typisch. Ich habe hier mal alles aufgelistet, was ich zu Beginn wusste:

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

Mein erster Gedanke war, dass ich bei diesen Datenmengen auf Streaming setzen könnte, da auch die weiterverarbeitenden
Systeme am Backend-Service bereits auf Streaming via Kafka ausgelegt sind. Die naheliegende Lösung wäre also gewesen, das
externe System direkt an Kafka anzubinden. Jedoch gab es die Compliance-Regel, dass für externe Schnittstellen
ausschließlich REST bzw. HTTP verwendet werden darf. Nach einer längeren Recherchearbeit bin ich letztlich auf NDJSON
gestoßen. NDJSON schien gut zum Use-Case zu passen und da ich die Technologie noch nicht kannte, wollte ich sie direkt in
einem PoC ausprobieren. Den PoC findet ihr in meinem folgenden Repository:

Repository: https://github.com/kayroone/rest-ndjson-poc

Der PoC funktionierte technisch soweit einwandfrei. Allerdings stellte sich mit laufender Entwicklung immer mehr heraus, dass die 
Technologie nicht optimal zu den Anforderungen und dem konkreten Use-Case passt. Das größte Problem: Bei NDJSON-Streaming bleibt
die HTTP-Verbindung während der gesamten Übertragung offen. Bricht die Verbindung ab - und bei verteilten Clients in ganz Deutschland ist das durchaus
realistisch - ist der komplette Upload verloren. Ein einfaches "Resume" gibt es nicht. Der Client müsste selbst tracken,
welche der 50.000 Datensätze bereits übertragen wurden, um im Fehlerfall dort wieder anzuknüpfen. Das widerspricht der
Anforderung, dass einzelne Payloads bei Fehlern erneut hochgeladen werden können sollen.

Hinzu kam ein weiteres Problem: Da der Backend-Service horizontal skaliert ist, würde jeder Upload an einen spezifischen
Pod gebunden sein. Während der Upload läuft, ist kein Load-Balancing möglich. Startet der Pod neu oder fällt aus, ist der
Upload ebenfalls verloren. Das war für mich ein klarer Single Point of Failure, den ich nicht akzeptieren wollte. Also
zurück ans Zeichenbrett.

## Das Konzept: Rest-Phase-Based-Upload

[Hier erklärst du die Grundidee des phasenbasierten Uploads]
Wie sieht das aus? Wenn 
## Die Architektur

[Hier beschreibst du das Inbox Pattern und die Upload-Phasen]

## Technische Umsetzung

[Hier gehst du auf die Spring Boot Implementation ein]

Repository: https://github.com/kayroone/rest-phase-based-upload-poc

## Robustheit durch Idempotenz

[Hier erklärst du die Fehlerbehandlung und fachliche Idempotenz durch Hashabgleich]

## Learnings & Fazit

[Hier fasst du zusammen, was du gelernt hast]
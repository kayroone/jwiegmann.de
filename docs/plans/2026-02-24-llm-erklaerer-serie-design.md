# Design: LLM-Erklaerer Serie (Zweiteiler)

## Meta

- **Datum:** 2026-02-24
- **Format:** Eigenstaendige Artikelserie (2 Teile)
- **Zielgruppe:** Technisch interessierte Generalisten (Entwickler, technikaffine Menschen ohne AI-Hintergrund)
- **Tiefe:** Mittlere Tiefe - visuelle Intuition, Q/K/V und Softmax Schritt fuer Schritt, aber Mathe als Intuition statt Formeln
- **Stil:** Erklaer-Artikel mit persoenlicher Note (wie Trilogie)
- **Strukturansatz:** Bottom-Up entlang der Verarbeitungspipeline
- **Sprache:** Deutsch
- **Referenz:** Fang, X. "LLM & Transformer Interview Essentials A-Z" (Kindle Edition, p. 26) - sechs Leitfragen als inhaltlicher Kompass
- **Rolle Claude:** Struktur und Schreibanreize pro Kapitel liefern. Jan schreibt selbst.

## Leitfragen (aus dem Buch)

1. What is the input to the attention mechanism and how is it generated?
2. What are the names and purposes of the three conceptual subspace projections involved in attention and what are their functions?
3. Should the conceptual subspaces have more or fewer dimensions than the embedding space and why?
4. Why do we simply add the result of the attention computation back to the input itself?
5. How does the attention mechanism take into account the positions of the input tokens?
6. What is the function of an "attention head" and how is it leveraged in the various kinds of attention?

## Teil 1: "Von Text zu Zahlen - Wie ein LLM Sprache sieht"

Beantwortet Fragen 1 und 5.

### 1. Einleitung

- **These:** KI bestimmt die Zukunft - nicht nur in der Softwareentwicklung. Wer relevant bleiben will, muss die Technologie dahinter grundlegend verstehen. Nicht nur anwenden, sondern begreifen.
- **Bruecke:** Du arbeitest taeglich mit LLMs, aber was passiert eigentlich unter der Haube?
- **Abgrenzung:** Kein Paper-Deep-Dive, sondern Intuition fuer Praktiker
- **Verweis** auf Teil 2 (Attention) als Fortsetzung

### 2. Von Text zu Tokens - Tokenization

- Was ist ein Token? (nicht Wort, nicht Buchstabe - sondern Subword)
- BPE (Byte Pair Encoding) als gaengigstes Verfahren - Intuition, nicht Algorithmus
- Praxisbeispiel: Zeig wie ein Satz tokenisiert wird (OpenAI Tokenizer als Referenz)
- Konsequenz fuer Entwickler: Token-Limits, warum "Erdbeere" Probleme macht

### 3. Von Tokens zu Vektoren - Embeddings

- Das Token allein ist eine ID - bedeutungslos. Wie bekommt es Bedeutung?
- Was ist ein Vektor? (Analogie: GPS-Koordinate fuer Bedeutung)
- Embedding-Space: Aehnliche Bedeutung = nah beieinander
- Dimensionen: Warum 768, 1024, 4096? Was repraesentiert eine Dimension?
- Lookup-Table: Token-ID -> Vektor (trainierte Gewichte, nicht handgemacht)

### 4. Positional Encoding - Wo steht was?

- Das Problem: Embeddings kennen keine Reihenfolge ("Hund beisst Mann" = "Mann beisst Hund")
- Warum ist Position wichtig? (beantwortet Buchfrage 5)
- Sinusoidales Encoding vs. Learned Positional Embeddings - Intuition
- Wie wird Position mit Embedding kombiniert? (Addition, nicht Konkatenation - und warum)

### 5. Der Input-Vektor - Alles zusammen

- Was geht in den Transformer rein? Embedding + Position = der Vektor, den Attention bekommt
- Beantwortet Buchfrage 1 komplett
- Cliffhanger: "Jetzt hat das LLM Zahlen - aber es versteht noch nichts. Dafuer braucht es Attention."

## Teil 2: "Attention - Wie ein LLM versteht"

Beantwortet Fragen 2, 3, 4 und 6.

### 1. Einleitung

- Kurze Rekapitulation: Wo stehen wir? (Embedding + Position = Input-Vektor)
- "Attention Is All You Need" - das Paper das alles veraendert hat (2017, Vaswani et al.)
- Was Attention im Kern macht: Beziehungen zwischen Woertern herstellen

### 2. Query, Key, Value - Die drei Projektionen

- Beantwortet Buchfrage 2
- Analogie: Bibliothekssuche (Query = deine Frage, Key = Buchruecken/Index, Value = Buchinhalt)
- Jeder Input-Vektor wird dreimal projiziert - durch trainierte Gewichtsmatrizen
- Was "Projektion" bedeutet: Der gleiche Vektor aus drei verschiedenen Perspektiven betrachtet
- Warum drei? Trennung von "wonach suche ich", "was biete ich an", "was liefere ich"

### 3. Warum kleinere Subspaces?

- Beantwortet Buchfrage 3
- Q/K/V haben weniger Dimensionen als der Embedding-Space - warum?
- Intuition: Fokus statt Rauschen. Wie ein Filter, der nur relevante Aspekte durchlaesst
- Praktisch: Embedding 4096-dimensional, aber Q/K/V z.B. je 128-dimensional pro Head

### 4. Attention Score - Wer beachtet wen?

- Dot-Product von Query und Key: Wie aehnlich ist meine Frage zu deinem Angebot?
- Skalierungsfaktor (Division durch sqrt(d_k)) - warum? Softmax-Stabilitaet
- Softmax: Scores werden zu Wahrscheinlichkeiten (0-1, Summe = 1)
- Attention-Weights-Matrix: Eine Heatmap die zeigt, welches Token auf welches schaut
- Gewichtete Summe der Values: Das Ergebnis ist ein neuer Vektor, angereichert mit Kontext

### 5. Residual Connection - Warum addieren wir zurueck?

- Beantwortet Buchfrage 4
- Das Attention-Ergebnis wird zum Original-Input addiert (nicht ersetzt)
- Warum? Gradient-Flow (Training stabiler), Information Preservation (Originalinformation geht nicht verloren)
- Analogie: Notizen am Rand eines Buches - der Originaltext bleibt, du fuegest Kontext hinzu

### 6. Attention Heads - Mehrere Perspektiven gleichzeitig

- Beantwortet Buchfrage 6
- Was ist ein Head? Ein eigenstaendiger Attention-Durchlauf mit eigenen Q/K/V-Gewichten
- Multi-Head Attention: Mehrere Heads parallel, jeder lernt andere Beziehungen (Syntax, Semantik, Referenzen...)
- Multi-Query Attention (MQA) und Grouped-Query Attention (GQA): Optimierungen fuer Inference-Speed
- Wie die Head-Outputs zusammengefuehrt werden (Concatenation + lineare Projektion)

### 7. Das grosse Bild

- Zusammenfuehrung: Vom Token durch die gesamte Pipeline bis zum kontextangereicherten Vektor
- Mehrere Transformer-Layer hintereinander: Jeder verfeinert das Verstaendnis
- Ausblick: Wie aus dem letzten Vektor eine Next-Token-Prediction wird (Rueckbezug auf Trilogie Teil 1)

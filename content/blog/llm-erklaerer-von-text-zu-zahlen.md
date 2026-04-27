---
title: "LLM-Erklärer (Teil 1): Von Text zu Zahlen - Wie ein LLM Sprache sieht"
date: "2026-04-27"
excerpt: "Tokenization, Embeddings, Positional Encoding: Was passiert, bevor ein LLM überhaupt anfängt zu 'denken'?"
tags: ["AI", "LLM", "Transformer", "Embeddings", "Erklärer"]
---

_Dies ist Teil 1 einer zweiteiligen Serie._

- _Teil 2: Attention - Wie ein LLM versteht (coming soon)_

---

> **TL;DR:** Bevor ein LLM ein einziges Wort "verstehen" kann, muss es Text in Zahlen umwandeln. Dieser Artikel zeigt wie das funktioniert: Text wird in Tokens zerlegt (Tokenization), Tokens bekommen eine Bedeutung als Vektoren (Embeddings), und Positionsinformationen sorgen dafür, dass die Reihenfolge nicht verloren geht (Positional Encoding). Am Ende steht der Input-Vektor -- die Grundlage für alles, was danach kommt.

## Inhaltsverzeichnis

- [Einleitung](#einleitung)
- [Von Text zu Tokens - Tokenization](#von-text-zu-tokens---tokenization)
- [Von Tokens zu Vektoren - Embeddings](#von-tokens-zu-vektoren---embeddings)
- [Positional Encoding - Wo steht was?](#positional-encoding---wo-steht-was)
- [Der Input-Vektor - Alles zusammen](#der-input-vektor---alles-zusammen)
- [Quellenübersicht](#quellenübersicht)

## Einleitung

Hier ein Artikel, den ich schon lange schreiben wollte -- zum einen um mein eigenes Wissen und Verständnis zu festigen, zum anderen um ein Bewusstsein dafür zu schaffen, dass LLMs keine Experten wie Ärzte ersetzen können und diese Systeme mit Verantwortungsbewusstsein eingesetzt werden sollten.

In meiner letzten [Trilogie](./warum-gute-entwickler-mit-ai-besser-werden) haben wir viel über die Arbeitsweise mit LLMs gelernt -- was ist ein Context, wie managt man diesen, welches Tooling gibt es rund um das LLM und wie könnte eine industrielle Skalierung in der Zukunft aussehen. Für viele klingt die Idee der "künstlichen Intelligenz" aber immer noch nach schwarzer Magie -- ja, für mich teilweise auch, obwohl ich mich viel mit dem Thema auseinandersetze. Also dachte ich mir, dass ich mir das Buch [LLM & Transformer Interview Essentials A-Z](https://www.amazon.com/LLM-Transformer-Interview-Essentials-Z-ebook/dp/B0DNTJ4ZNG) von X. Fang mal genauer anschaue. Hier möchte ich einen Versuch starten, die dort doch sehr mathematischen und komplexen Konzepte möglichst einfach wiederzugeben, sodass man nach dem Lesen dieser zweiteiligen Serie besser versteht, wie ein LLM arbeitet.

LLMs erfinden Fakten, können manchmal nicht zählen und geben selbstbewusst falsche Antworten -- jeder, der mit LLMs wie Claude oder ChatGPT arbeitet, kennt diese Phänomene. Wenn man die Ursachen dafür kennt, kann man auch seine Arbeitsweise darauf ausrichten. Und noch wichtiger: Wer die Grenzen von LLMs kennt, fällt nicht auf jede Marketingfalle herein -- oder schlimmer noch, verlässt sich blind auf Aussagen des LLMs in kritischen Bereichen. Wenn ein LLM z.B. eine medizinische Diagnose vorschlägt, klingt das überzeugend -- von der Formulierung her. Wichtig ist hier aber zu verstehen, wie diese Antworten zustande kommen und dass es nichts damit zu tun hat, dass das LLM ein guter Arzt ist. Und genau deshalb ist es gefährlich, diese Systeme als "intelligent" zu betrachten, ohne zu verstehen, was tatsächlich dahinter steckt.

In dieser Serie folgen wir einem Satz auf seinem Weg durch das LLM -- von Text über Tokens und Vektoren bis zum fertigen Input. In Teil 2 schauen wir dann, was das LLM mit diesem Input macht: _Attention is all you need._

## Von Text zu Tokens - Tokenization

Salopp gesagt könnte man einem LLM Legasthenie unterstellen - es kann nicht lesen. Es kennt auch keine Buchstaben, keine Wörter und keine Grammatik. Was es allerdings gut kann: mit Zahlen rechnen. Der erste Schritt - der jedes Mal bei der Interaktion mit einem LLM wie ChatGPT oder Claude passiert - ist das geschriebene Wort in Zahlen - sog. Token - umzuwandeln. Diesen Vorgang nennt man Tokenization. Intuitiv denkt man jetzt, dass wahrscheinlich einfach jedes geschriebene Wort in ein Token umgewandelt wird - wäre das der Fall, hätten wir ein grundlegendes Problem: Die deutsche Sprache allein hat Hunderttausende von Wörtern. "Krankenversicherungsbeitragserhöhung" wäre ein Token. Jede Tippvariante, jede Konjugation, jedes Kompositum bräuchte einen eigenen Eintrag. Das Vokabular würde explodieren. Neben der "für jedes Wort ein Token" Variante gibt es noch den anderen Extremfall -- einzelne Buchstaben als Token. So hätte man ein winziges Vokabular, aber der Satz verliert jede Struktur. Das LLM müsste aus einzelnen Buchstaben selbst herausfinden, was ein Wort ist. Gleichzeitig würden die Sequenzen extrem lang -- ein einzelner Satz hätte schnell Hunderte von Tokens. Mehr Tokens bedeutet mehr Rechenaufwand, und zwar überproportional viel mehr -- warum genau, sehen wir in Teil 2.

### Subword-Tokenization: Der Mittelweg

Moderne LLMs nutzen deshalb **Subword-Tokenization**. Der bekannteste Algorithmus heißt **BPE (Byte Pair Encoding)**. Dabei werden häufige Zeichenkombinationen zu einem Token zusammengefasst. Seltene Wörter werden in kleinere, bekannte Teile zerlegt.

Nehmen wir einen Beispielsatz:

> _"Ich saß im Park auf der Bank und ging dann zur Bank, um Geld abzuheben."_

Ein Tokenizer könnte diesen Satz zum Beispiel so zerlegen:

| Token | Token-ID  |
| ----- | --------- |
| Ich   | 4070      |
| saß   | 89401     |
| im    | 1304      |
| Park  | 7100      |
| auf   | 3071      |
| der   | 1050      |
| Bank  | **14032** |
| und   | 2099      |
| ging  | 31205     |
| dann  | 5765      |
| zur   | 9803      |
| Bank  | **14032** |
| um    | 3494      |
| Geld  | 46218     |
| ab    | 671       |
| zu    | 1105      |
| heben | 84529     |

In diesem Satz gibt es zwei Besonderheiten:

**Erstens:** "abzuheben" wurde in drei Tokens zerlegt -- `ab`, `zu`, `heben`. Das ist die genannte Subword-Tokenization. Das Wort als Ganzes ist selten, aber seine Bestandteile - `ab`, `zu`, `heben` - kommen in der deutschen Sprache recht häufig vor - es ist also wesentlich cleverer vom Algorithmus sich die Teilwörter als Token zu merken, als das gesamte Wort.

**Zweitens:** Das Wort "Bank" taucht **zweimal** auf und bekommt **beide Male die gleiche Token-ID** (14032). Der Tokenizer sieht nur die Zeichenkette. Er weiß nicht, dass "Bank" im ersten Fall eine Sitzbank im Park ist und im zweiten Fall ein Geldinstitut.

### Gleiche Zeichenkette, verschiedene Bedeutung

Nach der Tokenization -- der Übersetzung der Teilworte in Token -- ist unser Satz eine Folge von Zahlen. Mehr nicht. Für das LLM sehen beide "Bank"-Tokens identisch aus, obwohl sie völlig unterschiedliche Dinge meinen. Der Kontext ("im Park", "Geld abheben") ist zwar im Satz vorhanden, aber noch nicht mit den einzelnen Tokens verknüpft.

Exakt dieses Problem der sog. **kontextabhängigen Bedeutung** hat das Forschungsteam von Google 2017 in ihrem Paper [Attention Is All You Need](https://arxiv.org/abs/1706.03762) adressiert. Der dort vorgestellte **Transformer** mit seinem **Attention-Mechanismus** erlaubt es dem Modell, jedes Token - also jedes Teilwort - im Kontext aller anderen Tokens zu betrachten. Dadurch berechnet das LLM, dass "Bank" neben "Park" und "saß" etwas anderes bedeutet als "Bank" neben "Geld" und "gehen". Wie genau das funktioniert, schauen wir uns in Teil 2 dieser Serie nochmal genauer an. Kleiner Spoiler: Es ist kompliziert.

## Von Tokens zu Vektoren - Embeddings

Die beschriebene Tokenization ergibt eine schlichte Folge von Zahlen -- Token-IDs wie 14032 für "Bank" oder 7100 für "Park". Diese Zahlen sind willkürlich -- dass "Bank" die ID 14032 hat und "Geld" die 46218, sagt nichts über ihre Bedeutung aus. 14032 liegt nicht näher an 46218 als an 7100 -- es sind einfach nur Nummern in einem Wörterbuch, die in keinerlei Beziehung zueinander stehen.

Das LLM braucht jedoch eine Darstellung, in der die Zahlen tatsächlich etwas über die Bedeutung eines Wortes aussagen. Hier kommen **Embeddings** ins Spiel. Jede Token-ID wird jetzt zunächst in eine ganze Liste von Zahlen umgewandelt -- einen sogenannten **Vektor**. Statt einer einzigen Nummer (14032) bekommt "Bank" jetzt z.B. 3 Zahlen, die gemeinsam eine Art Koordinate im "Bedeutungsraum" bilden (zur Veranschaulichung nutzen wir hier 3 Dimensionen -- in der Realität sind es Hunderte bis Tausende). Klingt mathematisch kompliziert und ja, ist es auch. Am einfachsten lässt sich das mit einem Bällebad (ja, rly - zumindest habe ich es mir immer so vorgestellt, deswegen führe ich das hier mal als Metapher an) vorstellen: Jeder Ball ist ein Wort und hat eine bestimmte Position im Raum -- z.B. 2 Meter von links, 1 Meter von hinten, 0.5 Meter hoch. Diese drei Zahlen zusammen sind sein Vektor. Sie beschreiben schlicht und einfach, wo der Ball liegt. Genau so funktionieren Embeddings nur, dass der "Raum" eben nicht 3, sondern wie gesagt Hunderte oder mehr Dimensionen hat.

Hier nochmal ein von mir erstelltes Bild zur Veranschaulichung:

![Embedding-Vektoren im 3D-Raum](/images/blog/embedding-vectors-3d.png)

Jedes Wort aus unserem Beispielsatz zeigt als Pfeil in eine bestimmte Richtung. Wörter mit ähnlicher Bedeutung zeigen tendenziell in ähnliche Richtungen. Jetzt stellt man sich die Frage: Wie wird festgelegt, welches Wort in welche Richtung zeigt?

Die Werte in der Embedding-Tabelle werden beim Training gelernt. Am Anfang sind sie zufällig. Über Milliarden von Trainingsbeispielen justiert das Modell die Zahlen so, dass Wörter mit ähnlicher Bedeutung ähnliche Vektoren bekommen. Für unseren Beispielsatz heißt das: "Bank", "Geld" und "abheben" liegen im Vektorraum näher beieinander als "Bank" und "Park", weil sie in den Trainingsdaten häufiger im gleichen Kontext vorkommen.

Dabei entstehen faszinierende Eigenschaften und damit zurück zu unserem Bällebad: Der Ball zum Wort "König" und der Ball zum Wort "Königin" liegen nah beieinander, genauso wie der Ball zum Wort "Mann" und "Frau". Der Schritt, den man im Raum vom Ball "König" zum Ball "Königin" macht, ist derselbe Schritt wie von "Mann" zu "Frau". Mathematisch ausgedrückt: `König - Mann + Frau ≈ Königin`. Das Modell hat also gelernt, dass diese Beziehung existiert - und jetzt kommt das coole - ohne dass ihm das je jemand beigebracht hätte, weil der Abstand zwischen den Wörtern Mann und Frau bei König und Königin nahezu derselbe ist.

## Positional Encoding - Wo steht was?

Jedes Embedding - also jeder Ball in unserem Bällebad - hat jetzt eine exakte Position und Bedeutung. Wir wissen jetzt also wie sich ein Wort zu anderen Wörtern im Satz abgrenzt und können so erahnen, was mit diesem Wort gemeint ist. Das gilt für jedes einzelne Wort im Satz - das LLM weiß aber noch nicht, dass auch die Reihenfolge wichtig ist. Für das LLM sind die Sätze "Ich saß auf der Bank" und "Die Bank saß auf mir" bisher identisch: dieselben Wörter, dieselben Embeddings, nur anders angeordnet. Ohne Positionsinformation weiß das LLM nicht, dass _ich_ auf der Bank saß und nicht die Bank auf _mir_.

Genau dafür gibt es das sog. **Positional Encoding**. Jedes Token bekommt einen Positions-Vektor mit derselben Anzahl an Dimensionen wie das Embedding. Dieser wird Dimension für Dimension zum Embedding addiert:

```
Embedding "Bank":     [0.33, -0.71, 0.05, ...]
+ Position 7:         [0.01,  0.12, -0.03, ...]
= Ergebnis:           [0.34, -0.59,  0.02, ...]
```

Es entsteht kein größerer Vektor -- die Anzahl der Dimensionen bleibt gleich. Aber die Werte verschieben sich leicht, abhängig davon, an welcher Position das Token steht. Der Embedding-Vektor kodiert _was_ das Wort bedeutet, der Positions-Vektor verschiebt es in die Richtung _wo_ es steht.

Für unseren Beispielsatz heißt das: "Bank" an Position 7 (Sitzbank im Park) und "Bank" an Position 12 (Geldinstitut) haben zwar dasselbe Embedding, bekommen aber unterschiedliche Positions-Vektoren addiert. Ab diesem Punkt zeigen die beiden "Bank"-Tokens in leicht verschiedene Richtungen und sind somit für das LLM nicht mehr identisch.

## Der Input-Vektor - Alles zusammen

Fassen wir zusammen, was mit unserem Beispielsatz passiert ist:

1. **Tokenization:** Der Text wird in Teilwörter zerlegt und jedes bekommt eine Token-ID. "Bank" wird zu 14032 -- egal ob Sitzbank oder Geldinstitut.
2. **Embeddings:** Jede Token-ID wird in einen Vektor umgewandelt, der eine ungefähre Bedeutung trägt. Verwandte Wörter zeigen in ähnliche Richtungen. Hier ist die Bank zum Sitzen und die Bank zum Geldabheben noch dasselbe.
3. **Positional Encoding:** Ein Positions-Vektor wird zum Embedding addiert. Jetzt weiß das LLM auch, _wo_ jedes Wort im Satz steht. Das LLM weiß jetzt, dass es einen Unterschied zwischen den beiden Banken gibt - aber noch nicht, worin dieser Unterschied begründet ist.

Das Ergebnis ist der sog. **Input-Vektor**: Für jedes Token ein Vektor, der sowohl Bedeutung als auch Position kodiert. Das ist alles, was das LLM zu diesem Zeitpunkt über unseren Satz weiß.

Die beiden "Bank"-Tokens zeigen zwar in leicht verschiedene Richtungen (durch unterschiedliche Positionen), aber ihr Embedding ist immer noch dasselbe. Das LLM weiß, _wo_ sie stehen, aber noch nicht _welche_ Bank gemeint ist. Dafür braucht es den Kontext der umgebenden Wörter. Genau das ist die Aufgabe des **Attention-Mechanismus**, den wir in Teil 2 dieser Serie im Detail betrachten.

## Quellenübersicht

| #   | Ressource                                                                             | Typ  | Link                                                                                        |
| --- | ------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------- |
| 1   | X. Fang: LLM & Transformer Interview Essentials A–Z: A Silicon Valley Insider's Guide | Buch | [Amazon](https://www.amazon.com/LLM-Transformer-Interview-Essentials-Z-ebook/dp/B0DNTJ4ZNG) |

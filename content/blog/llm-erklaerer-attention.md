---
title: "LLM-Erklärer (Teil 2): Attention - Wie ein LLM versteht"
date: "2026-05-08"
excerpt: "Query, Key, Value, Multi-Head und O(n²): Wie aus statischen Embeddings kontextabhängige Bedeutung wird."
tags: ["AI", "LLM", "Transformer", "Attention", "Erklärer"]
---

_Dies ist Teil 2 einer zweiteiligen Serie._

- _[Teil 1: Von Text zu Zahlen - Wie ein LLM Sprache sieht](./llm-erklaerer-von-text-zu-zahlen)_

---

> **TL;DR:** Attention ist der Mechanismus, der aus statischen Embeddings kontextabhängige Bedeutung macht. In vier Schritten projiziert das LLM jedes Token in einen niedrigdimensionalen "Konzeptraum", lässt die Tokens sich dort gegenseitig befragen, projiziert das Ergebnis zurück und addiert es auf das ursprüngliche Embedding. Am Ende weiß das LLM, _welche_ "Bank" gemeint ist -- und wir verstehen nebenbei, warum längere Eingaben überproportional viel teurer werden.

## Inhaltsverzeichnis

- [Einleitung](#einleitung)
- [Die Idee von Attention - Wörter im Gespräch](#die-idee-von-attention---wörter-im-gespräch)
- [Schritt 1 - Projektion in den Konzeptraum](#schritt-1---projektion-in-den-konzeptraum)
- [Schritt 2 - Gewichtete Mischung und Attention Scores](#schritt-2---gewichtete-mischung-und-attention-scores)
- [Schritt 3 - Zurück in den Embedding-Raum](#schritt-3---zurück-in-den-embedding-raum)
- [Schritt 4 - Residual und Kontext aufs Original](#schritt-4---residual-und-kontext-aufs-original)
- [Zusammenfassung](#zusammenfassung)
- [Quellenübersicht](#quellenübersicht)

## Kurzes Vorwort

Long time no see. Viel Zeit ist ins Land gegangen seit [Teil 1](./llm-erklaerer-von-text-zu-zahlen) - das lag zum einen daran, dass mein Eigenheim gerade eine massive Baustelle ist, da wir eine Kernsanierung durchführen. Zum anderen aber auch daran, dass das hier behandelte Thema so unendlich komplex ist. Immer wieder habe ich Absätze gelöscht, neu geschrieben, weil ich der Meinung war, dass man die mathematischen Gebilde noch nicht wirklich anhand meiner Metaphern versteht. Mit dem jetzigen Ergebnis bin ich allerdings zufrieden und wünsche euch damit viel Spaß beim Lesen!

## Einleitung

In [Teil 1](./llm-erklaerer-von-text-zu-zahlen) haben wir einen Satz auf seinem Weg durch das LLM begleitet: aus einem eingegebenen Text wurden Tokens, aus Tokens dann Embedding-Vektoren, und durch das Positional Encoding konnten wir am Ende nachvollziehen, wo jedes Wort in dem Satz steht. Das Ergebnis war der s.g. **Input-Vektor**. Dieser repräsentiert alles, was das LLM zu diesem Zeitpunkt über unseren Beispielsatz weiß:

> _"Ich saß im Park auf der Bank und ging dann zur Bank, um Geld abzuheben."_

Das war unser Cliffhanger im ersten Teil. Die beiden "Bank"-Tokens haben durch das Positional Encoding zwar leicht unterschiedliche Vektoren bekommen, aber ihre eigentliche Bedeutung steckte immer noch im selben Embedding. Das LLM weiß, _wo_ jede "Bank" im Satz steht, aber noch nicht, _welche_ gemeint ist - die konkrete Bedeutung des Wortes fehlt also noch. Wie kommt das LLM jetzt darauf, dass die erste eine Sitzbank im Park ist und die zweite ein Geldinstitut ist?

Die Antwort ist der **Attention-Mechanismus**, vorgestellt im Paper [Attention Is All You Need](https://arxiv.org/abs/1706.03762) von Google aus dem Jahr 2017. Um das Ganze anschaulich zu halten, bleiben wir bei unserem Bank-Beispielsatz aus Teil 1. Mit ein paar einfachen Metaphern werde ich versuchen den Attention-Mechanismus greifbar zu machen.

Die Struktur, an der wir uns entlanghangeln, stammt aus X. Fangs Buch [LLM & Transformer Interview Essentials A-Z](https://www.amazon.com/LLM-Transformer-Interview-Essentials-Z-ebook/dp/B0DNTJ4ZNG) und besteht aus vier Schritten:

1. Jedes Token wird in einen niedrigdimensionalen "Konzeptraum" projiziert.
2. In diesem Raum befragen sich die Tokens gegenseitig und werden gewichtet.
3. Das Ergebnis wird zurück in den ursprünglichen Embedding-Raum projiziert.
4. Diese Informationen werden wie eine Art "Metadaten" auf das ursprüngliche Embedding addiert.

Und ja, es ist im Detail viel Mathematik. Die ich hier aber bewusst außen vor lasse und versuche diese abstrakten Vorgänge anhand einfacher Metaphern und Bilder verständlich zu machen. On top beantworten wir so auch direkt eine Frage aus Teil 1: _warum mehr Tokens überproportional viel mehr Rechenaufwand bedeuten._

## Die Idee von Attention - Wörter im Gespräch

Die Idee hinter Attention - also der gegenseitigen Befragung der Wörter - ist im Kern simpel: Jedes Wort im Satz darf alle anderen Wörter befragen, um besser zu verstehen, was es selbst in genau diesem Satz bedeutet.

Stellen wir uns dafür vor, dass jedes Wort in einem Satz mit den anderen Wörtern sprechen kann. Jedes Wort erfüllt damit zwei Rollen:

- Zum einen kann es andere Wörter des Satzes befragen.
- Gleichzeitig kann es aber auch selber von anderen gefragt werden.

Jedes Wort in einem Satz ist also Fragensteller und Befragter gleichzeitig. Simpel.

Gehen wir jetzt zurück zu unserem Beispielsatz: Alle Wörter des Satzes können sich jetzt gleichzeitig gegenseitig befragen und Antworten geben. Zum Beispiel **"Bank"** und **"Park"**:

"Bank" fragt bei "Park": "Was macht dich aus?" "Park" plaudert drauflos und erzählt alles, was er als Wort an Bedeutung mitbringt: Grünfläche, draußen sein, Erholungsort, Spaziergänger, Sitzgelegenheit und vieles mehr. Im Verlauf des Gesprächs stellen die beiden fest, dass sie tatsächlich ein **gemeinsames Interesse** haben: Sitzgelegenheit im Freien, Aufenthalt in der Natur. Genau das ist der Moment, in dem es "klick" macht.

Das gemeinsame Interesse ist hier also gefunden. Unterhalten sich jedoch "Geld" und "Bank" miteinander, so wird es nicht bei Sitzgelegenheit im Freien "klick" machen, sondern eher bei "Geld auszahlen". Die Wörter unterhalten sich also untereinander und erkennen dabei ihre gemeinsamen Interessen - oder eben auch nicht. Auf Basis der Ergebnisse jeder einzelnen Befragung wissen die Wörter in ihrem Satz immer mehr, in welcher Beziehung sie zu den anderen Wörtern stehen. Schritt für Schritt kristallisiert sich so die Bedeutung jedes einzelnen Wortes in dem Satz heraus.

Damit ist die Grundidee von Attention gesetzt. Offen bleibt das _Wie_: Was bringt ein Wort konkret in so ein Gespräch mit? Wonach fragt es, woran erkennt es, worum es geht, und was hat es selbst zu erzählen? Die Antwort sind drei Vektoren, die jedes Wort sich gleichzeitig zulegt. Genau darum geht es in Schritt 1, dem niedrigdimensionalen "Konzeptraum".

## Schritt 1 - Projektion in den Konzeptraum

Aus Teil 1 wissen wir, dass jedes Wort als Input-Vektor ankommt. In diesem Input-Vektor sind ALLE Informationen enthalten, die das LLM anhand seiner Trainingsdaten jemals gelernt hat. Für ein einzelnes Gespräch braucht das Wort aber nicht alles davon gleichzeitig, sondern drei spezifische Sichten:

- **Wonach suche ich** in diesem Gespräch?
- **Woran erkennt man von außen, worum es bei mir geht?**
- **Was kann ich erzählen, wenn jemand interessiert ist?**

Diese drei Sichten heißen in der Fachsprache **Query (Q)**, **Key (K)** und **Value (V)**. Sie sind nichts anderes als drei Vektoren pro Wort, die jeweils einen anderen Ausschnitt seiner Bedeutung sichtbar machen.

### Drei Brillen für jedes Wort

Wie kommt ein Wort an seine drei Vektoren? Stellen wir uns vor, das LLM hat drei spezielle Brillen, die es jedem Wort der Reihe nach aufsetzt:

- Die **Query-Brille** filtert aus dem Embedding heraus, _wonach_ das Wort gerade sucht. Bei der ersten "Bank" könnte das etwa "Bin ich hier ein Ort, ein Gegenstand oder etwas ganz anderes?" Der Output ist hier auch wieder ein Vektor, kein geschriebenes Wort.
- Die **Key-Brille** filtert heraus, _woran_ andere Wörter erkennen können, worum es bei diesem Wort geht. Das ist sozusagen das Namensschild, das sich das Wort umhängt.
- Die **Value-Brille** filtert heraus, _was_ das Wort an Inhalt zu teilen hat, wenn ein Gespräch zustande kommt.

Diese drei Brillen sind nicht von Hand definiert, sondern werden beim Training des LLMs aus Milliarden von Beispielen gelernt. Wenn ein Wort durch eine Brille schaut, fällt sein hochdimensionales Embedding in einen **niedrigdimensionaleren Raum**, den sog. **Konzeptraum**. Er heißt so, weil die einzelnen Dimensionen in diesem Raum jeweils für gelernte "Konzepte" stehen. Das kann z.B. so etwas wie "ist ein Ort", "gehört zum Finanzkontext", "ist Subjekt eines Satzes" usw. sein. Welche Konzepte genau sich pro Dimension herausbilden, ergibt sich beim Training.

Nachdem jedes Wort unseres Satzes diese drei Brillen aufgesetzt hat, besitzt es jeweils drei neue Vektoren die Informationen über das Wort enthalten. Der V-Vektor hält den Inhalt bereit, der K-Vektor ist sowas wie das Namensschild und der Q-Vektor enthält die Fragen, die dieses Wort den K-Vektoren der anderen Wörter stellt. Erst wenn ein Q gut zu einem K passt, kommt der zugehörige V-Vektor ins Spiel.

## Schritt 2 - Gewichtete Mischung und Attention Scores

Jedes Wort besitzt jetzt diese drei beschriebenen Vektoren: eine Frage (Q), ein Namensschild (K) und einen Inhalt (V). Heißt, alle Wörter sind jetzt bereit sich miteinander auszutauschen. Jedes Wort nimmt jetzt seinen Q-Vektor und gleicht diesen mit dem K-Vektor der anderen Wörter ab - das tun alle Wörter gleichzeitig. So werden Übereinstimmungen herausgefiltert.

Für jedes Paar Q und K kommt dabei eine Zahl heraus, der s.g. **Attention Score**. Eine hohe Zahl heißt: Frage und das, was das gefragte Wort an Informationen auf seinem Namensschild anbietet, passen gut zusammen. Eine niedrige Zahl heißt: passt eher nicht so gut zusammen. Für unsere erste "Bank" könnte das z.B. so aussehen:

- Bank fragt Park: hoher Score (passt gut, Bänke stehen in Parks)
- Bank fragt saß: mittlerer Score (passt auch, auf einer Bank wird gesessen)
- Bank fragt Geld: niedriger Score (passt hier nicht, weil weiter weg (Position) im Satz und in anderem Kontext)

Damit diese Scores als Gewichte taugen, werden sie noch durch eine Funktion namens **Softmax** geschickt. Die macht aus den rohen Zahlen Prozente, die sich zu 100 % aufsummieren. Sprich, zu wie viel Prozent passt ein Wort zu einem anderen. Für unsere erste "Bank" könnte sich z.B. folgende Verteilung ergeben: Park 45 %, saß 20 %, im 12 %, ..., Geld 1 %. Aber noch sind wir nicht am Ende!

Jetzt kommen die V-Vektoren ins Spiel. Jedes andere Wort gibt seinen Inhalt (V) preis - aber nur anteilig, je nach Prozentzahl aus dem Softmax. Von "Park" fließen 45 % seines Inhalts ein, von "saß" 20 %, von "Geld" nur 1 %. Diese Anteile werden zu einem einzigen neuen Vektor zusammengefasst für das erste Wort "Bank". In diesem neuen Vektor steckt jetzt drin, wie die "Bank" zu den anderen Wörtern im Satz steht - es entsteht quasi eine "Bedeutung" im Wortsalat des Satzes.

Und das passiert für jedes Wort im Satz gleichzeitig. Jedes Wort holt sich seine eigenen Prozentangaben zu den anderen Wörtern im Satz - die erste "Bank" nimmt viele Informationen zu dem Wort "Park" auf, die zweite "Bank" nimmt viel von "Geld" auf. Damit sind die beiden "Bänke" zum ersten Mal nicht mehr identisch, weil beide Wörter unterschiedlich viele Informationen der anderen Wörter in ihrem Embedding tragen.

## Schritt 3 - Zurück in den Embedding-Raum

Bildlich gesprochen: Die Embeddings jedes Wortes - inklusive der Informationen, die sie in Schritt 2 von allen anderen Wörtern des Satzes bekommen haben - werden jetzt wieder zurück in den Raum geführt, in dem der Satz ursprünglich zur Bildung dieser Embeddings abgelegt wurde.

## Schritt 4 - Residual und Kontext aufs Original

Jetzt kommt der letzte Schritt, und er ist ausnahmsweise recht simpel: Das LLM addiert die Kontext-Ergänzung (die zusätzlichen Informationen je Wort) einfach auf das **ursprüngliche Embedding** unseres Wortes drauf.

Für unsere erste "Bank" heißt das jetzt final: Das Original-Embedding bleibt vollständig erhalten - mit allem, was das LLM je über "Bank" gelernt hat. Hinzu kommt jetzt die Kontext-Ergänzung: ein hoher Prozentsatz zum Wort "Park", etwas von dem Wort "saß", aber wiederum wenig Informationen von dem Wort "Geld". Damit weiß das LLM zum ersten Mal, dass hier eine Sitzbank gemeint ist und trotzdem hat es das Wissen über "Bank" als Konzept nicht verloren.

Diese Art, das Ergebnis einer Schicht auf das Original draufzuaddieren, nennt sich **Residual Connection**. Sie sorgt dafür, dass jede Attention-Schicht dem Wort nur eine Ergänzung mitgibt, statt seine Bedeutung komplett zu überschreiben.

## Zusammenfassung

Die erste "Bank" in unserem Beispielsatz trägt nach der Anwendung des Attention-Mechanismus prozentual unterschiedlich viele Informationen (ich stelle es mir wie eine Art Metadaten vor, die das Wort mit sich rumträgt) zu den Worten "Park" und "saß" in sich. Die zweite "Bank" allerdings mehr Informationen zu dem Wort "Geld" und "abzuheben". Aus zwei ursprünglich identischen Wörtern und ihren Embeddings sind so zwei unterschiedliche geworden. Die beigefügten "Metadaten" machen den Unterschied und kennzeichnen jede "Bank" in dem Beispielsatz in ihrer Bedeutung voneinander ab.

Dieses Ergebnis wurde - wie in dem Buch [LLM & Transformer Interview Essentials A-Z](https://www.amazon.com/LLM-Transformer-Interview-Essentials-Z-ebook/dp/B0DNTJ4ZNG) von X. Fang sehr theoretisch beschrieben - in vier Schritten hergeleitet:

1. Jedes Wort setzt drei Brillen auf (Query, Key, Value) und wandert dann für eine "Befragung" in einen niedrigdimensionalen Konzeptraum.
2. Alle Wörter befragen sich gegenseitig, gewichten die Antworten per Softmax und nehmen dann prozentual die Informationen der anderen Wörter in sich auf (die o.g. Metadaten).
3. Diese Mischung wird zurück in den ursprünglichen Embedding-Raum geführt.
4. Das Ergebnis wird per "Residual Connection" auf das Original-Embedding addiert. Die ursprüngliche Bedeutung des Wortes geht nicht verloren, nur die "Metadaten" zu den anderen Wörtern kommen obendrauf.

Bleibt noch die Frage aus Teil 1: _Warum werden längere Eingaben überproportional viel teurer?_ X. Fang beantwortet dies in dem oben vereinfacht dargestellten Schritt 2: Jedes Wort spricht dort ja mit jedem anderen Wort. Bei _n_ Tokens sind das _n · n_ Paare - der Rechenaufwand wächst also **quadratisch** mit der Länge der Eingabe (in Fachsprache: **O(n²)**). Doppelt so viele Tokens bedeuten viermal so viel Attention-Arbeit. Das ist der Grund, warum lange Kontexte in LLMs so teuer sind. Eine der größten Herausforderungen der aktuellen Forschung der Big-Tech-Firmen ist somit, diese Quadrat-Grenze zu umgehen. Die Ersten, die das schaffen, werden die Nase im KI-Rennen wieder eine lange Zeit vorne haben. Bis letztlich der nächste große Durchbruch kommt. Was auch immer das sein wird.

## Quellenübersicht

- Vaswani et al., [Attention Is All You Need](https://arxiv.org/abs/1706.03762), 2017 - das Paper, das den Transformer und damit den heutigen Attention-Mechanismus eingeführt hat.
- X. Fang, [LLM & Transformer Interview Essentials A-Z](https://www.amazon.com/LLM-Transformer-Interview-Essentials-Z-ebook/dp/B0DNTJ4ZNG) - Grundlage für die vierstufige Struktur dieses Artikels.

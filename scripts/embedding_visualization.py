"""
Erzeugt eine 3D-Visualisierung von Word Embeddings
fuer den Blog-Artikel "Von Text zu Zahlen".

Verwendet sentence-transformers fuer deutsche Embeddings
und PCA zur Dimensionsreduktion auf 3D.
"""

import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sentence_transformers import SentenceTransformer

# Woerter aus dem Beispielsatz
words = ["Bank", "Park", "Geld", "saß", "ging", "abheben"]

# Embeddings berechnen
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
embeddings = model.encode(words)

# PCA auf 3 Dimensionen
pca = PCA(n_components=3)
coords = pca.fit_transform(embeddings)

# Normalisieren damit alle Pfeile aehnliche Laenge haben
norms = np.linalg.norm(coords, axis=1, keepdims=True)
coords = coords / norms

# Plot erstellen
fig = plt.figure(figsize=(10, 8), facecolor="white")
ax = fig.add_subplot(111, projection="3d")

# Farben: Hauptwoerter dunkel, Verben heller gestrichelt
highlight = {"Bank": "#1d4ed8", "Park": "#059669", "Geld": "#d97706"}
default_color = "#94a3b8"

for i, word in enumerate(words):
    x, y, z = coords[i]
    color = highlight.get(word, default_color)
    is_highlight = word in highlight

    ax.quiver(0, 0, 0, x, y, z,
              arrow_length_ratio=0.06,
              color=color,
              linewidth=2.2 if is_highlight else 1.0,
              linestyle="-" if is_highlight else "--",
              alpha=0.9 if is_highlight else 0.4)

    # 3D-Text direkt am Pfeilende
    label = f'embedding("{word}")'
    ax.text(x * 1.18, y * 1.18, z * 1.18,
            label,
            fontsize=9 if is_highlight else 8,
            fontstyle="italic",
            fontweight="bold" if is_highlight else "normal",
            color=color,
            zorder=10)

# Achsen minimalistisch
ax.set_xticklabels([])
ax.set_yticklabels([])
ax.set_zticklabels([])
ax.set_xlabel("")
ax.set_ylabel("")
ax.set_zlabel("")
ax.xaxis.pane.fill = False
ax.yaxis.pane.fill = False
ax.zaxis.pane.fill = False
ax.xaxis.pane.set_edgecolor("#e5e7eb")
ax.yaxis.pane.set_edgecolor("#e5e7eb")
ax.zaxis.pane.set_edgecolor("#e5e7eb")
ax.xaxis.line.set_color("#d1d5db")
ax.yaxis.line.set_color("#d1d5db")
ax.zaxis.line.set_color("#d1d5db")
ax.grid(True, alpha=0.15)

# Blickwinkel und Limits anpassen damit Labels sichtbar bleiben
ax.view_init(elev=20, azim=135)
limit = 1.4
ax.set_xlim([-limit, limit])
ax.set_ylim([-limit, limit])
ax.set_zlim([-limit, limit])

plt.subplots_adjust(left=0.05, right=0.95, top=0.95, bottom=0.05)
plt.savefig("public/images/blog/embedding-vectors-3d.png",
            dpi=150, bbox_inches="tight", facecolor="white")
plt.savefig("public/images/blog/embedding-vectors-3d.svg",
            bbox_inches="tight", facecolor="white")
print("Gespeichert: public/images/blog/embedding-vectors-3d.png + .svg")

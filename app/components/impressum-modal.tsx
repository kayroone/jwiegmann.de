"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ImpressumModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children || <span className="text-sm text-gray-400 hover:text-white">Impressum</span>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-900 text-white border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Impressum</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-1">Angaben gemäß § 5 TMG</h3>
              <p>Jan Wiegmann</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Kontakt</h3>
              <p>E-Mail: jw@jwiegmann.de</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
              <p>Jan Wiegmann</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Haftungsausschluss</h3>
              <p className="text-xs">
                Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
                Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
              </p>
              <p className="text-xs mt-2">
                Als Diensteanbieter bin ich gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
                allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG bin ich als Diensteanbieter jedoch nicht
                verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
                forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


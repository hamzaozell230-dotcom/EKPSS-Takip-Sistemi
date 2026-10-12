import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/Nav";
import { KONULAR } from "@/lib/store";
import { DURUMLAR, useKonular, type Durum } from "@/lib/konu";

export const Route = createFileRoute("/konular")({
  head: () => ({ meta: [
    { title: "EKPSS Konuları | EKPSS Takip" },
    { name: "description", content: "ÖSYM EKPSS konu listesi ile işlendi, işleniyor, işlenecek takibi." },
    { property: "og:title", content: "EKPSS Konuları | EKPSS Takip" },
    { property: "og:description", content: "ÖSYM'ye göre EKPSS konu takibi." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Konular,
});

const renk: Record<Durum, string> = {
  islendi: "bg-primary text-primary-foreground",
  isleniyor: "bg-accent text-accent-foreground ring-1 ring-primary",
  islenecek: "bg-secondary text-muted-foreground",
};

function Konular() {
  const { durum, setDurum, extra, setExtra, hidden, setHidden, listOf } = useKonular();
  const [input, setInput] = useState<Record<string, string>>({});

  const sil = (ders: string, k: string) => {
    if ((KONULAR[ders] ?? []).includes(k)) setHidden({ ...hidden, [ders]: [...(hidden[ders] ?? []), k] });
    else setExtra({ ...extra, [ders]: (extra[ders] ?? []).filter((x) => x !== k) });
  };

  return (
    <Page title="EKPSS Konuları" sub="Konu ekle, çıkar ve her konunun durumunu seç">
      <div className="grid gap-5 md:grid-cols-2">
        {Object.keys(KONULAR).map((ders) => {
          const all = listOf(ders);
          const c = all.filter((k) => durum[`${ders}:${k}`] === "islendi").length;
          const pct = all.length ? Math.round((c / all.length) * 100) : 0;
          return (
            <div key={ders} className="card-glow rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">{ders}</h3>
                <span className="text-sm text-primary">{c}/{all.length} • %{pct}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
              {(hidden[ders]?.length ?? 0) > 0 && (
                <Button className="mt-2 text-xs text-muted-foreground underline" onClick={() => setHidden({ ...hidden, [ders]: [] })}>Çıkarılan {hidden[ders]?.length} konuyu geri getir</Button>
              )}
              <ul className="mt-4 space-y-2">
                {all.map((k) => {
                  const id = `${ders}:${k}`;
                  const d: Durum = durum[id] ?? "islenecek";
                  return (
                    <li key={k} className="flex items-center gap-2 text-sm">
                      <span className={`flex-1 ${d === "islendi" ? "text-muted-foreground line-through" : ""}`}>{k}</span>
                      <select value={d} onChange={(e) => setDurum({ ...durum, [id]: e.target.value as Durum })}
                        className={`rounded-full px-2 py-1 text-xs font-medium outline-none ${renk[d]}`}>
                        {DURUMLAR.map((o) => <option key={o.key} value={o.key} className="bg-secondary text-foreground">{o.label}</option>)}
                      </select>
                      <Button className="text-xs text-destructive" onClick={() => sil(ders, k)} aria-label="Konuyu çıkar">Çıkar</Button>
                    </li>
                  );
                })}
              </ul>
              <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = (input[ders] ?? "").trim(); if (!v || all.includes(v)) return;
                if ((KONULAR[ders] ?? []).includes(v)) setHidden({ ...hidden, [ders]: (hidden[ders] ?? []).filter((x) => x !== v) });
                else setExtra({ ...extra, [ders]: [...(extra[ders] ?? []), v] });
                setInput({ ...input, [ders]: "" }); }}>
                <input className="field flex-1" placeholder="Konu ekle..." value={input[ders] ?? ""} onChange={(e) => setInput({ ...input, [ders]: e.target.value })} />
                <Button className="btn-primary">Ekle</Button>
              </form>
            </div>
          );
        })}
      </div>
    </Page>
  );
}

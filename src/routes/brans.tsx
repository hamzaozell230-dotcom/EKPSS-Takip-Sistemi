import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/Nav";
import { net, uid, useLocal } from "@/lib/store";

export type BransDeneme = { id: string; ad: string; tarih: string; d: number; y: number; b: number };

export const Route = createFileRoute("/brans")({
  head: () => ({ meta: [
    { title: "Branş Deneme Takibi | EKPSS Takip" },
    { name: "description", content: "EKPSS branş denemelerinde doğru, yanlış, boş ve net takibi." },
    { property: "og:title", content: "Branş Deneme Takibi | EKPSS Takip" },
    { property: "og:description", content: "Branş denemesi net hesaplama." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Brans,
});

function Brans() {
  const [list, setList] = useLocal<BransDeneme[]>("brans", []);
  const [f, setF] = useState({ ad: "", d: 0, y: 0, b: 0 });
  const save = () => {
    setList([{ id: uid(), ...f, ad: f.ad || `Branş ${list.length + 1}`, tarih: new Date().toLocaleDateString("tr-TR") }, ...list]);
    setF({ ad: "", d: 0, y: 0, b: 0 });
  };
  return (
    <Page title="Branş Deneme" sub="Doğru, yanlış ve boşları gir • Net otomatik hesaplanır">
      <div className="card-glow grid gap-4 rounded-2xl p-6 md:grid-cols-6">
        <input className="field md:col-span-2" placeholder="Deneme / ders adı" value={f.ad} onChange={(e) => setF({ ...f, ad: e.target.value })} />
        {(["d", "y", "b"] as const).map((k) => (
          <label key={k} className="text-xs text-muted-foreground">{k === "d" ? "Doğru" : k === "y" ? "Yanlış" : "Boş"}
            <input type="number" min={0} className="field mt-1 w-full" value={f[k]} onChange={(e) => setF({ ...f, [k]: Math.max(0, +e.target.value || 0) })} />
          </label>
        ))}
        <div className="flex flex-col justify-end">
          <div className="text-xs text-muted-foreground">Net</div>
          <div className="text-3xl font-bold text-primary">{net(f.d, f.y)}</div>
        </div>
        <Button className="btn-primary md:col-span-6" onClick={save}>Kaydet</Button>
      </div>
      <h2 className="mt-10 font-display text-2xl font-bold">Geçmiş Denemeler</h2>
      <div className="mt-4 grid gap-3">
        {list.length === 0 && <p className="text-muted-foreground">Henüz deneme yok.</p>}
        {list.map((g) => (
          <div key={g.id} className="card-glow flex items-center justify-between rounded-xl p-4">
            <div><div className="font-semibold">{g.ad}</div><div className="text-xs text-muted-foreground">{g.tarih} • {g.d + g.y + g.b} soru</div></div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">D {g.d} • Y {g.y} • B {g.b}</span>
              <span className="text-2xl font-bold text-primary">{net(g.d, g.y)}</span>
              <Button className="text-xs text-destructive" onClick={() => setList(list.filter((x) => x.id !== g.id))}>Sil</Button>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/Nav";
import { KONULAR, net, uid, useLocal } from "@/lib/store";

export const Route = createFileRoute("/soru-bankam")({
  head: () => ({ meta: [
    { title: "Soru Bankam | EKPSS Takip" },
    { name: "description", content: "Çözdüğün soru bankalarını ders, yayın ve üniteye göre kaydet; doğru, yanlış, boş ve net takibi yap." },
    { property: "og:title", content: "Soru Bankam | EKPSS Takip" },
    { property: "og:description", content: "Soru bankası doğru, yanlış, boş ve net takibi." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: SoruBankam,
});

type Kayit = { id: string; tarih: string; ders: string; yayin: string; unite: string; d: number; y: number; b: number };
const bos = { ders: "Türkçe", yayin: "", unite: "", d: "", y: "", b: "" };

function SoruBankam() {
  const [list, setList] = useLocal<Kayit[]>("soruBankasi", []);
  const [f, setF] = useState(bos);
  const n = (s: string) => Math.max(0, Number(s) || 0);
  const kaydet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.yayin.trim() || !f.unite.trim()) return;
    setList([{ id: uid(), tarih: new Date().toLocaleDateString("tr-TR"), ders: f.ders, yayin: f.yayin.trim(), unite: f.unite.trim(), d: n(f.d), y: n(f.y), b: n(f.b) }, ...list]);
    setF({ ...bos, ders: f.ders, yayin: f.yayin });
  };
  const top = list.reduce((a, k) => ({ d: a.d + k.d, y: a.y + k.y, b: a.b + k.b }), { d: 0, y: 0, b: 0 });

  return (
    <Page title="Soru Bankam" sub="Çözdüğün dersi, yayını ve üniteyi gir; netin otomatik hesaplansın">
      <form onSubmit={kaydet} className="card-glow grid gap-3 rounded-2xl p-5 md:grid-cols-7">
        <select className="field" value={f.ders} onChange={(e) => setF({ ...f, ders: e.target.value })}>
          {Object.keys(KONULAR).map((d) => <option key={d}>{d}</option>)}
        </select>
        <input className="field" placeholder="Yayın" value={f.yayin} onChange={(e) => setF({ ...f, yayin: e.target.value })} />
        <input className="field" placeholder="Ünite / Konu" value={f.unite} onChange={(e) => setF({ ...f, unite: e.target.value })} />
        <input className="field" type="number" min={0} placeholder="Doğru" value={f.d} onChange={(e) => setF({ ...f, d: e.target.value })} />
        <input className="field" type="number" min={0} placeholder="Yanlış" value={f.y} onChange={(e) => setF({ ...f, y: e.target.value })} />
        <input className="field" type="number" min={0} placeholder="Boş" value={f.b} onChange={(e) => setF({ ...f, b: e.target.value })} />
        <Button className="btn-primary">Kaydet • Net {net(n(f.d), n(f.y)).toFixed(2)}</Button>
      </form>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[["Toplam Soru", top.d + top.y + top.b], ["Doğru", top.d], ["Yanlış", top.y], ["Toplam Net", net(top.d, top.y).toFixed(2)]].map(([l, v]) => (
          <div key={l} className="card-glow rounded-2xl p-5"><div className="text-sm text-muted-foreground">{l}</div><div className="mt-1 font-display text-3xl font-bold text-primary">{v}</div></div>
        ))}
      </div>

      <div className="card-glow mt-6 overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr>{["Tarih", "Ders", "Yayın", "Ünite", "D", "Y", "B", "Net", ""].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">Henüz kayıt yok.</td></tr>}
            {list.map((k) => (
              <tr key={k.id} className="border-t">
                <td className="p-3">{k.tarih}</td><td className="p-3">{k.ders}</td><td className="p-3">{k.yayin}</td><td className="p-3">{k.unite}</td>
                <td className="p-3">{k.d}</td><td className="p-3">{k.y}</td><td className="p-3">{k.b}</td>
                <td className="p-3 font-bold text-primary">{net(k.d, k.y).toFixed(2)}</td>
                <td className="p-3"><Button className="text-xs text-destructive" onClick={() => setList(list.filter((x) => x.id !== k.id))}>Sil</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}

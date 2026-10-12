import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/Nav";
import { GENEL_DERSLER, net, uid, useLocal } from "@/lib/store";
import { Minus, Plus } from "lucide-react";
import { clampQuestionCount, defaultQuestionCounts, fitAnswers, totalQuestions } from "@/lib/exam";

export type GenelDeneme = { id: string; ad: string; tarih: string; sonuc: Record<string, { d: number; y: number }>; soruSayilari?: Record<string, number> };

export const Route = createFileRoute("/genel")({
  head: () => ({ meta: [
    { title: "Genel Deneme Takibi | EKPSS Takip" },
    { name: "description", content: "EKPSS genel denemelerinde ayarlanabilir ders soru sayıları, doğru, yanlış ve net takibi." },
    { property: "og:title", content: "Genel Deneme Takibi | EKPSS Takip" },
    { property: "og:description", content: "EKPSS genel deneme net hesaplama." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Genel,
});

const empty = () => Object.fromEntries(GENEL_DERSLER.map((d) => [d.key, { d: 0, y: 0 }]));

function Genel() {
  const [list, setList] = useLocal<GenelDeneme[]>("genel", []);
  const [ad, setAd] = useState("");
  const [s, setS] = useState<Record<string, { d: number; y: number }>>(empty());
  const [counts, setCounts] = useState(defaultQuestionCounts);
  const countTotal = totalQuestions(counts);
  const changeCount = (key: string, value: number) => {
    const count = clampQuestionCount(value);
    setCounts(prev => ({ ...prev, [key]: count }));
    setS(prev => ({ ...prev, [key]: fitAnswers(prev[key] ?? { d: 0, y: 0 }, count) }));
  };

  const top = (r: GenelDeneme["sonuc"]) => GENEL_DERSLER.reduce((a, d) => {
    const v = r[d.key] ?? { d: 0, y: 0 };
    return { d: a.d + v.d, y: a.y + v.y };
  }, { d: 0, y: 0 });
  const t = top(s);

  const set = (k: string, f: "d" | "y", v: number, max: number) => {
    const cur = s[k] ?? { d: 0, y: 0 };
    const other = f === "d" ? cur.y : cur.d;
    const val = Math.max(0, Math.min(Math.floor(v || 0), max - other));
    setS({ ...s, [k]: { ...cur, [f]: val } });
  };

  const save = () => {
    setList([{ id: uid(), ad: ad || `Deneme ${list.length + 1}`, tarih: new Date().toLocaleDateString("tr-TR"), sonuc: s, soruSayilari: { ...counts } }, ...list]);
    setAd(""); setS(empty());
  };

  return (
    <Page title="Genel Deneme" sub={`${countTotal} soru • 4 yanlış 1 doğruyu götürür`}>
      <div className="border-b border-border pb-6">
        <input className="field mb-4 w-full" placeholder="Deneme adı (ör. Yayın X - 3)" value={ad} onChange={(e) => setAd(e.target.value)} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground"><tr className="text-left">
              <th className="py-2">Ders</th><th>Soru</th><th>Doğru</th><th>Yanlış</th><th>Boş</th><th>Net</th></tr></thead>
            <tbody>
              {GENEL_DERSLER.map((d, i) => {
                const v = s[d.key] ?? { d: 0, y: 0 };
                return (
                  <tr key={d.key} className="border-t border-border">
                    <td className="py-2">
                      {(i === 0 || GENEL_DERSLER[i - 1]?.grup !== d.grup) && <div className="text-xs text-primary">{d.grup}</div>}
                      {d.label}
                    </td>
                    <td><div className="flex w-36 items-center gap-1 pr-3">
                      <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={`${d.label} soru sayısını azalt`} title="Soru sayısını azalt" disabled={(counts[d.key] ?? d.soru) === 0} onClick={() => changeCount(d.key, (counts[d.key] ?? d.soru) - 1)}><Minus /></Button>
                      <input aria-label={`${d.label} soru sayısı`} type="number" min={0} max={1000} step={1} className="field w-16 text-center" value={counts[d.key] ?? d.soru} onChange={e => changeCount(d.key, +e.target.value)} />
                      <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={`${d.label} soru sayısını artır`} title="Soru sayısını artır" disabled={(counts[d.key] ?? d.soru) >= 1000} onClick={() => changeCount(d.key, (counts[d.key] ?? d.soru) + 1)}><Plus /></Button>
                    </div></td>
                    <td><input aria-label={`${d.label} doğru`} type="number" min={0} max={(counts[d.key] ?? d.soru) - v.y} className="field w-20" value={v.d} onChange={(e) => set(d.key, "d", +e.target.value, counts[d.key] ?? d.soru)} /></td>
                    <td><input aria-label={`${d.label} yanlış`} type="number" min={0} max={(counts[d.key] ?? d.soru) - v.d} className="field w-20" value={v.y} onChange={(e) => set(d.key, "y", +e.target.value, counts[d.key] ?? d.soru)} /></td>
                    <td>{(counts[d.key] ?? d.soru) - v.d - v.y}</td>
                    <td className="font-semibold text-primary">{net(v.d, v.y)}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-primary/40 font-bold">
                <td className="py-3">Toplam</td><td>{countTotal}</td><td>{t.d}</td><td>{t.y}</td><td>{countTotal - t.d - t.y}</td>
                <td className="text-2xl text-primary">{net(t.d, t.y)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Button className="btn-primary mt-4" onClick={save}>Denemeyi Kaydet</Button>
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold">Geçmiş Denemeler</h2>
      <div className="mt-4 grid gap-3">
        {list.length === 0 && <p className="text-muted-foreground">Henüz deneme yok.</p>}
        {list.map((g) => {
          const tt = top(g.sonuc);
          return (
            <div key={g.id} className="card-glow rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><div className="font-semibold">{g.ad}</div><div className="text-xs text-muted-foreground">{g.tarih}</div></div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm text-muted-foreground">{totalQuestions(g.soruSayilari)} soru • D {tt.d} • Y {tt.y} • B {totalQuestions(g.soruSayilari) - tt.d - tt.y}</span>
                  <span className="text-2xl font-bold text-primary">{net(tt.d, tt.y)}</span>
                  <Button className="text-xs text-destructive" onClick={() => setList(list.filter((x) => x.id !== g.id))}>Sil</Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {GENEL_DERSLER.map((d) => { const v = g.sonuc[d.key] ?? { d: 0, y: 0 }; return (
                  <span key={d.key} className="rounded-full bg-secondary px-2 py-1">{d.label}: {net(v.d, v.y)} net / {g.soruSayilari?.[d.key] ?? d.soru} soru</span>); })}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}

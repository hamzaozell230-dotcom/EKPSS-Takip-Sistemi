import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Page } from "@/components/Nav";
import { useLocal } from "@/lib/store";

export const Route = createFileRoute("/pomodoro")({
  head: () => ({ meta: [
    { title: "Pomodoro | EKPSS Takip" },
    { name: "description", content: "EKPSS çalışmaların için odak ve mola zamanlayıcısı." },
    { property: "og:title", content: "Pomodoro | EKPSS Takip" },
    { property: "og:description", content: "Pomodoro tekniğiyle odaklı EKPSS çalışması." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Pomodoro,
});

const MODLAR = { odak: { label: "Odak", dk: 25 }, kisa: { label: "Kısa Mola", dk: 5 }, uzun: { label: "Uzun Mola", dk: 15 } } as const;
type Mod = keyof typeof MODLAR;

function Pomodoro() {
  const [sureler, setSureler] = useLocal<Record<Mod, number>>("pomoSure", { odak: 25, kisa: 5, uzun: 15 });
  const [tamam, setTamam] = useLocal<number>("pomoTamam", 0);
  const [mod, setMod] = useState<Mod>("odak");
  const [kalan, setKalan] = useState(25 * 60);
  const [calisiyor, setCalisiyor] = useState(false);

  useEffect(() => { if (!calisiyor) setKalan(sureler[mod] * 60); }, [mod, sureler]); // eslint-disable-line
  useEffect(() => {
    if (!calisiyor) return;
    const t = setInterval(() => setKalan((k) => k - 1), 1000);
    return () => clearInterval(t);
  }, [calisiyor]);
  useEffect(() => {
    if (kalan > 0 || !calisiyor) return;
    setCalisiyor(false);
    if (mod === "odak") setTamam(tamam + 1);
    try { new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=").play(); } catch {}
    const sonraki: Mod = mod === "odak" ? ((tamam + 1) % 4 === 0 ? "uzun" : "kisa") : "odak";
    setMod(sonraki);
    setKalan(sureler[sonraki] * 60);
  }, [kalan]); // eslint-disable-line

  const mm = String(Math.floor(Math.max(0, kalan) / 60)).padStart(2, "0");
  const ss = String(Math.max(0, kalan) % 60).padStart(2, "0");
  const pct = 100 - (kalan / (sureler[mod] * 60)) * 100;

  return (
    <Page title="Pomodoro" sub="Odaklan, mola ver, tekrarla">
      <div className="card-glow mx-auto max-w-md rounded-3xl p-8 text-center">
        <div className="flex justify-center gap-2">
          {(Object.keys(MODLAR) as Mod[]).map((m) => (
            <Button key={m} onClick={() => { setCalisiyor(false); setMod(m); }}
              className={`rounded-full px-3 py-1.5 text-sm ${mod === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{MODLAR[m].label}</Button>
          ))}
        </div>
        <div className="mt-8 font-display text-7xl font-bold tabular-nums">{mm}:{ss}</div>
        <div className="mt-6 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
        <div className="mt-6 flex justify-center gap-3">
          <Button className="btn-primary" onClick={() => setCalisiyor(!calisiyor)}>{calisiyor ? "Duraklat" : "Başlat"}</Button>
          <Button className="rounded-lg bg-secondary px-4" onClick={() => { setCalisiyor(false); setKalan(sureler[mod] * 60); }}>Sıfırla</Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Tamamlanan odak: <span className="font-bold text-primary">{tamam}</span> <Button className="ml-2 underline" onClick={() => setTamam(0)}>sıfırla</Button></p>
        <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
          {(Object.keys(MODLAR) as Mod[]).map((m) => (
            <label key={m} className="text-muted-foreground">{MODLAR[m].label} (dk)
              <input type="number" min={1} className="field mt-1 w-full" value={sureler[m]} onChange={(e) => setSureler({ ...sureler, [m]: Math.max(1, Number(e.target.value) || 1) })} />
            </label>
          ))}
        </div>
      </div>
    </Page>
  );
}

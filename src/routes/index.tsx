import { createFileRoute, Link } from "@tanstack/react-router";
import { Page } from "@/components/Nav";
import { GENEL_DERSLER, KONULAR, net, useLocal } from "@/lib/store";
import { useKonular } from "@/lib/konu";
import type { GenelDeneme } from "./genel";
import type { BransDeneme } from "./brans";
import type { Playlist } from "./playlist";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "EKPSS Takip | Deneme, Konu ve Playlist Takibi" },
    { name: "description", content: "EKPSS hazırlığın için deneme netleri, konu ilerlemesi ve hoca playlist takibi." },
    { property: "og:title", content: "EKPSS Takip" },
    { property: "og:description", content: "EKPSS deneme, konu ve playlist takibi tek yerde." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Index,
});

function Index() {
  const [genel] = useLocal<GenelDeneme[]>("genel", []);
  const [brans] = useLocal<BransDeneme[]>("brans", []);
  const [lists] = useLocal<Playlist[]>("playlists", []);
  const { durum, listOf } = useKonular();

  const gNet = (g: GenelDeneme) => GENEL_DERSLER.reduce((a, d) => a + net(g.sonuc[d.key]?.d ?? 0, g.sonuc[d.key]?.y ?? 0), 0);
  const dersler = Object.keys(KONULAR).map((ders) => {
    const all = listOf(ders);
    const c = (s: string) => all.filter((k) => (durum[`${ders}:${k}`] ?? "islenecek") === s).length;
    const islendi = c("islendi"), isleniyor = c("isleniyor");
    return { ders, total: all.length, islendi, isleniyor, pct: all.length ? Math.round((islendi / all.length) * 100) : 0 };
  });
  const totalKonu = dersler.reduce((a, d) => a + d.total, 0);
  const doneKonu = dersler.reduce((a, d) => a + d.islendi, 0);
  const vids = lists.flatMap((p) => p.videolar);
  const stats = [
    { label: "Son Genel Net", val: genel[0] ? gNet(genel[0]).toFixed(2) : "—", to: "/genel" as const },
    { label: "Son Branş Net", val: brans[0] ? net(brans[0].d, brans[0].y).toFixed(2) : "—", to: "/brans" as const },
    { label: "Konu İlerlemesi", val: `%${totalKonu ? Math.round((doneKonu / totalKonu) * 100) : 0}`, to: "/konular" as const },
    { label: "İzlenen Video", val: `${vids.filter((v) => v.izlendi).length}/${vids.length}`, to: "/playlist" as const },
  ];

  return (
    <Page title="Özet" sub="EKPSS yolculuğunda nerede olduğunu gör.">
      <div className="card-glow mb-8 rounded-2xl border border-primary/30 bg-primary/5 px-6 py-10 text-center">
        <div className="text-xs uppercase tracking-[0.35em] text-primary">Hoş geldin 👋</div>
        <h2 className="mt-4 font-display text-5xl font-black tracking-tight text-primary sm:text-6xl">EKPSS YOLCUSU</h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
          Çalıştığın konular, çözdüğün denemeler ve izlediğin videolar — hepsi bu ekranda.
          Bugün de bir adım at, ilerlemeni birlikte izleyelim.
        </p>
      </div>

      <div className="card-glow mb-8 rounded-2xl border-l-4 border-l-primary p-6">
        <h2 className="font-display text-xl font-bold text-primary">Bugün de bir adım daha!</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Bu yolda attığın her adım, hayalindeki kadroya seni biraz daha yaklaştırıyor. Bazı günler yorgun, bazı günler isteksiz olabilirsin; bu çok normal.
          Önemli olan bırakmamak. Bir konu, bir test, bir pomodoro… Küçük ama düzenli adımlar büyük sonuçlar doğurur.
          Kendini başkalarıyla değil, dünkü hâlinle kıyasla. Sen bu sınavı kazanacak güce sahipsin — yeter ki inanmaya ve çalışmaya devam et. 💪
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="card-glow rounded-2xl p-6 transition hover:-translate-y-1">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="mt-2 font-display text-4xl font-bold text-primary">{s.val}</div>
          </Link>
        ))}
      </div>

      <div className="card-glow mt-8 rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Derslere Göre Konu İlerlemesi</h2>
        <div className="mt-6 space-y-4">
          {dersler.map((d) => (
            <div key={d.ders}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{d.ders}</span>
                <span className="text-muted-foreground"><span className="font-bold text-primary">%{d.pct}</span> işlendi • {d.isleniyor} işleniyor • {d.total - d.islendi - d.isleniyor} işlenecek</span>
              </div>
              <div className="flex h-4 overflow-hidden rounded-full bg-secondary">
                <div className="bg-primary transition-all" style={{ width: `${d.total ? (d.islendi / d.total) * 100 : 0}%` }} />
                <div className="bg-primary/40 transition-all" style={{ width: `${d.total ? (d.isleniyor / d.total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {genel.length > 1 && (
        <div className="card-glow mt-8 rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold">Genel Deneme Gidişatı</h2>
          <div className="mt-6 flex h-40 items-end gap-2">
            {[...genel].reverse().slice(-15).map((g) => {
              const n = gNet(g);
              return <div key={g.id} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs">{n.toFixed(1)}</span>
                <div className="w-full rounded-t-md bg-primary" style={{ height: `${Math.max(2, (n / 60) * 100)}%` }} />
              </div>;
            })}
          </div>
        </div>
      )}
    </Page>
  );
}

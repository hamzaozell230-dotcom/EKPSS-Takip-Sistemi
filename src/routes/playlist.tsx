import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Plus, Trash2, RotateCcw, ExternalLink } from "lucide-react";
import { Page } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaylistPlayer } from "@/components/PlaylistPlayer";
import { uid, useLocal } from "@/lib/store";
import { DURUMLAR, type Durum } from "@/lib/konu";
import { mergePlaylistVideos, updateVideoStatus, videoStatus, youtubeListId, youtubeVideoId, type Playlist, type Video } from "@/lib/playlist";
export type { Playlist } from "@/lib/playlist";

export const Route = createFileRoute("/playlist")({
  head: () => ({ meta: [
    { title: "Hoca Playlistleri | EKPSS Takip Sistemi" },
    { name: "description", content: "YouTube playlist videoları, otomatik izleme durumu ve elle ilerleme takibi." },
    { property: "og:title", content: "Hoca Playlistleri | EKPSS Takip Sistemi" },
    { property: "og:description", content: "EKPSS ders videolarını işlendi, işleniyor ve işlenecek durumlarıyla takip et." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: PlaylistPage,
});

function parseVideo(line: string, index: number): Video {
  const match = line.match(/https?:\/\/\S+/);
  const youtubeId = youtubeVideoId(match?.[0] ?? "");
  const ad = line.replace(match?.[0] ?? "", "").replace(/^[\s|—-]+|[\s|—-]+$/g, "") || `Video ${index + 1}`;
  return { id: uid(), ad, izlendi: false, durum: "islenecek", ...(youtubeId ? { youtubeId, url: `https://www.youtube.com/watch?v=${youtubeId}` } : {}) };
}

function PlaylistPage() {
  const [lists, setLists] = useLocal<Playlist[]>("playlists", []);
  const [f, setF] = useState({ hoca: "", ders: "", url: "", videolar: "", adet: 0 });
  const [active, setActive] = useState<{ list: string; video?: string } | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const upd = (id: string, fn: (p: Playlist) => Playlist) => setLists(prev => prev.map(p => p.id === id ? fn(p) : p));
  const add = (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (!f.hoca.trim()) { setError("Hoca adını girin."); return; }
    if (f.url && !youtubeListId(f.url) && !youtubeVideoId(f.url)) { setError("Geçerli bir YouTube playlist veya video bağlantısı girin."); return; }
    let videos = f.videolar.split("\n").map(s => s.trim()).filter(Boolean).map(parseVideo);
    if (!videos.length && f.adet > 0) videos = Array.from({ length: f.adet }, (_, i) => parseVideo(`Ders ${i + 1}`, i));
    const videoId = youtubeVideoId(f.url);
    if (!videos.length && videoId && !youtubeListId(f.url)) videos = [parseVideo(f.url, 0)];
    if (!videos.length && !f.url) { setError("Playlist bağlantısı veya video ekleyin."); return; }
    const id = uid();
    setLists(prev => [...prev, { id, hoca: f.hoca.trim(), ders: f.ders.trim(), url: f.url.trim(), videolar: videos }]);
    if (f.url) setActive({ list: id });
    setF({ hoca: "", ders: "", url: "", videolar: "", adet: 0 });
  };
  const all = lists.flatMap(p => p.videolar);
  const done = all.filter(v => videoStatus(v) === "islendi").length;
  const progress = all.filter(v => videoStatus(v) === "isleniyor").length;
  return <Page title="Hoca Playlistleri">
    <form onSubmit={add} className="grid gap-3 border-b border-border pb-6 sm:grid-cols-2">
      <input aria-label="Hoca adı" className="field w-full" placeholder="Hoca adı" value={f.hoca} onChange={e => setF({ ...f, hoca: e.target.value })} required />
      <input aria-label="Ders" className="field w-full" placeholder="Ders (ör. Matematik)" value={f.ders} onChange={e => setF({ ...f, ders: e.target.value })} />
      <input aria-label="YouTube playlist linki" className="field w-full sm:col-span-2" placeholder="YouTube playlist linki" value={f.url} onChange={e => setF({ ...f, url: e.target.value })} />
      <textarea aria-label="Video bağlantıları ve başlıkları" className="field min-h-24 w-full" placeholder={"Video başlığı ve bağlantısı (her satıra bir video)"} value={f.videolar} onChange={e => setF({ ...f, videolar: e.target.value })} />
      <label className="text-sm text-muted-foreground">Video sayısı (isteğe bağlı)<input type="number" min={0} max={1000} className="field mt-2 w-full" value={f.adet} onChange={e => setF({ ...f, adet: Math.min(1000, Math.max(0, +e.target.value || 0)) })} /></label>
      {error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
      <Button type="submit" className="sm:col-span-2"><Plus />Playlist Ekle</Button>
    </form>
    <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border py-6 text-sm">
      <span>{lists.length} playlist · {all.length} video</span><span className="text-primary">{done} işlendi</span><span>{progress} işleniyor</span><span className="text-muted-foreground">{all.length - done - progress} işlenecek</span>
    </div>
    <div className="mt-6 space-y-8">
      {!lists.length && <p className="text-muted-foreground">Henüz playlist yok.</p>}
      {lists.map(p => {
        const c = p.videolar.filter(v => videoStatus(v) === "islendi").length;
        const listId = youtubeListId(p.url);
        const current = active?.list === p.id;
        return <section key={p.id} className="border-b border-border pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-display text-2xl font-bold">{p.hoca}</h2><p className="mt-1 text-sm text-muted-foreground">{p.ders} · {c}/{p.videolar.length} işlendi</p></div>
            <div className="flex flex-wrap items-center gap-2">
              {p.url && <Button asChild variant="ghost" size="icon" title="YouTube'da aç"><a href={p.url} target="_blank" rel="noreferrer" aria-label={`${p.hoca} YouTube'da aç`}><ExternalLink /></a></Button>}
              {p.url && <Button variant="outline" onClick={() => { setActive(current ? null : { list: p.id }); setRetry(n => n + 1); }}><Play />{current ? "Oynatıcıyı kapat" : "Videoları getir"}</Button>}
              <Button variant="ghost" size="icon" className="text-destructive" title="Playlisti sil" aria-label={`${p.hoca} playlistini sil`} onClick={() => { setLists(prev => prev.filter(x => x.id !== p.id)); if (current) setActive(null); }}><Trash2 /></Button>
            </div>
          </div>
          <progress className="study-progress mt-4 h-2 w-full" max={Math.max(1, p.videolar.length)} value={c} aria-label={`${p.hoca} ilerleme`} />
          {current && <div className="my-5 max-w-3xl"><PlaylistPlayer key={`${p.id}-${retry}`} listId={active.video ? undefined : listId} videoId={active.video ?? (!listId ? youtubeVideoId(p.url) : undefined)}
            onDiscover={ids => upd(p.id, pp => ({ ...pp, videolar: mergePlaylistVideos(pp.videolar, ids) }))}
            onProgress={(id, status, title) => upd(p.id, pp => ({ ...pp, videolar: pp.videolar.map(v => (v.youtubeId ?? youtubeVideoId(v.url ?? "")) === id ? { ...updateVideoStatus(v, status, false), ad: title || v.ad } : v) }))} /></div>}
          {current && !p.videolar.length && <p className="my-4 text-sm text-muted-foreground">Playlist videoları bekleniyor…</p>}
          <ol className="mt-4 divide-y divide-border">
            {p.videolar.map((v, index) => {
              const status = videoStatus(v);
              const youtubeId = v.youtubeId ?? youtubeVideoId(v.url ?? "");
              const href = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : listId ? `https://www.youtube.com/watch?list=${listId}&index=${index + 1}` : undefined;
              return <li key={v.id} className="flex flex-wrap items-center gap-3 py-4" data-video-id={v.id}>
                <span className="w-6 shrink-0 text-sm tabular-nums text-muted-foreground">{index + 1}.</span>
                <div className="min-w-0 flex-1 basis-40"><p className={`break-words text-sm font-medium ${status === "islendi" ? "text-muted-foreground" : ""}`}>{v.ad}</p>{href && <a href={href} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary">Videoyu YouTube'da aç<ExternalLink className="size-3" /></a>}</div>
                <div className="flex flex-wrap items-center gap-2">
                  {youtubeId && <Button variant="ghost" size="icon" title="Videoyu oynat" aria-label={`${v.ad} oynat`} onClick={() => setActive({ list: p.id, video: youtubeId })}><Play /></Button>}
                  <Select value={status} onValueChange={value => upd(p.id, pp => ({ ...pp, videolar: pp.videolar.map(x => x.id === v.id ? updateVideoStatus(x, value as Durum, true) : x) }))}>
                    <SelectTrigger aria-label={`${v.ad} durumu`} className={`w-36 ${status === "islendi" ? "border-primary text-primary" : ""}`}><SelectValue /></SelectTrigger>
                    <SelectContent>{DURUMLAR.map(o => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                  {v.manuel && <Button variant="ghost" size="icon" title="Otomatik takibe dön" aria-label={`${v.ad} otomatik takibe dön`} onClick={() => upd(p.id, pp => ({ ...pp, videolar: pp.videolar.map(x => x.id === v.id ? { ...x, manuel: false } : x) }))}><RotateCcw /></Button>}
                  <Button variant="ghost" size="icon" className="text-destructive" title="Videoyu sil" aria-label={`${v.ad} sil`} onClick={() => upd(p.id, pp => ({ ...pp, videolar: pp.videolar.filter(x => x.id !== v.id) }))}><Trash2 /></Button>
                </div>
              </li>;
            })}
          </ol>
          <form className="mt-4 flex gap-2" onSubmit={e => { e.preventDefault(); const text = drafts[p.id]?.trim(); if (!text) return; upd(p.id, pp => ({ ...pp, videolar: [...pp.videolar, parseVideo(text, pp.videolar.length)] })); setDrafts(prev => ({ ...prev, [p.id]: "" })); }}>
            <input aria-label={`${p.hoca} video ekle`} className="field min-w-0 flex-1" placeholder="Video başlığı ve YouTube bağlantısı" value={drafts[p.id] ?? ""} onChange={e => setDrafts(prev => ({ ...prev, [p.id]: e.target.value }))} />
            <Button type="submit" size="icon" title="Video ekle" aria-label="Video ekle"><Plus /></Button>
          </form>
        </section>;
      })}
    </div>
  </Page>;
}
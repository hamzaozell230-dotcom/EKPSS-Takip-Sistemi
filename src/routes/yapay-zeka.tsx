import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Send, Trash2, X } from "lucide-react";
import { Page } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { useLocal } from "@/lib/store";
import { providerMessages, type Msg } from "@/lib/ai-message";

export const Route = createFileRoute("/yapay-zeka")({
  head: () => ({ meta: [
    { title: "Fotoğraflı Soru ve Yapay Zeka | EKPSS Takip Sistemi" },
    { name: "description", content: "EKPSS asistanına yazılı veya fotoğraflı soru sor." },
    { property: "og:title", content: "Fotoğraflı Soru ve Yapay Zeka | EKPSS Takip Sistemi" },
    { property: "og:description", content: "EKPSS sorularını fotoğrafla veya yazarak çalışma asistanına ilet." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: YapayZeka,
});
type Ayar = { key: string; base: string; model: string };
function YapayZeka() {
  const [ayar, setAyar] = useLocal<Ayar>("aiAyar", { key: "", base: "https://api.openai.com/v1", model: "gpt-4o-mini" });
  const [msgs, setMsgs] = useLocal<Msg[]>("aiSohbet", []);
  const [draft, setDraft] = useState<Ayar | null>(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [camera, setCamera] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const capture = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | undefined>(undefined);
  const a = draft ?? ayar;
  const stopCamera = () => { stream.current?.getTracks().forEach(track => track.stop()); stream.current = undefined; setCamera(false); };
  useEffect(() => () => { stream.current?.getTracks().forEach(track => track.stop()); }, []);
  useEffect(() => { if (camera && video.current && stream.current) video.current.srcObject = stream.current; }, [camera]);
  const openCamera = async () => {
    setErr("");
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) { capture.current?.click(); return; }
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Kamera desteklenmiyor. Fotoğraf ekle düğmesini kullanabilirsiniz.");
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      setCamera(true);
    } catch { setErr("Kamera açılamadı. Kamera iznini kontrol edin veya Fotoğraf ekle düğmesini kullanın."); }
  };
  const takePhoto = () => {
    if (!video.current || !video.current.videoWidth) { setErr("Kamera görüntüsü henüz hazır değil."); return; }
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1600 / video.current.videoWidth);
    canvas.width = video.current.videoWidth * scale; canvas.height = video.current.videoHeight * scale;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.drawImage(video.current, 0, 0, canvas.width, canvas.height);
    setImage(canvas.toDataURL("image/jpeg", 0.85)); stopCamera(); setErr("");
  };
  const attach = async (selected?: File) => {
    if (!selected) return;
    setErr("");
    if (!/^image\/(jpeg|png|webp)$/.test(selected.type)) { setErr("JPG, PNG veya WebP fotoğraf seçin."); return; }
    if (selected.size > 10 * 1024 * 1024) { setErr("Fotoğraf en fazla 10 MB olabilir."); return; }
    const url = URL.createObjectURL(selected);
    try {
      const img = new Image(); img.src = url; await img.decode();
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas"); canvas.width = img.width * scale; canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Fotoğraf okunamadı.");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height); setImage(canvas.toDataURL("image/jpeg", 0.85));
    } catch { setErr("Fotoğraf okunamadı. Başka bir fotoğraf seçin."); }
    finally { URL.revokeObjectURL(url); }
  };
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !image) || busy) return;
    if (!ayar.key) { setErr("Önce API anahtarını kaydet."); return; }
    let base: URL;
    try { base = new URL(ayar.base); if (base.protocol !== "https:") throw new Error(); }
    catch { setErr("Geçerli bir HTTPS API adresi girin."); return; }
    const question: Msg = { role: "user", content: text.trim() || "Bu fotoğraftaki EKPSS sorusunu okuyup adım adım çöz.", ...(image ? { image } : {}) };
    const next = [...msgs, question];
    setBusy(true); setErr("");
    try {
      const response = await fetch(`${base.href.replace(/\/$/, "")}/chat/completions`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${ayar.key}` },
        body: JSON.stringify({ model: ayar.model, messages: [{ role: "system", content: "Sen EKPSS sınavına hazırlanan öğrencilere yardım eden Türkçe konuşan, sabırlı bir öğretmensin. Fotoğraflardaki soruları oku ve adım adım çöz. Görüntü net değilse yeni fotoğraf iste, okunamayan bilgiyi uydurma." }, ...providerMessages(next)] }),
      });
      if (!response.ok) { const body = await response.text(); throw new Error(`API hatası (${response.status}): ${body.slice(0, 600)}`); }
      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content;
      if (typeof answer !== "string" || !answer.trim()) throw new Error("Asistan yanıt vermedi. Model ve API ayarlarını kontrol edin.");
      setMsgs([...next, { role: "assistant", content: answer }]); setText(""); setImage(undefined);
    } catch (error) { setErr(error instanceof Error ? error.message : "Sorunuz gönderilemedi."); }
    finally { setBusy(false); }
  };
  return <Page title="Yapay Zeka">
    <div className="grid gap-8 md:grid-cols-3">
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); setAyar(a); setDraft(null); }}>
        <h2 className="font-display text-xl font-bold">API Ayarları</h2>
        <label className="block text-sm text-muted-foreground">API Anahtarı<input type="password" autoComplete="off" className="field mt-2 w-full" value={a.key} onChange={e => setDraft({ ...a, key: e.target.value })} /></label>
        <label className="block text-sm text-muted-foreground">API Adresi (OpenAI uyumlu)<input className="field mt-2 w-full" value={a.base} onChange={e => setDraft({ ...a, base: e.target.value })} /></label>
        <label className="block text-sm text-muted-foreground">Model<input className="field mt-2 w-full" value={a.model} onChange={e => setDraft({ ...a, model: e.target.value })} /></label>
        <Button type="submit" className="w-full">{ayar.key && !draft ? "Kaydedildi ✓" : "Kaydet"}</Button>
      </form>
      <section className="flex min-h-[60vh] min-w-0 flex-col border-border md:col-span-2 md:border-l md:pl-8">
        <div aria-live="polite" className="flex-1 space-y-5">
          {!msgs.length && <p className="text-muted-foreground">Sorun nedir?</p>}
          {msgs.map((msg, i) => <div key={i} className={`max-w-full break-words whitespace-pre-wrap ${msg.role === "user" ? "ml-auto w-fit max-w-[85%] rounded-lg bg-secondary px-4 py-3" : ""}`}>
            {msg.image && <img src={msg.image} alt="Gönderilen soru fotoğrafı" className="mb-3 max-h-64 max-w-full rounded-lg object-contain" />}{msg.content}
          </div>)}
          {busy && <p className="text-muted-foreground">Sorunuz çözülüyor…</p>}
        </div>
        <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label="Soru fotoğrafı seç" onChange={e => { void attach(e.target.files?.[0]); e.target.value = ""; }} />
        <input ref={capture} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Kameradan soru fotoğrafı" onChange={e => { void attach(e.target.files?.[0]); e.target.value = ""; }} />
        {camera && <div className="mt-5 space-y-3"><video ref={video} autoPlay muted playsInline className="aspect-video w-full rounded-lg bg-secondary object-contain" /><div className="flex gap-2"><Button onClick={takePhoto}><Camera />Fotoğrafı çek</Button><Button variant="outline" onClick={stopCamera}>İptal</Button></div></div>}
        {image && <div className="relative mt-5 w-fit"><img src={image} alt="Soru fotoğrafı önizlemesi" className="max-h-64 max-w-full rounded-lg object-contain" /><Button size="icon" variant="secondary" className="absolute right-2 top-2" aria-label="Fotoğrafı kaldır" title="Fotoğrafı kaldır" disabled={busy} onClick={() => setImage(undefined)}><X /></Button></div>}
        {err && <p role="alert" className="mt-4 break-words text-sm text-destructive">{err}</p>}
        <form onSubmit={send} className="mt-6 border-t border-border pt-4">
          <div className="mb-3 flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={busy || camera} onClick={() => void openCamera()}><Camera />Fotoğraf çek</Button><Button type="button" variant="outline" disabled={busy} onClick={() => file.current?.click()}><ImagePlus />Fotoğraf ekle</Button>{msgs.length > 0 && <Button type="button" variant="ghost" size="icon" title="Sohbeti temizle" aria-label="Sohbeti temizle" disabled={busy} onClick={() => setMsgs([])}><Trash2 /></Button>}</div>
          <div className="flex items-end gap-2"><textarea aria-label="Sorunuz" className="field min-h-20 min-w-0 flex-1 resize-y" value={text} disabled={busy} onChange={e => setText(e.target.value)} placeholder="Sorunu yaz…" /><Button type="submit" size="icon" title={image ? "Fotoğraflı soru sor" : "Soruyu gönder"} aria-label={image ? "Fotoğraflı soru sor" : "Soruyu gönder"} disabled={busy || (!text.trim() && !image)}><Send /></Button></div>
          {image && <Button type="submit" className="mt-3" disabled={busy}><Send />Fotoğraflı soru sor</Button>}
        </form>
      </section>
    </div>
  </Page>;
}
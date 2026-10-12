import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Page } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { brandIconUrl } from "@/lib/brand";

export const Route = createFileRoute("/hakkinda")({
  head: () => ({ meta: [
    { title: "Hakkında ve MIT Lisansı | EKPSS Takip Sistemi" },
    { name: "description", content: "Hamza Tarık Öztürk tarafından geliştirilen EKPSS Takip Sistemi; açık kaynak, MIT lisansı ve telif bildirgesi." },
    { property: "og:title", content: "Hakkında ve MIT Lisansı | EKPSS Takip Sistemi" },
    { property: "og:description", content: "EKPSS Takip Sistemi geliştiricisi, açık kaynak kodu ve lisans bilgileri." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: About,
});
function About() {
  return <Page title="Hakkında">
    <section className="flex flex-col items-center gap-5 border-b border-border pb-8 text-center">
      <img src={brandIconUrl()} alt="EKPSS Takip uygulama simgesi" width={160} height={160} className="size-40 rounded-lg" />
      <h2 className="font-display text-3xl font-bold">EKPSS Takip Sistemi</h2>
      <p className="max-w-xl font-semibold leading-relaxed text-primary">EKPSS ÖĞRENCİSİ HAMZA TARIK ÖZTÜRK TARAFINDAN GELİŞTİRİLDİ</p>
      <Button asChild variant="outline"><a href="https://github.com/hamzaozell230-dotcom/EKPSS-Takip" target="_blank" rel="noreferrer"><ExternalLink />Açık kaynak kodu</a></Button>
    </section>
    <section className="border-b border-border py-8"><h2 className="font-display text-2xl font-bold">Telif Bildirgesi</h2><p className="mt-4 leading-relaxed text-muted-foreground">Copyright © 2026 Hamza Tarık Öztürk. Bu uygulamanın kaynak kodu MIT lisansı kapsamında sunulmaktadır. Üçüncü taraf kütüphaneler, video ve eğitim içerikleri kendi hak sahiplerine aittir ve kendi lisans koşullarına tabidir. MIT lisansı üçüncü taraf içerikleri üzerinde kullanım hakkı vermez.</p></section>
    <section className="py-8"><h2 className="font-display text-2xl font-bold">Lisans Bildirgesi — MIT</h2><p className="mt-4 leading-relaxed text-muted-foreground">Bu yazılımı kullanabilir, kopyalayabilir, değiştirebilir ve dağıtabilirsiniz. Yazılımın tüm kopyalarında veya önemli bölümlerinde telif ve lisans bildirgesi korunmalıdır. Yazılım herhangi bir garanti olmaksızın sunulur.</p><Button asChild variant="link" className="mt-3 px-0"><a href="/LICENSE" target="_blank" rel="noreferrer">MIT lisansının tam metni<ExternalLink /></a></Button></section>
  </Page>;
}
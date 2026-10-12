import { useEffect, useState } from "react";

export function useLocal<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setVal(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(val));
  }, [key, val, ready]);
  return [val, setVal] as const;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
export const net = (d: number, y: number) => Math.round((d - y / 4) * 100) / 100;

// EKPSS genel deneme dağılımı (60 soru)
export const GENEL_DERSLER = [
  { key: "turkce", label: "Türkçe", grup: "Genel Yetenek", soru: 15 },
  { key: "matematik", label: "Matematik", grup: "Genel Yetenek", soru: 15 },
  { key: "tarih", label: "Tarih", grup: "Genel Kültür", soru: 12 },
  { key: "cografya", label: "Coğrafya", grup: "Genel Kültür", soru: 9 },
  { key: "vatandaslik", label: "Vatandaşlık", grup: "Genel Kültür", soru: 6 },
  { key: "guncel", label: "Güncel Bilgiler", grup: "Genel Kültür", soru: 3 },
] as const;

export const KONULAR: Record<string, string[]> = {
  Türkçe: ["Sözcükte Anlam", "Cümlede Anlam", "Paragrafta Anlam", "Ses Bilgisi", "Yazım Kuralları", "Noktalama İşaretleri", "Sözcük Türleri", "Cümlenin Ögeleri", "Anlatım Bozuklukları", "Sözel Mantık"],
  Matematik: ["Temel Kavramlar", "Sayı Basamakları", "Bölme ve Bölünebilme", "EBOB - EKOK", "Rasyonel ve Ondalık Sayılar", "Basit Eşitsizlikler", "Mutlak Değer", "Üslü ve Köklü Sayılar", "Çarpanlara Ayırma", "Oran - Orantı", "Problemler", "Kümeler", "Tablo ve Grafik Yorumlama", "Sayısal Mantık", "Temel Geometri"],
  Tarih: ["İslamiyet Öncesi Türk Tarihi", "İlk Türk-İslam Devletleri", "Osmanlı Kuruluş ve Yükselme", "Osmanlı Duraklama ve Gerileme", "Osmanlı Kültür ve Medeniyeti", "XX. Yüzyılda Osmanlı", "Kurtuluş Savaşı Hazırlık Dönemi", "Kurtuluş Savaşı Muharebeler", "Atatürk İlke ve İnkılapları", "Atatürk Dönemi Dış Politika", "Çağdaş Türk ve Dünya Tarihi"],
  Coğrafya: ["Türkiye'nin Coğrafi Konumu", "Yer Şekilleri", "İklim ve Bitki Örtüsü", "Nüfus ve Yerleşme", "Tarım ve Hayvancılık", "Madenler ve Enerji", "Sanayi", "Ulaşım, Ticaret ve Turizm", "Bölgeler Coğrafyası"],
  Vatandaşlık: ["Hukukun Temel Kavramları", "Anayasa Hukuku", "1982 Anayasası Temel İlkeler", "Temel Hak ve Ödevler", "Yasama", "Yürütme", "Yargı", "İdare Hukuku"],
  "Güncel Bilgiler": ["Türkiye ve Dünya Gündemi", "Uluslararası Kuruluşlar", "Kültür, Sanat ve Spor", "Bilim ve Teknoloji"],
};

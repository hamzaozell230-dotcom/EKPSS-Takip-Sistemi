import { KONULAR, useLocal } from "./store";

export type Durum = "islenecek" | "isleniyor" | "islendi";
export const DURUMLAR: { key: Durum; label: string }[] = [
  { key: "islenecek", label: "İşlenecek" },
  { key: "isleniyor", label: "İşleniyor" },
  { key: "islendi", label: "İşlendi" },
];

export function useKonular() {
  const [durum, setDurum] = useLocal<Record<string, Durum>>("konuDurum", {});
  const [extra, setExtra] = useLocal<Record<string, string[]>>("konuExtra", {});
  const [hidden, setHidden] = useLocal<Record<string, string[]>>("konuHidden", {});
  const listOf = (ders: string) => [
    ...(KONULAR[ders] ?? []).filter((k) => !(hidden[ders] ?? []).includes(k)),
    ...(extra[ders] ?? []),
  ];
  return { durum, setDurum, extra, setExtra, hidden, setHidden, listOf };
}

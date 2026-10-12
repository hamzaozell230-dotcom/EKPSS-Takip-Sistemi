import type { Durum } from "./konu";

export type Video = { id: string; ad: string; izlendi: boolean; url?: string; youtubeId?: string; durum?: Durum; manuel?: boolean };
export type Playlist = { id: string; hoca: string; ders: string; url: string; videolar: Video[] };
export function youtubeVideoId(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return url.pathname.slice(1).match(/^[\w-]{11}$/)?.[0];
    if (!/^(www\.|m\.)?youtube\.com$/.test(url.hostname)) return;
    return (url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1])?.match(/^[\w-]{11}$/)?.[0];
  } catch { return; }
}
export function youtubeListId(value: string) {
  try {
    const url = new URL(value);
    if (!/^(www\.|m\.)?youtube\.com$/.test(url.hostname) && url.hostname !== "youtu.be") return;
    return url.searchParams.get("list")?.match(/^[\w-]+$/)?.[0];
  } catch { return; }
}
export const videoStatus = (video: Video): Durum => video.durum ?? (video.izlendi ? "islendi" : "islenecek");
export function updateVideoStatus(video: Video, durum: Durum, manual: boolean): Video {
  if (!manual && video.manuel) return video;
  if (!manual && durum === "isleniyor" && videoStatus(video) === "islendi") return video;
  return { ...video, durum, izlendi: durum === "islendi", manuel: manual };
}
export function mergePlaylistVideos(existing: Video[], ids: string[]): Video[] {
  const unique = [...new Set(ids)];
  const linked = unique.map((youtubeId, index) => {
    const found = existing.find(v => (v.youtubeId ?? youtubeVideoId(v.url ?? "")) === youtubeId);
    const legacy = existing[index];
    const base = found ?? (legacy && !legacy.youtubeId && !legacy.url ? legacy : undefined);
    return { ...(base ?? { id: `yt-${youtubeId}`, ad: `Video ${index + 1}`, izlendi: false }), youtubeId, url: `https://www.youtube.com/watch?v=${youtubeId}` };
  });
  const linkedIds = new Set(linked.map(v => v.id));
  return [...linked, ...existing.filter(v => !linkedIds.has(v.id))];
}
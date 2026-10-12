import { useEffect, useRef, useState } from "react";
import { loadYouTubePlayer, type YouTubePlayer } from "@/lib/youtube-player";

export function PlaylistPlayer({ listId, videoId, onDiscover, onProgress }: {
  listId?: string | undefined; videoId?: string | undefined;
  onDiscover: (ids: string[]) => void;
  onProgress: (id: string, status: "isleniyor" | "islendi", title?: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onDiscover, onProgress });
  callbacks.current = { onDiscover, onProgress };
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    let player: YouTubePlayer | undefined;
    let poll: ReturnType<typeof setInterval> | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let discovered = false;
    const inspect = (target: YouTubePlayer) => {
      const ids = target.getPlaylist();
      if (ids?.length && !discovered) { discovered = true; setError(""); callbacks.current.onDiscover(ids); }
      const data = target.getVideoData();
      if (data.video_id && target.getPlayerState() === 1) callbacks.current.onProgress(data.video_id, "isleniyor", data.title);
    };
    setError("");
    void loadYouTubePlayer().then(YT => {
      if (cancelled || !host.current) return;
      const target = document.createElement("div");
      host.current.replaceChildren(target);
      player = new YT.Player(target, {
        width: "100%", height: "100%", videoId,
        playerVars: { ...(listId ? { listType: "playlist", list: listId } : {}), playsinline: 1, origin: window.location.origin },
        events: {
          onReady: event => {
            if (cancelled) return;
            inspect(event.target);
            poll = setInterval(() => inspect(event.target), 1500);
            if (listId) timeout = setTimeout(() => {
              if (!discovered) setError("Videolar henüz alınamadı. Liste gizli, silinmiş veya YouTube erişimi engellenmiş olabilir. Video bağlantılarını elle ekleyebilirsiniz.");
            }, 15000);
          },
          onStateChange: event => {
            if (cancelled) return;
            inspect(event.target);
            const data = event.target.getVideoData();
            if (data.video_id && event.data === 0) callbacks.current.onProgress(data.video_id, "islendi", data.title);
          },
          onError: () => { if (!cancelled) setError("Bu video veya playlist YouTube'da oynatılamıyor. Bağlantıyı YouTube'da açabilirsiniz."); },
        },
      });
    }).catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Oynatıcı yüklenemedi."); });
    return () => { cancelled = true; clearInterval(poll); clearTimeout(timeout); player?.destroy(); };
  }, [listId, videoId]);
  return <div className="space-y-2"><div ref={host} className="youtube-player aspect-video w-full overflow-hidden rounded-lg bg-secondary" />{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</div>;
}
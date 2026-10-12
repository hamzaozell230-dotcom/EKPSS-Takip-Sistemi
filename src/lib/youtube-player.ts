export type YouTubePlayer = {
  destroy(): void;
  getPlaylist(): string[] | undefined;
  getVideoData(): { video_id?: string; title?: string };
  getPlayerState(): number;
};
type Options = {
  width?: string; height?: string;
  videoId?: string | undefined;
  playerVars: Record<string, string | number>;
  events: { onReady: (event: { target: YouTubePlayer }) => void; onStateChange: (event: { target: YouTubePlayer; data: number }) => void; onError: (event: { data: number }) => void };
};
declare global { interface Window { YT?: { Player: new (element: HTMLElement, options: Options) => YouTubePlayer } } }
let loading: Promise<NonNullable<Window["YT"]>> | undefined;
export function loadYouTubePlayer() {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    if (window.YT?.Player) { resolve(window.YT); return; }
    let elapsed = 0;
    const poll = window.setInterval(() => {
      elapsed += 100;
      if (window.YT?.Player) { clearInterval(poll); resolve(window.YT); }
      else if (elapsed > 20000) { clearInterval(poll); loading = undefined; reject(new Error("YouTube oynatıcısı yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.")); }
    }, 100);
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => { clearInterval(poll); loading = undefined; reject(new Error("YouTube bağlantısı kurulamadı.")); };
      document.head.appendChild(script);
    }
  });
  return loading;
}
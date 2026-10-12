export const navigationItems = [
  { to: "/", label: "Özet" },
  { to: "/genel", label: "Genel Deneme" },
  { to: "/brans", label: "Branş Deneme" },
  { to: "/konular", label: "Konular" },
  { to: "/playlist", label: "Playlist" },
  { to: "/soru-bankam", label: "Soru Bankam" },
  { to: "/pomodoro", label: "Pomodoro" },
  { to: "/yapay-zeka", label: "Yapay Zeka" },
  { to: "/hakkinda", label: "Hakkında" },
] as const;

export function swipeDestination(path: string, dx: number, dy: number, elapsed: number) {
  if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5 || elapsed > 700) return;
  const index = navigationItems.findIndex((item) => item.to === path);
  if (index < 0) return;
  return navigationItems[index + (dx < 0 ? 1 : -1)]?.to;
}
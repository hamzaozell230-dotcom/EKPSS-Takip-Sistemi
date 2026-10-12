import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { navigationItems } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

export function Nav() {
  const { pathname } = useLocation();
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = tabs.current?.querySelector<HTMLElement>("[aria-current='page']");
    if (!active || !tabs.current) return;
    const container = tabs.current;
    container.scrollTo({ left: active.offsetLeft - container.offsetLeft - (container.clientWidth - active.clientWidth) / 2, behavior: "auto" });
  }, [pathname]);
  return (
    <header className="nav-glass sticky top-0 z-50">
      <nav aria-label="Ana menü" className="mx-auto max-w-6xl px-4 pt-3">
        <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-bold text-primary">EKPSS Takip Sistemi</Link>
        <div ref={tabs} className="nav-tabs relative mt-2 flex min-w-0 gap-1 overflow-x-auto pb-2">
          {navigationItems.map((i) => (
            <Button key={i.to} asChild variant="ghost" className={`shrink-0 text-sm ${pathname === i.to ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
              <Link to={i.to} activeOptions={{ exact: true }} aria-current={pathname === i.to ? "page" : undefined}>{i.label}</Link>
            </Button>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function Page({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold">{title}</h1>
      {sub && <p className="mt-2 text-muted-foreground">{sub}</p>}
      <div className="mt-8">{children}</div>
    </main>
  );
}

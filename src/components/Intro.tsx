import { useEffect, useState } from "react";
import { brandIconUrl } from "@/lib/brand";

export function Intro({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(!sessionStorage.getItem("intro-seen-v2")); }
    catch { setShow(true); }
  }, []);

  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!show) return;
    const t1 = setTimeout(() => setFade(true), 1400);
    const t2 = setTimeout(() => {
      try { sessionStorage.setItem("intro-seen-v2", "1"); } catch { /* Storage may be unavailable. */ }
      setShow(false);
    }, 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [show]);

  return (
    <>
    <div inert={show || undefined}>{children}</div>
    {show && (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"}`}
    >
      <img
        src={brandIconUrl()}
        alt="EKPSS Takip"
        width={240}
        height={240}
        className="h-60 w-60 rounded-lg"
      />
      <p className="mt-6 font-display text-2xl font-bold">
        <span className="text-primary">EKPSS</span>Takip
      </p>
      <p className="mt-1 text-sm text-muted-foreground">Hoş geldin EKPSS yolcusu</p>
    </div>
    )}
    </>
  );
}

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-24 right-5 z-30 grid h-11 w-11 place-items-center rounded-full bg-foreground text-background shadow-lg transition hover:scale-110 sm:bottom-5 sm:right-24"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

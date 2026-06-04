import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, Globe, MessageCircle, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useWhatsAppOrderModal } from "./WhatsAppOrderModal";
import { useCart } from "@/lib/cart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import logoHeader from "@/assets/logo-header.png";

const links = [
  { to: "/", label: "Home", sw: "Nyumbani" },
  { to: "/shop", label: "Menu", sw: "Menyu" },
  { to: "/pricing", label: "Pricing", sw: "Bei" },
  { to: "/about", label: "About", sw: "Kuhusu" },
  { to: "/blog", label: "Blog", sw: "Blogu" },
  { to: "/faq", label: "FAQ", sw: "Maswali" },
  { to: "/contact", label: "Contact", sw: "Wasiliana" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [sw, setSw] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { open: openWA } = useWhatsAppOrderModal();
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-card/90 backdrop-blur transition-shadow ${
        scrolled ? "shadow-[var(--shadow-warm)]" : ""
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3 md:h-20 md:gap-4">
        {/* Mobile: hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-foreground hover:bg-secondary md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col">
            <SheetHeader className="border-b border-border p-4 text-left">
              <SheetTitle className="flex items-center gap-2.5">
                <img src={logoHeader} alt="Mwanainchi" className="h-10 w-10 object-contain" />
                <div className="leading-tight">
                  <div className="font-display text-base font-bold text-foreground">
                    Mwanainchi
                  </div>
                  <div className="font-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Butchery &amp; Fast Food
                  </div>
                </div>
              </SheetTitle>
            </SheetHeader>

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {links.map((l) => {
                const active = path === l.to;
                return (
                  <SheetClose asChild key={l.to}>
                    <Link
                      to={l.to}
                      className={`block rounded-md px-3 py-3 font-heading text-base font-medium transition-colors ${
                        active
                          ? "bg-secondary text-primary"
                          : "text-foreground/85 hover:bg-secondary"
                      }`}
                    >
                      {sw ? l.sw : l.label}
                    </Link>
                  </SheetClose>
                );
              })}

              <div className="my-3 h-px bg-border" />

              <button
                onClick={() => setSw((v) => !v)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-left font-heading text-sm font-medium text-foreground/85 hover:bg-secondary"
              >
                <Globe className="h-4 w-4" />
                Language: {sw ? "Swahili" : "English"}
              </button>
            </nav>

            <div className="border-t border-border p-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openWA();
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--whatsapp)] font-heading text-sm font-semibold text-white"
              >
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </button>
              <SheetClose asChild>
                <Link
                  to="/shop"
                  className="flex h-11 w-full items-center justify-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground"
                >
                  {sw ? "Agiza Sasa" : "Order Now"}
                </Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src={logoHeader}
            alt="Mwanainchi Butchery"
            className="h-10 w-10 md:h-14 md:w-14 object-contain"
          />
          <div className="leading-tight">
            <div className="font-display text-sm font-bold text-foreground md:text-lg">
              Mwanainchi
            </div>
            <div className="hidden font-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
              Butchery &amp; Fast Food
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 overflow-x-auto whitespace-nowrap md:flex [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`font-heading text-sm font-medium transition-colors hover:text-primary ${
                  active ? "text-primary" : "text-foreground/80"
                }`}
              >
                {sw ? l.sw : l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSw((v) => !v)}
            aria-label="Toggle language"
            className="hidden h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground/80 hover:bg-secondary md:inline-flex"
          >
            <Globe className="h-3.5 w-3.5" /> {sw ? "SW" : "EN"}
          </button>
          <Link
            to="/checkout"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/70"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4 md:h-[18px] md:w-[18px]" />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {count}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => openWA()}
            className="hidden h-10 items-center gap-1.5 rounded-full bg-[var(--whatsapp)] px-4 font-heading text-sm font-semibold text-white hover:opacity-95 md:inline-flex"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>
          <Link
            to="/shop"
            className="hidden h-10 items-center rounded-full bg-primary px-5 font-heading text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] hover:bg-primary/90 md:inline-flex"
          >
            {sw ? "Agiza Sasa" : "Order Now"}
          </Link>
        </div>
      </div>
    </header>
  );
}

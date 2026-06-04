import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MessageCircle, Phone, MapPin, Clock } from "lucide-react";
import logoFooter from "@/assets/logo-footer.png";

export function SiteFooter() {
  return (
    <footer className="bg-mahogany text-mahogany-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src={logoFooter} alt="Mwanainchi Butchery" className="h-14 w-14 object-contain rounded-full bg-white/5 p-1" />
            <div>
              <div className="font-display text-lg font-bold">Mwanainchi</div>
              <div className="font-accent text-[10px] uppercase tracking-[0.2em] opacity-70">Butchery</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm opacity-80">Fresh. Fair. Always. Nairobi's friendliest neighbourhood butcher — delivered.</p>
          <div className="mt-5 flex gap-3">
            {[
              { Icon: Facebook, href: "https://facebook.com/mwanainchi", label: "Facebook" },
              { Icon: Instagram, href: "https://instagram.com/mwanainchi", label: "Instagram" },
              { Icon: MessageCircle, href: "https://wa.me/254748471264", label: "WhatsApp" },
            ].map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider opacity-70">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[["/shop", "All Products"], ["/pricing", "Price List"], ["/order-tracker", "Track Order"], ["/checkout", "Checkout"]].map(([to, label]) => (
              <li key={to}><Link to={to} className="opacity-90 hover:opacity-100 hover:text-accent">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider opacity-70">Company</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[["/about", "Our Story"], ["/blog", "Blog"], ["/careers", "Careers"], ["/privacy", "Privacy & Terms"]].map(([to, label]) => (
              <li key={to}><Link to={to} className="opacity-90 hover:opacity-100 hover:text-accent">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider opacity-70">Visit</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Eastern Bypass, Utawala, Nairobi</li>
            <li className="flex gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Mon–Sun · 7:00 AM – 9:00 PM</li>
            <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> +254 748 471 264</li>
            <li className="mt-2 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 font-accent text-xs uppercase tracking-wider">
              M-Pesa Till <span className="font-bold text-warning">4484494</span> · Buy Goods

            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs opacity-70 md:flex-row">
          <span>© {new Date().getFullYear()} Mwanainchi Butchery. All rights reserved.</span>
          <span>Built with love in Nairobi 🇰🇪</span>
        </div>
      </div>
    </footer>
  );
}

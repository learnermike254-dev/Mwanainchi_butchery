import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/products";

type Prefill = { item?: string; category?: string };

type Ctx = { open: (prefill?: Prefill) => void; close: () => void };
const WAModalCtx = createContext<Ctx | null>(null);

export function useWhatsAppOrderModal() {
  const ctx = useContext(WAModalCtx);
  if (!ctx) throw new Error("useWhatsAppOrderModal must be used within WhatsAppOrderModalProvider");
  return ctx;
}

const CATEGORIES = ["Beef", "Chicken", "Goat", "Pork", "Fast food item", "Other"];

export function WhatsAppOrderModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<Prefill>({});
  const [toast, setToast] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    category: "Beef",
    qty: "",
    prep: "",
    delivery: "Deliver to my address",
    address: "",
  });

  const open = useCallback((p?: Prefill) => {
    if (p?.item) setForm((f) => ({ ...f, prep: f.prep || "" , qty: f.qty || "1" }));
    if (p?.category) setForm((f) => ({ ...f, category: p.category! }));
    setPrefill(p ?? {});
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = [
      "Hi Mwaninchi! I'd like to place an order.",
      "",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      prefill.item ? `Item: ${prefill.item}` : `Category: ${form.category}`,
      `Qty: ${form.qty}`,
      form.prep ? `Prep: ${form.prep}` : "",
      `Mode: ${form.delivery === "Deliver to my address" ? `Deliver to ${form.address}` : "Pickup in-store"}`,
    ].filter(Boolean);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  };

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <WAModalCtx.Provider value={{ open, close }}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 md:items-center md:p-4"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-t-2xl bg-card shadow-xl md:rounded-2xl"
          >
            {/* WhatsApp-green header */}
            <div className="flex items-center gap-3 bg-[#128C7E] px-5 py-4 text-white">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-display text-base font-bold leading-tight">Mwanainchi Butchery</div>
                <div className="text-xs opacity-90">We reply within 5 minutes</div>
              </div>
              <button onClick={close} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-white/25">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-3 overflow-y-auto p-5">
              {prefill.item && (
                <div className="rounded-lg border border-[var(--whatsapp)]/30 bg-[var(--whatsapp)]/10 px-3 py-2 text-sm">
                  Ordering: <strong>{prefill.item}</strong>
                </div>
              )}

              <Field label="Full name">
                <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Jane Wanjiku" />
              </Field>

              <Field label="Phone number">
                <input required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder="07XX XXX XXX" />
              </Field>

              <Field label="Category">
                <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Quantity / weight">
                <input required value={form.qty} onChange={(e) => set("qty", e.target.value)} className={inputCls} placeholder='e.g. "2kg" or "3 portions"' />
              </Field>

              <Field label="Preparation instructions">
                <textarea rows={3} value={form.prep} onChange={(e) => set("prep", e.target.value)} className={inputCls} placeholder="e.g. Cut into stew pieces, marinated with pilipili hoho and garlic, ready to cook…" />
              </Field>

              <Field label="Delivery or pickup">
                <select value={form.delivery} onChange={(e) => set("delivery", e.target.value)} className={inputCls}>
                  <option>Deliver to my address</option>
                  <option>I'll pick up in-store</option>
                </select>
              </Field>

              {form.delivery === "Deliver to my address" && (
                <Field label="Delivery address">
                  <input required value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} placeholder="Estate, road, house no., landmark" />
                </Field>
              )}

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--whatsapp)] py-3.5 font-heading text-sm font-semibold text-white hover:opacity-95"
              >
                <MessageCircle className="h-4 w-4" /> Send order on WhatsApp
              </button>
              <p className="text-center text-[11px] text-muted-foreground">
                Opens WhatsApp with your details pre-filled. No payment needed yet.
              </p>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg">
          Opening WhatsApp — your order details are pre-filled.
        </div>
      )}
    </WAModalCtx.Provider>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-heading text-xs font-semibold uppercase tracking-wider text-foreground/70">{label}</span>
      {children}
    </label>
  );
}

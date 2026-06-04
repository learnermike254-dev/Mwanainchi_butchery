import { useState } from "react";
import { Plus, MessageCircle, Check } from "lucide-react";
import { type Product, formatKES } from "@/lib/products";
import { useWhatsAppOrderModal } from "./WhatsAppOrderModal";
import { useCart, calcMeatPrice, WEIGHT_OPTIONS } from "@/lib/cart";

const badgeStyles: Record<string, string> = {
  "Best Seller": "bg-warning text-warning-foreground",
  "Chef's Pick": "bg-destructive text-destructive-foreground",
  "New": "bg-success text-success-foreground",
  "Low Stock": "bg-accent text-accent-foreground",
  "Fresh Today": "bg-success text-success-foreground",
  "Hot": "bg-destructive text-destructive-foreground",
};

const borderByCategory: Record<string, string> = {
  beef: "border-l-[6px] border-l-[#C0392B]",
  chicken: "border-l-[6px] border-l-[#F39C12]",
  mutton: "border-l-[6px] border-l-[#8B4513]",
  pork: "border-l-[6px] border-l-[#8B4513]",
  sausages: "border-l-[6px] border-l-[#C0392B]",
  burgers: "border-l-[6px] border-l-[#1A1A1A]",
  grills: "border-l-[6px] border-l-[#1A1A1A]",
  sides: "border-l-[6px] border-l-[#1A1A1A]",
  drinks: "border-l-[6px] border-l-[#1A1A1A]",
};

export function ProductCard({ product }: { product: Product }) {
  const isFastFood = product.kind === "fastfood";
  const { open } = useWhatsAppOrderModal();
  const { add } = useCart();
  const [weight, setWeight] = useState<number>(isFastFood ? 1 : 1);
  const [added, setAdded] = useState(false);

  const isCutBased = Array.isArray(product.cuts) && product.cuts.length > 0;
  const [selectedCutIndex, setSelectedCutIndex] = useState(0);
  const selectedCut = isCutBased ? product.cuts![selectedCutIndex] : null;

  const price = isCutBased
    ? (selectedCut?.price ?? 0)
    : isFastFood
    ? product.pricePerKg
    : calcMeatPrice(product.pricePerKg, weight);

  const onAdd = () => {
    add({
      productId: product.id,
      name: isCutBased
        ? `${product.name} — ${selectedCut!.label}`
        : isFastFood
        ? product.name
        : `${product.name} (${weight * 1000}g)`,
      image: product.image,
      unitPrice: price,
      quantity: 1,
      weightKg: (!isCutBased && !isFastFood) ? weight : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${
        borderByCategory[product.category] ?? ""
      }`}
    >
      <div className="relative block aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 font-accent text-[10px] font-semibold uppercase tracking-wider ${badgeStyles[product.badge]}`}
          >
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight text-foreground">
            {product.name}
          </h3>
          <p className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">
            {product.swahili}
          </p>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.blurb}</p>

        {isCutBased ? (
          /* ── Cut selector (chicken & fish) ── */
          <div className="grid grid-cols-2 gap-1.5">
            {product.cuts!.map((cut, i) => {
              const on = i === selectedCutIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedCutIndex(i)}
                  className={`rounded-lg border px-2 py-1.5 text-center transition ${
                    on
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground/80 hover:border-primary/50"
                  }`}
                >
                  <div className="font-accent text-[10px] font-semibold uppercase tracking-wider leading-tight">
                    {cut.label}
                  </div>
                  <div className="font-accent text-[9px] text-muted-foreground leading-tight">
                    {cut.swahili}
                  </div>
                  <div className="font-heading text-xs font-bold mt-0.5">
                    {formatKES(cut.price)}
                  </div>
                </button>
              );
            })}
          </div>
        ) : !isFastFood ? (
          /* ── Weight selector (beef, goat, pork) ── */
          <div className="grid grid-cols-4 gap-1.5">
            {WEIGHT_OPTIONS.map((w) => {
              const on = w === weight;
              const p = calcMeatPrice(product.pricePerKg, w);
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeight(w)}
                  className={`rounded-lg border px-1 py-1.5 text-center transition ${
                    on
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground/80 hover:border-primary/50"
                  }`}
                >
                  <div className="font-accent text-[10px] font-semibold uppercase tracking-wider">
                    {w * 1000}g
                  </div>
                  <div className="font-heading text-xs font-bold">
                    {formatKES(p)}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* ── Flat price pill (fast food) ── */
          <div className="rounded-lg bg-secondary px-3 py-2 text-center">
            <span className="font-display text-xl font-bold text-primary">
              {formatKES(price)}
            </span>
            <span className="ml-1 font-accent text-[10px] uppercase tracking-wider text-muted-foreground">
              per {product.unit}
            </span>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={onAdd}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-4 font-heading text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {added ? (
              <>
                <Check className="h-4 w-4" /> Added!
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Order Now · {formatKES(price)}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() =>
              open({
                item: isCutBased
                  ? `${product.name} — ${selectedCut!.label}`
                  : isFastFood
                  ? product.name
                  : `${product.name} (${weight * 1000}g)`,
                category: isFastFood ? "Fast food item" : undefined,
              })
            }
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[var(--whatsapp)]/30 bg-[var(--whatsapp)]/10 px-4 font-heading text-sm font-semibold text-[var(--whatsapp)] transition hover:bg-[var(--whatsapp)]/20"
          >
            <MessageCircle className="h-4 w-4" /> Order via WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
}

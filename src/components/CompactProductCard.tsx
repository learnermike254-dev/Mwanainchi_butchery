import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { type Product, priceDisplay, formatKES } from "@/lib/products";
import { useCart, calcMeatPrice, WEIGHT_OPTIONS } from "@/lib/cart";
import { useWhatsAppOrderModal } from "./WhatsAppOrderModal";

const WEIGHT_LABELS: Record<string, string> = {
  "0.25": "¼ Kg",
  "0.5": "½ Kg",
  "0.75": "¾ Kg",
  "1": "1 Kg",
};

export function CompactProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { open } = useWhatsAppOrderModal();
  const [added, setAdded] = useState(false);
  const isFastFood = product.kind === "fastfood";
  const askForPrice = product.pricePerKg === 0;
  const [weight, setWeight] = useState<number>(1);

  const flash = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const onAdd = () => {
    if (askForPrice) {
      open({ item: isFastFood ? product.name : `${product.name} (${WEIGHT_LABELS[String(weight)]})` });
      return;
    }
    if (isFastFood) {
      add({
        productId: product.id,
        name: product.name,
        image: product.image,
        unitPrice: product.pricePerKg,
        quantity: 1,
      });
    } else {
      add({
        productId: product.id,
        name: `${product.name} (${WEIGHT_LABELS[String(weight)]})`,
        image: product.image,
        unitPrice: calcMeatPrice(product.pricePerKg, weight),
        quantity: 1,
        weightKg: weight,
      });
    }
    flash();
  };

  const displayPrice = isFastFood
    ? priceDisplay(product)
    : askForPrice
      ? "Ask price"
      : formatKES(calcMeatPrice(product.pricePerKg, weight));

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-[2px] hover:shadow-[var(--shadow-warm)]">
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 font-accent text-[9px] font-semibold uppercase tracking-wider text-primary-foreground">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-h-[2.4rem]">
          <h3 className="line-clamp-2 font-heading text-sm font-bold leading-tight text-foreground">
            {product.name}
          </h3>
          <p className="truncate font-accent text-[10px] uppercase tracking-wider text-muted-foreground">
            {product.swahili}
          </p>
        </div>

        {!isFastFood && !askForPrice && (
          <div className="grid grid-cols-4 gap-1">
            {WEIGHT_OPTIONS.map((w) => {
              const on = w === weight;
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeight(w)}
                  className={`rounded-md border px-0.5 py-1 text-center font-heading text-[10px] font-bold transition ${
                    on
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground/70 hover:border-primary/50"
                  }`}
                >
                  {WEIGHT_LABELS[String(w)]}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="font-display text-sm font-bold text-primary">{displayPrice}</span>
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add ${product.name} to cart`}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-3 font-heading text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {added ? <><Check className="h-3.5 w-3.5" /> Added</> : <><ShoppingCart className="h-3.5 w-3.5" /> Add</>}
          </button>
        </div>
      </div>
    </article>
  );
}

export { formatKES };

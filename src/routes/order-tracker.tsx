import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PageHero } from "@/components/PageHero";
import { Check, Loader2, Truck, ChefHat, MapPin, Package } from "lucide-react";
import { formatKES } from "@/lib/products";
import { lookupOrder } from "@/lib/orders.functions";

const searchSchema = z.object({ order: z.string().optional() });

export const Route = createFileRoute("/order-tracker")({
  head: () => ({ meta: [{ title: "Track Your Order — Mwanainchi" }] }),
  validateSearch: searchSchema,
  component: TrackerPage,
});

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const STAGES: { key: OrderStatus; Icon: any; label: string }[] = [
  { key: "confirmed", Icon: Check, label: "Confirmed" },
  { key: "preparing", Icon: ChefHat, label: "Preparing" },
  { key: "out_for_delivery", Icon: Truck, label: "Out for Delivery" },
  { key: "delivered", Icon: MapPin, label: "Delivered" },
];

const ORDER: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

function TrackerPage() {
  const { order } = useSearch({ from: "/order-tracker" });
  const lookup = useServerFn(lookupOrder);
  const [orderNumber, setOrderNumber] = useState(order ?? "");
  const [last4, setLast4] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) setOrderNumber(order);
  }, [order]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!orderNumber.trim()) return setError("Enter your order number");
    if (!/^\d{4}$/.test(last4)) return setError("Enter the last 4 digits of your phone");
    setLoading(true);
    try {
      const res = await lookup({
        data: { order_number: orderNumber.trim().toUpperCase(), phone_last4: last4 },
      });
      if (!res.ok) setError(res.error);
      else setResult(res.order);
    } catch (err: any) {
      setError(err.message ?? "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  const currentIndex = result ? ORDER.indexOf(result.status as OrderStatus) : -1;

  return (
    <>
      <PageHero
        eyebrow="Order tracker"
        title="Where's my order?"
        subtitle="Track your order using your order number and the last 4 digits of your phone. You'll also receive WhatsApp updates automatically."
      />
      <section className="section-y">
        <div className="container-page max-w-2xl">
          <form
            onSubmit={submit}
            className="grid gap-3 rounded-2xl border border-border bg-card p-3 sm:grid-cols-[1fr_140px_auto]"
          >
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="rounded-xl bg-secondary px-4 py-3 text-sm"
              placeholder="MWB-1042"
            />
            <input
              value={last4}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="rounded-xl bg-secondary px-4 py-3 text-sm"
              placeholder="Phone last 4"
              inputMode="numeric"
              maxLength={4}
            />
            <button
              disabled={loading}
              className="rounded-xl bg-primary px-5 font-heading text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {loading ? "Looking up…" : "Track"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          {result && (
            <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
                <div>
                  <div className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">
                    Order
                  </div>
                  <div className="font-display text-2xl font-bold">{result.order_number}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {result.customer_name} · {result.order_type}
                  </div>
                </div>
                <span className="rounded-full bg-warning px-3 py-1 font-accent text-[11px] font-semibold uppercase tracking-wider text-warning-foreground">
                  {String(result.status).replace(/_/g, " ")}
                </span>
              </div>

              {result.status === "cancelled" ? (
                <p className="mt-6 text-sm text-destructive">This order was cancelled.</p>
              ) : (
                <ol className="mt-6 space-y-5">
                  {STAGES.map((s, i) => {
                    const stageIndex = ORDER.indexOf(s.key);
                    const done = currentIndex > stageIndex;
                    const current = currentIndex === stageIndex;
                    return (
                      <li key={s.key} className="flex items-start gap-4">
                        <div
                          className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full ${done ? "bg-success text-success-foreground" : current ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                        >
                          {current ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <s.Icon className="h-4 w-4" />
                          )}
                          {i < STAGES.length - 1 && (
                            <span
                              className={`absolute left-1/2 top-full h-5 w-0.5 -translate-x-1/2 ${done ? "bg-success" : "bg-border"}`}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-heading text-base font-semibold">{s.label}</div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              <div className="mt-8 rounded-2xl bg-cream p-5">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-primary" />
                  <strong>{(result.items ?? []).length} item(s)</strong> · Total{" "}
                  {formatKES(result.total)}
                </div>
                {result.zone?.area && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Delivery zone: {result.zone.area}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

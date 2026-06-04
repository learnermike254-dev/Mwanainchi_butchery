import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ShoppingCart, Truck, Smartphone, MapPin, Store, Bike, X, Plus, Minus, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { formatKES } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { PaymentSelector, WHATSAPP_BIZ } from "@/components/PaymentMethods";
import { DeliveryLocationPicker, type DetectedLocation, type DeliveryZone } from "@/components/DeliveryLocationPicker";
import { useAuth } from "@/hooks/use-auth";
import { createOrder, makeOrderNumber } from "@/lib/orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Mwanainchi Butchery & Fast Food" }] }),
  component: CheckoutPage,
});

type OrderType = "pickup" | "delivery" | null;
type Step = "cart" | "type" | "details" | "payment" | "done";

function CheckoutPage() {
  const { items, setQty, remove, subtotal, clear } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("cart");
  const [type, setType] = useState<OrderType>(null);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [location, setLocation] = useState<DetectedLocation | null>(null);
  const [zone, setZone] = useState<DeliveryZone | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderNumber] = useState(() => makeOrderNumber());
  const [saveError, setSaveError] = useState<string | null>(null);

  const deliveryFee = type === "delivery" ? zone?.fee ?? 200 : 0;
  const total = subtotal + deliveryFee;

  const stepIndex = useMemo(
    () => ({ cart: 0, type: 1, details: 2, payment: 3, done: 4 })[step],
    [step],
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!customer.name.trim()) e.name = "Name is required";
    if (!/^(07|01)\d{8}$/.test(customer.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid Kenyan number (07/01…)";
    if (type === "delivery" && !location) e.location = "Please set your delivery location";
    setErrors(e);
    return !Object.keys(e).length;
  };

  return (
    <>
      <PageHero eyebrow="Checkout" title="Almost there." />

      <section className="section-y">
        <div className="container-page max-w-3xl">
          {/* Stepper */}
          <ol className="mb-10 flex items-center justify-between">
            {[
              { n: 1, label: "Cart", Icon: ShoppingCart },
              { n: 2, label: "Type", Icon: Truck },
              { n: 3, label: "Details", Icon: MapPin },
              { n: 4, label: "Payment", Icon: Smartphone },
            ].map((s, i, arr) => {
              const done = stepIndex > i;
              const active = stepIndex === i;
              return (
                <li key={s.n} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-full font-heading text-sm font-bold transition ${
                        done
                          ? "bg-success text-success-foreground"
                          : active
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : s.n}
                    </div>
                    <span
                      className={`mt-2 font-accent text-[10px] uppercase tracking-wider ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`mx-2 h-0.5 flex-1 ${stepIndex > i ? "bg-success" : "bg-border"}`} />
                  )}
                </li>
              );
            })}
          </ol>

          {/* STEP 1: CART */}
          {step === "cart" && (
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold">Review your cart</h2>
              {items.length === 0 ? (
                <div className="py-10 text-center">
                  <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Your cart is empty. Head to the menu to add items.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 font-heading text-sm font-semibold text-primary-foreground"
                  >
                    Browse Menu
                  </Link>
                </div>
              ) : (
                <>
                  <ul className="mt-5 divide-y divide-border">
                    {items.map((i) => (
                      <li key={i.id} className="flex items-center gap-3 py-4">
                        <img src={i.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="font-heading text-sm font-semibold truncate">{i.name}</div>
                          <div className="text-xs text-muted-foreground">{formatKES(i.unitPrice)} each</div>
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-full border border-border">
                          <button
                            onClick={() => setQty(i.id, i.quantity - 1)}
                            className="grid h-7 w-7 place-items-center"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 font-accent text-sm">{i.quantity}</span>
                          <button
                            onClick={() => setQty(i.id, i.quantity + 1)}
                            className="grid h-7 w-7 place-items-center"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="w-20 text-right font-display text-base font-bold">
                          {formatKES(i.unitPrice * i.quantity)}
                        </div>
                        <button
                          onClick={() => remove(i.id)}
                          aria-label="Remove"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex justify-between border-t border-border pt-4 font-display text-2xl font-bold">
                    <span>Subtotal</span>
                    <span>{formatKES(subtotal)}</span>
                  </div>
                  <button
                    onClick={() => setStep("type")}
                    className="mt-6 h-12 w-full rounded-full bg-primary font-heading font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Continue →
                  </button>
                </>
              )}
            </div>
          )}

          {/* STEP 2: ORDER TYPE */}
          {step === "type" && (
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold">How would you like to receive your order?</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  {
                    id: "pickup" as const,
                    Icon: Store,
                    title: "Pick Up",
                    sub: "Order now, collect at our shop",
                    perks: [
                      "No delivery fee",
                      "Ready in 15–30 mins",
                      "Show receipt to collect",
                      "Skip the queue",
                    ],
                    color: "#F39C12",
                  },
                  {
                    id: "delivery" as const,
                    Icon: Bike,
                    title: "Delivery",
                    sub: "We bring it to your door",
                    perks: [
                      "Delivered hot & fresh",
                      "GPS location tracking",
                      "All payments accepted",
                      "Utawala & surrounding areas",
                    ],
                    color: "#C0392B",
                  },
                ].map((t) => {
                  const on = type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition ${
                        on ? "border-primary shadow-[var(--shadow-lift)]" : "border-border hover:border-primary/40"
                      }`}
                      style={{ borderLeftColor: on ? undefined : t.color, borderLeftWidth: on ? 2 : 6 }}
                    >
                      {on && (
                        <span className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                      <div className="grid h-12 w-12 place-items-center rounded-xl text-white" style={{ background: t.color }}>
                        <t.Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-3 font-display text-xl font-bold">{t.title}</h3>
                      <p className="text-sm text-muted-foreground">{t.sub}</p>
                      <ul className="mt-3 space-y-1 text-sm">
                        {t.perks.map((p) => (
                          <li key={p} className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-success" /> {p}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep("cart")}
                  className="h-12 flex-1 rounded-full border border-border font-heading font-semibold"
                >
                  Back
                </button>
                <button
                  disabled={!type}
                  onClick={() => setStep("details")}
                  className="h-12 flex-[2] rounded-full bg-primary font-heading font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Continue as {type === "pickup" ? "Pickup" : type === "delivery" ? "Delivery" : "…"} →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {step === "details" && (
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <button
                type="button"
                onClick={() => setStep("type")}
                className="text-sm font-semibold text-primary hover:underline"
              >
                ← Change order type
              </button>
              <h2 className="mt-2 font-display text-2xl font-bold">
                {type === "pickup" ? "🏪 Pickup Details" : "🚴 Delivery Details"}
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Full name" error={errors.name}>
                  <input
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="e.g. John Kamau"
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone number" error={errors.phone}>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="07XX XXX XXX"
                    className={inputCls}
                  />
                </Field>
              </div>

              {type === "delivery" && (
                <div className="mt-5">
                  <p className="mb-2 font-heading text-xs font-semibold uppercase tracking-wider text-foreground/70">
                    Delivery location
                  </p>
                  <DeliveryLocationPicker
                    onLocationSet={(l, z) => {
                      setLocation(l);
                      setZone(z);
                    }}
                  />
                  {errors.location && <p className="mt-1 text-xs text-destructive">{errors.location}</p>}
                </div>
              )}

              {type === "pickup" && (
                <div className="mt-5 rounded-2xl bg-secondary p-5">
                  <p className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <strong>Mwanainchi Butchery</strong>, Eastern Bypass, Utawala, Nairobi
                  </p>
                  <a
                    href="https://maps.google.com/?q=Utawala+Nairobi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    Get directions ↗
                  </a>
                  <p className="mt-3 text-sm">
                    ⏱️ Ready in {items.length <= 2 ? "10–15" : items.length <= 5 ? "15–25" : "25–35"} minutes
                  </p>
                  <p className="text-sm">🧾 Bring your payment receipt or WhatsApp confirmation</p>
                </div>
              )}

              <div className="mt-6 rounded-2xl bg-cream p-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatKES(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{type === "pickup" ? "Pickup" : `Delivery${zone ? ` · ${zone.area}` : ""}`}</span>
                  <span>{deliveryFee === 0 ? "FREE" : formatKES(deliveryFee)}</span>
                </div>
                <div className="mt-2 flex justify-between font-display text-xl font-bold">
                  <span>Total</span>
                  <span>{formatKES(total)}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep("type")}
                  className="h-12 flex-1 rounded-full border border-border font-heading font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (validate()) setStep("payment");
                  }}
                  className="h-12 flex-[2] rounded-full bg-primary font-heading font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Continue to payment →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT */}
          {step === "payment" && (
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="text-sm font-semibold text-primary hover:underline"
              >
                ← Back
              </button>

              {!user && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary p-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MessageCircle className="mt-0.5 h-4 w-4 text-primary" />
                    <span>
                      You'll receive WhatsApp updates about your order status. You can also{" "}
                      <Link
                        to="/order-tracker"
                        className="font-semibold text-primary hover:underline"
                      >
                        track your order anytime
                      </Link>
                      {" "}using your order number.
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-3">
                <PaymentSelector
                  amount={total}
                  orderId={orderNumber}
                  mode={type === "pickup" ? "pickup" : "delivery"}
                  onDone={async () => {
                    setSaveError(null);
                    try {
                      await createOrder({
                        order_number: orderNumber,
                        customer_name: customer.name,
                        customer_phone: customer.phone,
                        order_type: type === "pickup" ? "pickup" : "delivery",
                        location: location ?? null,
                        zone: zone ?? null,
                        items,
                        subtotal,
                        delivery_fee: deliveryFee,
                        total,
                      });
                    } catch (e: any) {
                      setSaveError(e.message ?? "Could not save your order, but payment is logged.");
                    }
                    setStep("done");
                    setTimeout(() => clear(), 800);
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION */}
          {step === "done" && (
            <>
              {saveError && (
                <p className="mb-4 text-sm text-destructive">{saveError}</p>
              )}
              {type === "pickup" ? (
                <PickupConfirmation
                  orderId={orderNumber}
                  total={total}
                  name={customer.name}
                  phone={customer.phone}
                />
              ) : (
                <DeliveryConfirmation
                  orderId={orderNumber}
                  total={total}
                  location={location}
                  zone={zone}
                  name={customer.name}
                  phone={customer.phone}
                />
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-heading text-xs font-semibold uppercase tracking-wider text-foreground/70">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function PickupConfirmation({
  orderId,
  total,
  name,
  phone,
}: {
  orderId: string;
  total: number;
  name: string;
  phone: string;
}) {
  const code = orderId;
  const msg = `✅ Mwanainchi Order Confirmed!\n\nCode: *${code}*\nName: ${name}\nTotal: ${formatKES(total)}\n\nShow this code or payment receipt to collect.`;
  const wa = `https://wa.me/${phone.replace(/^0/, "254").replace(/\s/g, "")}?text=${encodeURIComponent(msg)}`;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-center md:p-10">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success text-success-foreground">
        <Check className="h-10 w-10" />
      </div>
      <h3 className="mt-5 font-display text-3xl font-bold">Asante sana!</h3>
      <p className="mt-2 text-sm text-muted-foreground">Your pickup is confirmed.</p>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-primary bg-primary/5 p-6">
        <p className="font-accent text-xs uppercase tracking-widest text-muted-foreground">
          Your collection code
        </p>
        <p className="mt-2 font-display text-5xl font-bold tracking-wider text-primary">{code}</p>
        <p className="mt-2 text-xs text-muted-foreground">Show this at the counter to collect</p>
      </div>

      <p className="mt-4 text-sm">
        Total paid: <strong>{formatKES(total)}</strong>
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--whatsapp)] px-5 font-heading text-sm font-semibold text-white"
        >
          <MessageCircle className="h-4 w-4" /> Send to my WhatsApp
        </a>
        <a
          href="https://maps.google.com/?q=Utawala+Nairobi"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-5 font-heading text-sm font-semibold"
        >
          <MapPin className="h-4 w-4" /> Directions
        </a>
        <a
          href="tel:+254748471264"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-5 font-heading text-sm font-semibold"
        >
          <Phone className="h-4 w-4" /> Call us
        </a>
      </div>
    </div>
  );
}

function DeliveryConfirmation({
  orderId,
  total,
  location,
  zone,
}: {
  orderId: string;
  total: number;
  location: DetectedLocation | null;
  zone: DeliveryZone | null;
  name: string;
  phone: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-center md:p-10">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success text-success-foreground">
        <Bike className="h-10 w-10" />
      </div>
      <h3 className="mt-5 font-display text-3xl font-bold">Order #{orderId} is on its way!</h3>
      <p className="mt-2 text-sm">
        Total: <strong>{formatKES(total)}</strong>
      </p>

      {location && (
        <div className="mx-auto mt-5 max-w-md rounded-2xl bg-secondary p-4 text-left text-sm">
          <p>
            <MapPin className="mr-1 inline h-4 w-4 text-primary" />
            <strong>{location.address}</strong>
          </p>
          {zone && (
            <p className="mt-1 text-muted-foreground">
              Zone: {zone.area} · ETA {zone.mins}–{zone.mins + 15} mins
            </p>
          )}
          {location.mapsLink && (
            <a
              href={location.mapsLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
            >
              View on Google Maps ↗
            </a>
          )}
        </div>
      )}

      <p className="mt-5 text-sm text-muted-foreground">
        📲 Our rider will WhatsApp you when nearby.
      </p>
      <a
        href={`https://wa.me/${WHATSAPP_BIZ}?text=${encodeURIComponent(`Hi! Please track my order #${orderId}`)}`}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--whatsapp)] px-6 font-heading text-sm font-semibold text-white"
      >
        <MessageCircle className="h-4 w-4" /> Track Order on WhatsApp
      </a>
    </div>
  );
}

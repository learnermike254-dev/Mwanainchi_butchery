import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Smartphone, QrCode, Building2, Wallet, Loader2 } from "lucide-react";
import { formatKES } from "@/lib/products";

const TILL = "4484494";
const WHATSAPP_BIZ = "254748471264";

type PaymentProps = {
  amount: number;
  orderId: string;
  onDone: () => void;
};

type Method = { id: "stk" | "qr" | "till" | "cod"; icon: any; label: string; sub: string };

const METHODS: Method[] = [
  { id: "stk", icon: Smartphone, label: "STK Push", sub: "Prompt sent to your phone" },
  { id: "qr", icon: QrCode, label: "M-Pesa QR", sub: "Scan with M-Pesa app" },
  { id: "till", icon: Building2, label: "Till Number", sub: "Buy goods manually" },
  { id: "cod", icon: Wallet, label: "Cash on Delivery", sub: "Pay at your door" },
];

export function PaymentSelector({
  amount,
  orderId,
  onDone,
  mode,
}: PaymentProps & { mode: "pickup" | "delivery" }) {
  const [selected, setSelected] = useState<Method["id"] | null>(null);
  const methods = METHODS.filter((m) => (mode === "pickup" ? m.id !== "cod" : true));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold">How would you like to pay?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Total: <strong className="text-foreground">{formatKES(amount)}</strong>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {methods.map((m) => {
          const on = selected === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                on
                  ? "border-primary bg-primary/5 shadow-[var(--shadow-warm)]"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                  on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block font-heading text-sm font-semibold">{m.label}</span>
                <span className="block text-xs text-muted-foreground">{m.sub}</span>
              </span>
              {on && <Check className="h-5 w-5 text-primary" />}
            </button>
          );
        })}
      </div>

      <div>
        {selected === "stk" && <STKPush amount={amount} orderId={orderId} onDone={onDone} />}
        {selected === "qr" && <MpesaQR amount={amount} orderId={orderId} onDone={onDone} />}
        {selected === "till" && <TillPayment amount={amount} orderId={orderId} onDone={onDone} />}
        {selected === "cod" && <COD amount={amount} orderId={orderId} onDone={onDone} />}
      </div>
    </div>
  );
}

/* ---------- STK Push (simulated) ---------- */
function STKPush({ amount, onDone }: PaymentProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "pending" | "confirmed" | "failed">("idle");
  const [phone, setPhone] = useState("");

  const trigger = () => {
    if (!/^(07|01)\d{8}$/.test(phone.replace(/\s/g, ""))) {
      setStatus("failed");
      return;
    }
    setStatus("loading");
    setTimeout(() => setStatus("pending"), 900);
    setTimeout(() => {
      setStatus("confirmed");
      onDone();
    }, 4200);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {status === "idle" && (
        <>
          <p className="text-sm text-muted-foreground">
            Enter your M-Pesa number. We'll send a payment prompt to your phone.
          </p>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={10}
            placeholder="07XX XXX XXX"
            className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <p className="mt-3 text-sm">
            Amount: <strong>{formatKES(amount)}</strong>
          </p>
          <button
            type="button"
            onClick={trigger}
            className="mt-4 h-12 w-full rounded-full bg-[var(--mpesa)] font-heading text-sm font-semibold text-white hover:opacity-90"
          >
            <Smartphone className="-mt-0.5 mr-1.5 inline h-4 w-4" /> Send Payment Prompt
          </button>
        </>
      )}
      {status === "loading" && (
        <div className="py-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm">Sending prompt to your phone…</p>
        </div>
      )}
      {status === "pending" && (
        <div className="py-8 text-center">
          <div className="relative mx-auto h-20 w-20">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--mpesa)]/30" />
            <span className="absolute inset-0 grid place-items-center rounded-full bg-[var(--mpesa)] font-accent text-xs font-bold text-white">
              M-PESA
            </span>
          </div>
          <h3 className="mt-5 font-display text-xl font-bold">Check your phone</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your M-Pesa PIN to confirm <strong>{formatKES(amount)}</strong>
          </p>
        </div>
      )}
      {status === "confirmed" && (
        <div className="py-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success text-success-foreground">
            <Check className="h-8 w-8" />
          </div>
          <p className="mt-4 font-display text-xl font-bold">Payment Confirmed!</p>
          <p className="text-sm text-muted-foreground">Your order is being prepared.</p>
        </div>
      )}
      {status === "failed" && (
        <div className="py-6 text-center">
          <p className="text-sm text-destructive">❌ Payment failed. Please check the number.</p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-3 rounded-full border border-border px-4 py-2 text-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- M-Pesa QR ---------- */
function MpesaQR({ amount, orderId, onDone }: PaymentProps) {
  const [paid, setPaid] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const value = `BG|${TILL}|${amount}|MWANINCHI-${orderId}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
        <li>Open the M-Pesa app</li>
        <li>Tap "Lipa na M-Pesa"</li>
        <li>Tap "Scan QR Code"</li>
        <li>Confirm {formatKES(amount)}</li>
      </ol>
      <div ref={ref} className="mx-auto mt-5 w-fit rounded-2xl border-4 border-[#006633] bg-white p-4 text-center">
        <p className="mb-2 font-accent text-xs font-bold uppercase tracking-widest text-[#006633]">
          M-PESA
        </p>
        <QRCodeCanvas value={value} size={200} level="H" bgColor="#FFF" fgColor="#006633" />
        <p className="mt-2 text-xs">
          Till: <strong>{TILL}</strong> · {formatKES(amount)}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Ref: MWANINCHI-{orderId}
        </p>
      </div>
      {!paid ? (
        <button
          type="button"
          onClick={() => {
            setPaid(true);
            onDone();
          }}
          className="mt-5 h-12 w-full rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          I Have Paid ✓
        </button>
      ) : (
        <p className="mt-5 text-center text-sm text-success">
          ✅ Thank you! Ref <strong>MWANINCHI-{orderId}</strong>. We'll confirm and prepare your order.
        </p>
      )}
    </div>
  );
}

/* ---------- Till Number ---------- */
function TillPayment({ amount, orderId, onDone }: PaymentProps) {
  const [ref, setRef] = useState("");
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(TILL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const submit = () => {
    if (ref.trim().length < 8) return;
    setDone(true);
    onDone();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <ol className="ml-4 list-decimal space-y-1.5 text-sm text-muted-foreground">
        <li>Open M-Pesa → Lipa na M-Pesa → Buy Goods</li>
        <li className="flex flex-wrap items-center gap-2">
          Till:{" "}
          <strong className="font-display text-base text-foreground">{TILL}</strong>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs hover:bg-secondary"
          >
            <Copy className="h-3 w-3" /> {copied ? "Copied!" : "Copy"}
          </button>
        </li>
        <li>
          Amount: <strong className="text-foreground">{formatKES(amount)}</strong>
        </li>
        <li>Enter PIN and confirm</li>
        <li>Paste your M-Pesa code below</li>
      </ol>
      {!done ? (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={ref}
            onChange={(e) => setRef(e.target.value.toUpperCase())}
            maxLength={12}
            placeholder="e.g. QK7X3P2ABC"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm uppercase focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={ref.trim().length < 8}
            className="h-12 w-full rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Confirm Payment
          </button>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-success">
          ✅ Ref <strong>{ref}</strong> received. Verifying payment…
        </p>
      )}
    </div>
  );
}

/* ---------- Cash on Delivery ---------- */
function COD({ amount, orderId, onDone }: PaymentProps) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {!confirmed ? (
        <>
          <p className="text-sm">
            Have <strong>{formatKES(amount)}</strong> ready when your order arrives.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>✓ Order confirmed via WhatsApp before dispatch</li>
            <li>✓ Rider contacts you when nearby</li>
            <li>✓ Available across our delivery zones</li>
          </ul>
          <button
            type="button"
            onClick={() => {
              setConfirmed(true);
              onDone();
            }}
            className="mt-4 h-12 w-full rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Confirm Cash on Delivery
          </button>
        </>
      ) : (
        <p className="text-center text-sm text-success">
          ✅ Order #{orderId} confirmed. We'll WhatsApp you shortly. Have {formatKES(amount)} ready.
        </p>
      )}
    </div>
  );
}

export { WHATSAPP_BIZ };

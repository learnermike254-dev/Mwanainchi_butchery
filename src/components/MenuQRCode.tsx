import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, QrCode } from "lucide-react";

export function MenuQRCode() {
  const [url, setUrl] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrl(window.location.origin + "/shop");
  }, []);

  const download = () => {
    const canvas = ref.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "mwanainchi-menu-qr.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <section className="border-y border-border bg-cream">
      <div className="container-page section-y grid items-center gap-10 md:grid-cols-[auto_1fr]">
        <div
          ref={ref}
          className="mx-auto rounded-2xl bg-white p-5 shadow-[var(--shadow-warm)]"
        >
          {url && (
            <QRCodeCanvas
              value={url}
              size={180}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#1A1A1A"
              includeMargin
            />
          )}
        </div>
        <div className="text-center md:text-left">
          <p className="inline-flex items-center gap-2 font-accent text-xs uppercase tracking-[0.25em] text-accent">
            <QrCode className="h-4 w-4" /> Print · Share · Scan
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
            Scan to view our full menu
          </h2>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            Place this QR code at your table, in your shop, or on your flyer. Customers scan and order in seconds — no app needed.
          </p>
          <p className="mt-3 break-all font-accent text-xs uppercase tracking-wider text-muted-foreground">
            {url}
          </p>
          <button
            type="button"
            onClick={download}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-heading text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-4 w-4" /> Download QR for Print
          </button>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

export type DetectedLocation = {
  lat?: number;
  lng?: number;
  accuracy?: number;
  address: string;
  mapsLink?: string;
};

export type DeliveryZone = {
  area: string;
  lat: number;
  lng: number;
  r: number;
  mins: number;
  fee: number;
};

const ZONES: DeliveryZone[] = [
  { area: "Utawala", lat: -1.2833, lng: 36.95, r: 6, mins: 20, fee: 0 },
  { area: "Embakasi", lat: -1.3236, lng: 36.8946, r: 6, mins: 25, fee: 100 },
  { area: "Donholm", lat: -1.295, lng: 36.89, r: 5, mins: 30, fee: 150 },
  { area: "Eastern Bypass", lat: -1.265, lng: 36.95, r: 7, mins: 35, fee: 200 },
];

function haversine(a: number, b: number, c: number, d: number) {
  const R = 6371,
    dL = ((c - a) * Math.PI) / 180,
    dN = ((d - b) * Math.PI) / 180;
  const x =
    Math.sin(dL / 2) ** 2 +
    Math.cos((a * Math.PI) / 180) * Math.cos((c * Math.PI) / 180) * Math.sin(dN / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function DeliveryLocationPicker({
  onLocationSet,
}: {
  onLocationSet: (loc: DetectedLocation | null, zone: DeliveryZone | null) => void;
}) {
  const [status, setStatus] = useState<"idle" | "detecting" | "detected" | "denied" | "error" | "unsupported">(
    "idle",
  );
  const [loc, setLoc] = useState<DetectedLocation | null>(null);
  const [zone, setZone] = useState<DeliveryZone | null>(null);
  const [manual, setManual] = useState("");

  const detect = () => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    setStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          );
          const g = await r.json();
          address =
            [g.address?.road, g.address?.suburb, g.address?.city || g.address?.town]
              .filter(Boolean)
              .join(", ") || address;
        } catch {
          /* ignore */
        }
        const location: DetectedLocation = {
          lat,
          lng,
          accuracy: Math.round(accuracy),
          address,
          mapsLink: `https://www.google.com/maps?q=${lat},${lng}`,
        };
        setLoc(location);
        setStatus("detected");
        let matchedZone: DeliveryZone | null = null;
        let minDist = Infinity;
        for (const z of ZONES) {
          const d = haversine(lat, lng, z.lat, z.lng);
          if (d < minDist) {
            minDist = d;
            matchedZone = z;
          }
        }
        const finalZone: DeliveryZone | null =
          matchedZone !== null && minDist <= matchedZone.r ? matchedZone : null;
        setZone(finalZone);
        onLocationSet(location, finalZone);
      },
      (err) => setStatus(err.code === 1 ? "denied" : "error"),
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {status === "idle" && (
        <button
          type="button"
          onClick={detect}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-heading text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Navigation className="h-4 w-4" /> Auto-Detect My Location
        </button>
      )}
      {status === "detecting" && (
        <p className="inline-flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Detecting your location…
        </p>
      )}
      {status === "detected" && loc && (
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" /> <strong>{loc.address}</strong>
          </p>
          <p className="text-xs text-muted-foreground">Accuracy: ~{loc.accuracy}m</p>
          {loc.mapsLink && (
            <a
              href={loc.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View on Google Maps ↗
            </a>
          )}
          {zone ? (
            <div className="mt-2 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
              ✅ We deliver to <strong>{zone.area}</strong> — est.{" "}
              <strong>
                {zone.mins}–{zone.mins + 15} mins
              </strong>{" "}
              · Fee: <strong>{zone.fee === 0 ? "FREE" : `KES ${zone.fee}`}</strong>
            </div>
          ) : (
            <div className="mt-2 rounded-xl bg-warning/20 px-3 py-2 text-sm text-warning-foreground">
              ⚠️ Outside standard zones — we'll confirm fee on WhatsApp.
            </div>
          )}
        </div>
      )}
      {(status === "denied" || status === "error" || status === "unsupported") && (
        <p className="text-sm text-destructive">
          Could not detect location. Please type your address below.
        </p>
      )}

      <label className="mt-4 block">
        <span className="mb-1 block font-heading text-xs font-semibold uppercase tracking-wider text-foreground/70">
          Or type your address
        </span>
        <input
          type="text"
          value={manual}
          onChange={(e) => {
            setManual(e.target.value);
            onLocationSet({ address: e.target.value }, null);
          }}
          placeholder="e.g. Utawala, near Mihango stage"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
        />
      </label>
    </div>
  );
}

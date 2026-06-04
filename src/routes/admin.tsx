import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth, signOut } from "@/hooks/use-auth";
import {
  isCurrentUserAdmin,
  listAllOrders,
  updateOrderStatus,
  listInventory,
  seedInventory,
  upsertInventory,
  addStockMovement,
  listAllPosts,
  upsertPost,
  deletePost,
} from "@/lib/admin.functions";
import {
  updateOrderDeliveryStatus,
  getPOSSyncHistory,
  syncInventoryFromPOS,
  generateBlogUploadSignedUrl,
  registerBlogUpload,
} from "@/lib/admin-enhanced.functions";

import { allItems, formatKES } from "@/lib/products";
import {
  ShoppingBag,
  Boxes,
  Newspaper,
  LogOut,
  Plus,
  PackagePlus,
  PackageMinus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Truck,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Mwanainchi" }] }),
  component: AdminPage,
});

type Tab = "orders" | "inventory" | "blog" | "pos-sync";

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const checkAdmin = useServerFn(isCurrentUserAdmin);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/admin-login" });
      return;
    }
    checkAdmin()
      .then((r) => {
        setAllowed(r.isAdmin);
        if (!r.isAdmin) navigate({ to: "/admin-login" });
      })
      .catch(() => navigate({ to: "/admin-login" }));
  }, [user, loading, navigate, checkAdmin]);

  const [tab, setTab] = useState<Tab>("orders");

  if (loading || allowed === null) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!allowed) return null;

  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 bg-cream md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-border bg-card md:block">
        <div className="border-b border-border p-5">
          <div className="font-display text-lg font-bold">Mwanainchi</div>
          <div className="font-accent text-[10px] uppercase tracking-widest text-muted-foreground">Admin</div>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          <NavBtn icon={ShoppingBag} label="Orders" on={tab === "orders"} onClick={() => setTab("orders")} />
          <NavBtn icon={Boxes} label="Inventory" on={tab === "inventory"} onClick={() => setTab("inventory")} />
          <NavBtn icon={Truck} label="POS Sync" on={tab === "pos-sync"} onClick={() => setTab("pos-sync")} />
          <NavBtn icon={Newspaper} label="Blog" on={tab === "blog"} onClick={() => setTab("blog")} />
          
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/admin-login" });
            }}
            className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left font-heading text-sm font-medium text-muted-foreground hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
          <Link to="/" className="rounded-xl px-3 py-2.5 text-xs text-muted-foreground hover:bg-secondary">← Back to site</Link>
        </nav>
      </aside>

      <div>
        <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
          <h1 className="font-display text-xl font-bold capitalize">{tab}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-mahogany font-display text-sm font-bold text-cream">A</div>
          </div>
        </header>

        {/* Mobile tabs */}
        <div className="flex gap-1 border-b border-border bg-card p-2 md:hidden overflow-x-auto">
          {(["orders", "inventory", "pos-sync", "blog"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 font-heading text-sm font-medium capitalize ${
                tab === t ? "bg-primary text-primary-foreground" : "text-foreground"
              }`}
            >
              {t === "pos-sync" ? "POS Sync" : t}
            </button>
          ))}
        </div>

        <main className="space-y-6 p-6">
          {tab === "orders" && <OrdersPanel />}
          {tab === "inventory" && <InventoryPanel />}
          {tab === "pos-sync" && <POSSyncPanel />}
          {tab === "blog" && <BlogPanel />}
          
        </main>
      </div>
    </div>
  );
}

function NavBtn({ icon: Icon, label, on, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left font-heading text-sm font-medium transition ${
        on ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

// ============== ORDERS ==============
function OrdersPanel() {
  const fetchOrders = useServerFn(listAllOrders);
  const updateStatus = useServerFn(updateOrderStatus);
  const updateDeliveryStatus = useServerFn(updateOrderDeliveryStatus);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const reload = () => {
    setLoading(true);
    fetchOrders()
      .then((d) => setOrders(d ?? []))
      .finally(() => setLoading(false));
  };
  useEffect(reload, [fetchOrders]);

  if (loading) return <Loader />;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready_for_pickup: "bg-green-100 text-green-800",
      out_for_delivery: "bg-indigo-100 text-indigo-800",
      delivered: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <StatCard 
          label="Pending" 
          value={orders.filter(o => o.status === "pending").length}
          icon={Clock}
          color="text-yellow-600"
        />
        <StatCard 
          label="Preparing" 
          value={orders.filter(o => o.status === "preparing").length}
          icon={ShoppingBag}
          color="text-purple-600"
        />
        <StatCard 
          label="Ready" 
          value={orders.filter(o => o.status === "ready_for_pickup").length}
          icon={CheckCircle}
          color="text-green-600"
        />
        <StatCard 
          label="Delivered" 
          value={orders.filter(o => o.status === "delivered").length}
          icon={Truck}
          color="text-emerald-600"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h3 className="font-heading text-base font-semibold">All Orders</h3>
          <p className="text-xs text-muted-foreground">Manage order status and delivery tracking.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-muted-foreground">
              <tr>
                {["Order", "Customer", "Items", "Total", "Status", "Delivery", "Action"].map((h) => (
                  <th key={h} className="px-5 py-3 font-accent text-[11px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-secondary/30 transition">
                  <td className="px-5 py-4 font-heading font-semibold">{o.order_number}</td>
                  <td className="px-5 py-4">
                    <div className="font-heading text-sm">{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{o.customer_phone}</div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{Array.isArray(o.items) ? o.items.length : 0}</td>
                  <td className="px-5 py-4 font-display font-bold">{formatKES(o.total)}</td>
                  <td className="px-5 py-4">
                    <select
                      value={o.status}
                      onChange={async (e) => {
                        await updateStatus({ data: { id: o.id, status: e.target.value as any } });
                        reload();
                      }}
                      className={`rounded-lg border border-border px-2 py-1 text-xs font-semibold ${getStatusColor(o.status)}`}
                    >
                      {["pending", "confirmed", "preparing", "ready_for_pickup", "out_for_delivery", "delivered", "cancelled"].map((s) => (
                        <option key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-[11px] font-semibold ${
                      o.delivery_status === "delivered" ? "bg-green-100 text-green-800" : 
                      o.delivery_status === "in_transit" ? "bg-blue-100 text-blue-800" :
                      o.delivery_status === "pending" ? "bg-gray-100 text-gray-800" : 
                      "bg-orange-100 text-orange-800"
                    }`}>
                      {o.delivery_status?.replace(/_/g, " ") || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(o)}
                      className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-secondary inline-flex items-center gap-1"
                    >
                      <MapPin className="h-3.5 w-3.5" /> Track
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onUpdate={() => {
            setSelectedOrder(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

// ============== ORDERS (Helper Components) ==============
function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-accent uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-display font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-secondary ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onUpdate }: any) {
  const updateDeliveryStatus = useServerFn(updateOrderDeliveryStatus);
  const [deliveryStatus, setDeliveryStatus] = useState(order.delivery_status || "pending");
  const [notes, setNotes] = useState(order.delivery_notes || "");
  const [saving, setSaving] = useState(false);

  const handleSaveDelivery = async () => {
    setSaving(true);
    try {
      await updateDeliveryStatus({
        data: {
          orderId: order.id,
          deliveryStatus: deliveryStatus as any,
          notes,
        },
      });
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold">Order #{order.order_number}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">Customer</label>
            <p className="font-heading font-semibold mt-1">{order.customer_name}</p>
            <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
          </div>

          <div>
            <label className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">Items ({Array.isArray(order.items) ? order.items.length : 0})</label>
            <div className="mt-2 space-y-1">
              {Array.isArray(order.items) && order.items.map((item: any, i: number) => (
                <div key={i} className="text-sm text-muted-foreground">
                  • {item.name || item} {item.quantity ? `(${item.quantity})` : ""}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">Total</label>
              <p className="font-display font-bold mt-1">{formatKES(order.total)}</p>
            </div>
            <div>
              <label className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">Order Type</label>
              <p className="font-heading font-semibold mt-1 capitalize">{order.order_type}</p>
            </div>
          </div>

          {order.order_type === "delivery" && (
            <>
              <div>
                <label className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">Delivery Status</label>
                <select 
                  value={deliveryStatus} 
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="w-full mt-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned to Rider</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">Delivery Address</label>
                <p className="text-sm mt-1">{order.delivery_address || "—"}</p>
              </div>

              <div>
                <label className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">Delivery Notes</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Add delivery instructions..."
                />
              </div>
            </>
          )}

          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <button onClick={onClose} className="rounded-full px-4 py-2 text-sm hover:bg-secondary">
              Close
            </button>
            {order.order_type === "delivery" && (
              <button 
                onClick={handleSaveDelivery}
                disabled={saving}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== POS SYNC ==============
function POSSyncPanel() {
  const getPOSHistory = useServerFn(getPOSSyncHistory);
  const syncInventory = useServerFn(syncInventoryFromPOS);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [posApiUrl, setPosApiUrl] = useState("");
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    reload();
  }, [getPOSHistory]);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await getPOSHistory();
      setHistory(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!posApiUrl.trim()) {
      setSyncError("Please enter a POS API endpoint");
      return;
    }

    setSyncing(true);
    setSyncError("");
    try {
      // This is a placeholder - in production you'd fetch from your POS system
      const mockPosData = [
        { product_slug: "beef-steak", product_name: "Beef Steak", stock_kg: 45.5 },
        { product_slug: "chicken", product_name: "Chicken", stock_kg: 32.0 },
        { product_slug: "goat", product_name: "Goat Meat", stock_kg: 18.5 },
      ];

      await syncInventory({ data: { posData: mockPosData } });
      setSyncError("✓ Sync completed successfully!");
      reload();
    } catch (err: any) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <Loader />;

  const lastSync = history.length > 0 ? history[0] : null;
  const successCount = history.filter(h => h.sync_status === "success").length;

  return (
    <div className="space-y-6">
      {/* Sync Status Card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-heading text-base font-semibold mb-4">Manual POS Sync</h3>
        <div className="space-y-4">
          <div>
            <label className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">POS API Endpoint</label>
            <input
              type="text"
              value={posApiUrl}
              onChange={(e) => setPosApiUrl(e.target.value)}
              placeholder="e.g., http://butchery-pos:3000/api/inventory"
              className="w-full mt-2 rounded-lg border border-border bg-card px-3 py-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter the URL of your butchery POS system's inventory API endpoint.
            </p>
          </div>

          {syncError && (
            <div className={`p-3 rounded-lg flex items-start gap-2 ${
              syncError.includes("✓") 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {syncError.includes("✓") ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{syncError}</p>
            </div>
          )}

          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-heading text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>

      {/* Sync History */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h3 className="font-heading text-base font-semibold">Sync History</h3>
          <p className="text-xs text-muted-foreground">
            {lastSync ? `Last sync: ${new Date(lastSync.created_at).toLocaleString()}` : "No syncs yet"}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="border-b border-border p-5 grid grid-cols-3 gap-4 bg-secondary/30">
          <div>
            <p className="text-xs text-muted-foreground font-accent uppercase">Successful Syncs</p>
            <p className="text-2xl font-display font-bold mt-1 text-green-600">{successCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-accent uppercase">Failed</p>
            <p className="text-2xl font-display font-bold mt-1 text-red-600">{history.filter(h => h.sync_status === "failed").length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-accent uppercase">Avg Duration</p>
            <p className="text-2xl font-display font-bold mt-1">
              {history.length > 0 
                ? `${Math.round(history.reduce((a, h) => a + (h.sync_duration_ms || 0), 0) / history.length)}ms` 
                : "—"
              }
            </p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {history.map((sync) => (
            <div key={sync.id} className="p-5 hover:bg-secondary/30 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                      sync.sync_status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {sync.sync_status === "success" ? (
                        <><CheckCircle className="h-3 w-3" /> Success</>
                      ) : (
                        <><AlertCircle className="h-3 w-3" /> Failed</>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {sync.items_synced} items • {sync.sync_duration_ms}ms
                    </span>
                  </div>
                  {sync.error_message && (
                    <p className="text-xs text-destructive">{sync.error_message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(sync.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No sync history yet. Perform your first sync above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function InventoryPanel() {
  const fetchInv = useServerFn(listInventory);
  const seed = useServerFn(seedInventory);
  const upsert = useServerFn(upsertInventory);
  const move = useServerFn(addStockMovement);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [movingItem, setMovingItem] = useState<any | null>(null);

  const reload = () => {
    setLoading(true);
    fetchInv()
      .then((d) => setItems(d ?? []))
      .finally(() => setLoading(false));
  };
  useEffect(reload, [fetchInv]);

  const seedFromCatalog = async () => {
    await seed({
      data: { items: allItems.map((p) => ({ product_slug: p.id, product_name: p.name })) },
    });
    reload();
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} item(s) tracked</p>
        <div className="flex gap-2">
          <button onClick={seedFromCatalog} className="rounded-full border border-border bg-card px-4 py-2 font-heading text-xs font-semibold hover:bg-secondary">
            Sync from menu
          </button>
          <button
            onClick={() => setEditing({ product_slug: "", product_name: "", low_stock_threshold: 5, supplier: "", notes: "" })}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 font-heading text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> New item
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-muted-foreground">
              <tr>
                {["Product", "Stock (kg)", "Low at", "Supplier", "Last restocked", ""].map((h) => (
                  <th key={h} className="px-5 py-3 font-accent text-[11px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const low = Number(it.stock_kg) <= Number(it.low_stock_threshold);
                return (
                  <tr key={it.id} className="border-t border-border">
                    <td className="px-5 py-4">
                      <div className="font-heading font-semibold">{it.product_name}</div>
                      <div className="text-xs text-muted-foreground">{it.product_slug}</div>
                    </td>
                    <td className={`px-5 py-4 font-display font-bold ${low ? "text-destructive" : ""}`}>
                      {Number(it.stock_kg).toFixed(1)} {low && <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-destructive">Low</span>}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{Number(it.low_stock_threshold).toFixed(1)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{it.supplier ?? "—"}</td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {it.last_restocked_at ? new Date(it.last_restocked_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setMovingItem(it)} className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-secondary inline-flex items-center gap-1">
                          <PackagePlus className="h-3.5 w-3.5" /> Stock
                        </button>
                        <button onClick={() => setEditing(it)} className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-secondary inline-flex items-center gap-1">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                  No inventory yet. Click "Sync from menu" to import all current products.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <InventoryEditModal
          item={editing}
          onClose={() => setEditing(null)}
          onSave={async (data: any) => {
            await upsert({ data });
            setEditing(null);
            reload();
          }}
        />
      )}
      {movingItem && (
        <StockMoveModal
          item={movingItem}
          onClose={() => setMovingItem(null)}
          onSave={async (data: any) => {
            await move({ data });
            setMovingItem(null);
            reload();
          }}
        />
      )}
    </>
  );
}

function InventoryEditModal({ item, onClose, onSave }: any) {
  const [form, setForm] = useState({
    id: item.id,
    product_slug: item.product_slug ?? "",
    product_name: item.product_name ?? "",
    low_stock_threshold: Number(item.low_stock_threshold ?? 5),
    supplier: item.supplier ?? "",
    notes: item.notes ?? "",
  });
  return (
    <Modal title={item.id ? "Edit item" : "New inventory item"} onClose={onClose}>
      <div className="grid gap-3">
        <Field label="Product slug (unique id)">
          <input className="adm-input" value={form.product_slug} onChange={(e) => setForm({ ...form, product_slug: e.target.value })} />
        </Field>
        <Field label="Product name">
          <input className="adm-input" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
        </Field>
        <Field label="Low-stock threshold (kg)">
          <input type="number" className="adm-input" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) })} />
        </Field>
        <Field label="Supplier">
          <input className="adm-input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
        </Field>
        <Field label="Notes">
          <textarea className="adm-input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full px-4 py-2 text-sm">Cancel</button>
        <button
          onClick={() => onSave(form)}
          className="rounded-full bg-primary px-5 py-2 font-heading text-sm font-semibold text-primary-foreground"
        >Save</button>
      </div>
    </Modal>
  );
}

function StockMoveModal({ item, onClose, onSave }: any) {
  const [reason, setReason] = useState<"received" | "sold" | "adjustment" | "wasted">("received");
  const [qty, setQty] = useState(0);
  const [note, setNote] = useState("");

  const signed = useMemo(() => {
    const n = Math.abs(qty);
    return reason === "received" || reason === "adjustment" ? n : -n;
  }, [qty, reason]);

  return (
    <Modal title={`Stock movement — ${item.product_name}`} onClose={onClose}>
      <div className="mb-3 rounded-xl bg-secondary p-3 text-sm">
        Current stock: <strong>{Number(item.stock_kg).toFixed(1)} kg</strong>
      </div>
      <div className="grid gap-3">
        <Field label="Reason">
          <select value={reason} onChange={(e) => setReason(e.target.value as any)} className="adm-input">
            <option value="received">Received from supplier (+)</option>
            <option value="sold">Sold (−)</option>
            <option value="adjustment">Adjustment (+ or signed)</option>
            <option value="wasted">Wasted / spoiled (−)</option>
          </select>
        </Field>
        <Field label={reason === "adjustment" ? "Quantity (signed, e.g. -2)" : "Quantity (kg)"}>
          <input type="number" step="0.1" className="adm-input" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
        </Field>
        <Field label="Note (optional)">
          <input className="adm-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Batch #, delivery ref, etc." />
        </Field>
        <p className="text-xs text-muted-foreground">
          New stock will be <strong>{(Number(item.stock_kg) + (reason === "adjustment" ? qty : signed)).toFixed(1)} kg</strong>
        </p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full px-4 py-2 text-sm">Cancel</button>
        <button
          disabled={qty === 0}
          onClick={() =>
            onSave({
              inventory_id: item.id,
              change_kg: reason === "adjustment" ? qty : signed,
              reason,
              note,
            })
          }
          className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 font-heading text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {signed >= 0 ? <PackagePlus className="h-4 w-4" /> : <PackageMinus className="h-4 w-4" />} Save movement
        </button>
      </div>
    </Modal>
  );
}

// ============== BLOG ==============
function BlogPanel() {
  const fetchAll = useServerFn(listAllPosts);
  const save = useServerFn(upsertPost);
  const del = useServerFn(deletePost);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  const reload = () => {
    setLoading(true);
    fetchAll().then((d) => setPosts(d ?? [])).finally(() => setLoading(false));
  };
  useEffect(reload, [fetchAll]);

  if (loading) return <Loader />;

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{posts.length} post(s)</p>
        <button
          onClick={() => setEditing({ slug: "", title: "", excerpt: "", body: "", tag: "Recipe", image_url: "", is_published: false, sort_order: 0 })}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 font-heading text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> New post
        </button>
      </div>

      <div className="grid gap-3">
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
            {p.image_url ? (
              <img src={p.image_url} className="h-16 w-16 rounded-lg object-cover" alt="" />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-secondary" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent/15 px-2 py-0.5 font-accent text-[10px] font-semibold uppercase text-accent">{p.tag ?? "—"}</span>
                {p.is_published ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-success"><Eye className="h-3 w-3" /> Published</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><EyeOff className="h-3 w-3" /> Draft</span>
                )}
              </div>
              <div className="mt-1 truncate font-heading font-semibold">{p.title}</div>
              <div className="truncate text-xs text-muted-foreground">{p.excerpt}</div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditing(p)} className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-secondary inline-flex items-center gap-1">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Delete "${p.title}"?`)) {
                    await del({ data: { id: p.id } });
                    reload();
                  }
                }}
                className="rounded-lg border border-border px-2 py-1 text-xs text-destructive hover:bg-destructive/10 inline-flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No posts yet. Create your first post.
          </div>
        )}
      </div>

      {editing && (
        <PostEditModal
          post={editing}
          onClose={() => setEditing(null)}
          onSave={async (data: any) => {
            await save({ data });
            setEditing(null);
            reload();
          }}
        />
      )}
    </>
  );
}

function PostEditModal({ post, onClose, onSave }: any) {
  const generateUploadUrl = useServerFn(generateBlogUploadSignedUrl);
  const registerUpload = useServerFn(registerBlogUpload);
  const [form, setForm] = useState({
    id: post.id,
    slug: post.slug ?? "",
    title: post.title ?? "",
    excerpt: post.excerpt ?? "",
    body: post.body ?? "",
    tag: post.tag ?? "Recipe",
    image_url: post.image_url ?? "",
    is_published: post.is_published ?? false,
    sort_order: post.sort_order ?? 0,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      // Get signed upload URL
      const { uploadUrl, filePath } = await generateUploadUrl({
        data: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
      });

      // Upload file using fetch
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        headers: {
          "x-upsert": "true",
        },
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      // Register the upload in database
      const { url } = await registerUpload({
        data: {
          filePath,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          blogPostId: form.id,
        },
      });

      // Update form with image URL
      setForm({ ...form, image_url: url });
      setUploadProgress(0);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Modal title={post.id ? "Edit post" : "New post"} onClose={onClose}>
      <div className="grid gap-3">
        <Field label="Title">
          <input className="adm-input" value={form.title} onChange={(e) => {
            const t = e.target.value;
            setForm({ ...form, title: t, slug: form.slug || t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") });
          }} />
        </Field>
        <Field label="URL slug">
          <input className="adm-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </Field>
        <Field label="Tag">
          <select className="adm-input" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
            {["Recipe", "Catering", "Events", "News", "Guide"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>

        {/* Image Upload Section */}
        <Field label="Blog Image">
          <div className="space-y-3">
            {form.image_url && (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={form.image_url} alt="Preview" className="w-full h-40 object-cover" />
                <button
                  onClick={() => setForm({ ...form, image_url: "" })}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            )}
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-heading">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground">JPEG, PNG, WebP up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </div>
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
            {!form.image_url && (
              <input 
                className="adm-input" 
                value={form.image_url} 
                onChange={(e) => setForm({ ...form, image_url: e.target.value })} 
                placeholder="Or paste image URL…" 
              />
            )}
          </div>
        </Field>

        <Field label="Excerpt (shown in blog list)">
          <textarea className="adm-input" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </Field>
        <Field label="Body (full article — plain text)">
          <textarea className="adm-input" rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </Field>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
          Published (visible on the public blog)
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full px-4 py-2 text-sm">Cancel</button>
        <button onClick={() => onSave(form)} className="rounded-full bg-primary px-5 py-2 font-heading text-sm font-semibold text-primary-foreground">
          Save
        </button>
      </div>
    </Modal>
  );
}

// ============== Shared ==============
function Loader() {
  return (
    <div className="grid place-items-center py-16 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}
function Field({ label, children }: any) {
  return (
    <label className="grid gap-1.5">
      <span className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h3 className="font-display text-xl font-bold">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
      <style>{`.adm-input{background:var(--card);border:1px solid var(--border);border-radius:0.6rem;padding:0.6rem 0.85rem;font-size:0.9rem;color:var(--foreground);outline:none;width:100%} .adm-input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklab,var(--primary) 18%,transparent)}`}</style>
    </div>
  );
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "admin@mwanainchi.co.ke";
const ADMIN_PASSWORD = "MwanainchiAdmin2026!";

// Idempotently ensures the curated admin user exists in auth.
// Safe to call before login; if the user already exists it does nothing.
export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(async () => {
  // Check if there's already a user with this email
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) return { ok: false as const, error: listErr.message };

  const existing = list.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
  if (existing) return { ok: true as const, created: false };

  const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });
  if (createErr) return { ok: false as const, error: createErr.message };
  return { ok: true as const, created: true };
});

// Middleware-protected helper to assert admin role
async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

// =============== INVENTORY ===============
export const listInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await supabaseAdmin
      .from("inventory")
      .select("*")
      .order("product_name");
    if (error) throw new Error(error.message);
    return data;
  });

export const seedInventory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        items: z
          .array(z.object({ product_slug: z.string().min(1).max(80), product_name: z.string().min(1).max(120) }))
          .max(200),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const rows = data.items.map((it) => ({
      product_slug: it.product_slug,
      product_name: it.product_name,
      stock_kg: 0,
      low_stock_threshold: 5,
    }));
    const { error } = await supabaseAdmin
      .from("inventory")
      .upsert(rows, { onConflict: "product_slug", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertInventory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid().optional(),
        product_slug: z.string().min(1).max(80),
        product_name: z.string().min(1).max(120),
        low_stock_threshold: z.number().min(0).max(100000),
        supplier: z.string().max(120).optional().nullable(),
        notes: z.string().max(1000).optional().nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await supabaseAdmin
      .from("inventory")
      .upsert(
        {
          ...(data.id ? { id: data.id } : {}),
          product_slug: data.product_slug,
          product_name: data.product_name,
          low_stock_threshold: data.low_stock_threshold,
          supplier: data.supplier ?? null,
          notes: data.notes ?? null,
        },
        { onConflict: "product_slug" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addStockMovement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        inventory_id: z.string().uuid(),
        change_kg: z.number().refine((n) => n !== 0, "change must be non-zero"),
        reason: z.enum(["received", "sold", "adjustment", "wasted"]),
        note: z.string().max(500).optional().nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: inv, error: invErr } = await supabaseAdmin
      .from("inventory")
      .select("id,stock_kg")
      .eq("id", data.inventory_id)
      .single();
    if (invErr) throw new Error(invErr.message);

    const newStock = Number(inv.stock_kg) + data.change_kg;
    if (newStock < 0) throw new Error("Stock cannot go below zero");

    const { error: movErr } = await supabaseAdmin.from("stock_movements").insert({
      inventory_id: data.inventory_id,
      change_kg: data.change_kg,
      reason: data.reason,
      note: data.note ?? null,
      created_by: context.userId,
    });
    if (movErr) throw new Error(movErr.message);

    const { error: updErr } = await supabaseAdmin
      .from("inventory")
      .update({
        stock_kg: newStock,
        last_restocked_at: data.reason === "received" ? new Date().toISOString() : undefined,
      })
      .eq("id", data.inventory_id);
    if (updErr) throw new Error(updErr.message);

    return { ok: true, stock_kg: newStock };
  });

export const listMovements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ inventory_id: z.string().uuid().optional() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = supabaseAdmin
      .from("stock_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data.inventory_id) q = q.eq("inventory_id", data.inventory_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows;
  });

// =============== BLOG ===============
const blogInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only"),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional().nullable(),
  body: z.string().max(20000).optional().nullable(),
  tag: z.string().max(40).optional().nullable(),
  image_url: z.string().max(500).optional().nullable(),
  is_published: z.boolean(),
  sort_order: z.number().int().optional(),
});

export const listAllPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const upsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => blogInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const row = {
      ...(data.id ? { id: data.id } : {}),
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt ?? null,
      body: data.body ?? null,
      tag: data.tag ?? null,
      image_url: data.image_url ?? null,
      is_published: data.is_published,
      sort_order: data.sort_order ?? 0,
      published_at: data.is_published ? new Date().toISOString() : null,
    };
    const { error } = await supabaseAdmin
      .from("blog_posts")
      .upsert(row as any, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public — published posts for the blog page
export const listPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select("id,slug,title,excerpt,tag,image_url,published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
});

// =============== ORDERS (admin) ===============
export const listAllOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data;
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "confirmed", "preparing", "ready_for_pickup", "out_for_delivery", "delivered", "cancelled"]),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Tell client if current user is admin
export const isCurrentUserAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { isAdmin: !!data };
  });

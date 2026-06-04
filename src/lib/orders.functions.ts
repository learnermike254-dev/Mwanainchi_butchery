import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Public lookup for the order tracker page.
// Requires order_number + last 4 digits of the customer phone to prevent enumeration.
export const lookupOrder = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        order_number: z.string().min(3).max(32),
        phone_last4: z.string().regex(/^\d{4}$/),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .select(
        "order_number,status,order_type,items,subtotal,delivery_fee,total,location,zone,customer_name,customer_phone,created_at,updated_at",
      )
      .eq("order_number", data.order_number.toUpperCase())
      .maybeSingle();

    if (error) return { ok: false as const, error: "Lookup failed" };
    if (!row) return { ok: false as const, error: "Order not found" };

    const normalizedPhone = String(row.customer_phone ?? "").replace(/\D/g, "");
    if (!normalizedPhone.endsWith(data.phone_last4)) {
      return { ok: false as const, error: "Phone digits don't match this order" };
    }

    return {
      ok: true as const,
      order: {
        order_number: row.order_number,
        status: row.status,
        order_type: row.order_type,
        items: row.items,
        subtotal: row.subtotal,
        delivery_fee: row.delivery_fee,
        total: row.total,
        location: row.location,
        zone: row.zone,
        customer_name: row.customer_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
    };
  });

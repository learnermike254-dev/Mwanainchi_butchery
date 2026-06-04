/**
 * Enhanced Admin Functions
 * Handles orders, inventory POS sync, notifications, and image uploads
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// =============== ORDER MANAGEMENT ===============

export const getOrderById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ orderId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    // First check if user is admin
    const { data: admin } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!admin) throw new Error("Forbidden: admin role required");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .single();

    if (error) throw new Error(error.message);
    return order;
  });

export const updateOrderDeliveryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        orderId: z.string().uuid(),
        deliveryStatus: z.enum(["pending", "assigned", "picked_up", "in_transit", "delivered", "cancelled"]),
        riderId: z.string().uuid().optional(),
        notes: z.string().max(500).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    // Check admin
    const { data: admin } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!admin) throw new Error("Forbidden: admin role required");

    const updates: any = { delivery_status: data.deliveryStatus };

    // Set timestamp based on status
    if (data.deliveryStatus === "assigned") updates.rider_accepted_at = new Date().toISOString();
    if (data.deliveryStatus === "picked_up") updates.picked_up_at = new Date().toISOString();
    if (data.deliveryStatus === "delivered") updates.delivery_completed_at = new Date().toISOString();
    if (data.riderId) updates.assigned_rider_id = data.riderId;
    if (data.notes) updates.delivery_notes = data.notes;

    const { error } = await supabaseAdmin
      .from("orders")
      .update(updates)
      .eq("id", data.orderId);

    if (error) throw new Error(error.message);

    // Trigger WhatsApp notification
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("customer_phone, order_number")
      .eq("id", data.orderId)
      .single();

    if (order?.customer_phone) {
      await queueWhatsAppNotification({
        phoneNumber: order.customer_phone,
        messageType: "order_status",
        relatedOrderId: data.orderId,
        status: data.deliveryStatus,
        orderNumber: order.order_number,
      });
    }

    return { ok: true };
  });

export const assignOrderToRider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        orderId: z.string().uuid(),
        riderId: z.string().uuid(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!admin) throw new Error("Forbidden: admin role required");

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ assigned_rider_id: data.riderId, delivery_status: "assigned" })
      .eq("id", data.orderId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =============== WHATSAPP NOTIFICATIONS ===============

interface NotificationParams {
  phoneNumber: string;
  messageType: "order_status" | "order_received" | "ready_for_pickup" | "delivery_update";
  relatedOrderId: string;
  status?: string;
  orderNumber?: string;
}

async function queueWhatsAppNotification(params: NotificationParams) {
  const messages = {
    order_received: `Asante sana! 🎉\n\nOrder #${params.orderNumber} received successfully.\nWe'll prepare it quickly!\n\n- Mwanainchi Butchery`,
    order_status: getOrderStatusMessage(params.status, params.orderNumber),
    ready_for_pickup: `🎉 Your order #${params.orderNumber} is READY!\n\nCome pick it up now!\n\n- Mwanainchi`,
    delivery_update: `📍 Your order #${params.orderNumber} is on the way!\n\nExpected delivery in 15-20 mins.\n\n- Mwanainchi Delivery`,
  };

  const message = messages[params.messageType] || `Order update: ${params.status}`;

  const { error } = await supabaseAdmin
    .from("whatsapp_queue")
    .insert({
      phone_number: params.phoneNumber,
      message_body: message,
      message_type: "notification",
      related_order_id: params.relatedOrderId,
      status: "pending",
    });

  if (error) console.error("Failed to queue WhatsApp notification:", error.message);
}

function getOrderStatusMessage(status: string | undefined, orderNumber: string | undefined): string {
  const baseMsg = `Order #${orderNumber || "???"}`;
  const messages: Record<string, string> = {
    pending: `${baseMsg} - Pending confirmation\n\nWe're reviewing your order...`,
    preparing: `${baseMsg} - Being Prepared! 👨‍🍳\n\nChef is working on it...`,
    ready_for_pickup: `${baseMsg} is READY! 🎉\n\nCome pick it up!`,
    in_transit: `${baseMsg} is on the way! 🚗\n\nExpected in 15-20 mins`,
    delivered: `${baseMsg} DELIVERED! ✅\n\nEnjoy your meal!\nThank you! 🙏`,
    cancelled: `${baseMsg} has been CANCELLED.`,
  };
  return messages[status || "pending"] || `${baseMsg} - Status update: ${status}`;
}

export const sendWhatsAppNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        orderId: z.string().uuid(),
        messageType: z.enum(["order_received", "order_status", "ready_for_pickup", "delivery_update"]),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!admin) throw new Error("Forbidden: admin role required");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("customer_phone, order_number, status, delivery_status")
      .eq("id", data.orderId)
      .single();

    if (!order?.customer_phone) throw new Error("Order or phone number not found");

    await queueWhatsAppNotification({
      phoneNumber: order.customer_phone,
      messageType: data.messageType,
      relatedOrderId: data.orderId,
      status: order.delivery_status || order.status,
      orderNumber: order.order_number,
    });

    return { ok: true, queued: true };
  });

// =============== INVENTORY POS SYNC ===============

export const syncInventoryFromPOS = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        posData: z.array(
          z.object({
            product_slug: z.string(),
            product_name: z.string(),
            stock_kg: z.number(),
          }),
        ),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!admin) throw new Error("Forbidden: admin role required");

    const syncStartTime = Date.now();

    try {
      // Create sync log entry
      const { data: syncLog, error: logError } = await supabaseAdmin
        .from("pos_sync_logs")
        .insert({
          sync_status: "syncing",
          pos_system: "butchery_workstation",
        })
        .select("id")
        .single();

      if (logError) throw logError;

      // Process each POS item
      let itemsSynced = 0;
      const errors: string[] = [];

      for (const item of data.posData) {
        try {
          // Get current inventory item
          const { data: existing } = await supabaseAdmin
            .from("inventory")
            .select("id, stock_kg")
            .eq("product_slug", item.product_slug)
            .maybeSingle();

          if (!existing) {
            // Create new item
            const { error: insertErr } = await supabaseAdmin
              .from("inventory")
              .insert({
                product_slug: item.product_slug,
                product_name: item.product_name,
                stock_kg: item.stock_kg,
              });
            if (insertErr) throw insertErr;
          } else {
            // Update existing item
            const { error: updateErr } = await supabaseAdmin
              .from("inventory")
              .update({ stock_kg: item.stock_kg })
              .eq("id", existing.id);
            if (updateErr) throw updateErr;

            // Record stock movement
            const change = item.stock_kg - existing.stock_kg;
            if (change !== 0) {
              await supabaseAdmin
                .from("stock_movements")
                .insert({
                  inventory_id: existing.id,
                  change_kg: change,
                  reason: "pos_sync",
                  movement_type: "pos_sync",
                  reference_id: syncLog.id,
                  note: `POS Sync adjustment`,
                });
            }
          }
          itemsSynced++;
        } catch (err: any) {
          errors.push(`${item.product_slug}: ${err.message}`);
        }
      }

      // Update sync log with results
      const syncDuration = Date.now() - syncStartTime;
      const { error: updateLogErr } = await supabaseAdmin
        .from("pos_sync_logs")
        .update({
          sync_status: errors.length > 0 ? "failed" : "success",
          items_synced: itemsSynced,
          sync_duration_ms: syncDuration,
          error_message: errors.length > 0 ? errors.join("; ") : null,
          synced_at: new Date().toISOString(),
        })
        .eq("id", syncLog.id);

      if (updateLogErr) throw updateLogErr;

      return {
        ok: true,
        itemsSynced,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (err: any) {
      return {
        ok: false,
        error: err.message,
      };
    }
  });

export const getPOSSyncHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!admin) throw new Error("Forbidden: admin role required");

    const { data, error } = await supabaseAdmin
      .from("pos_sync_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return data;
  });

// =============== BLOG IMAGE UPLOADS ===============

export const generateBlogUploadSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        fileName: z.string().min(1).max(200),
        fileSize: z.number().min(1).max(10485760), // 10MB max
        mimeType: z.string(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!admin) throw new Error("Forbidden: admin role required");

    // Validate image MIME type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!validMimes.includes(data.mimeType)) {
      throw new Error("Only JPEG, PNG, WebP, and AVIF images are allowed");
    }

    // Generate unique file path
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const ext = data.fileName.split(".").pop();
    const filePath = `blog/${timestamp}-${randomId}.${ext}`;

    // Create signed URL for upload
    const { data: signedUrl, error } = await supabaseAdmin.storage
      .from("blog-images")
      .createSignedUploadUrl(filePath);

    if (error) throw new Error(error.message);

    return {
      ok: true,
      uploadUrl: signedUrl.signedUrl,
      filePath,
      token: signedUrl.token,
    };
  });

export const registerBlogUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        filePath: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        blogPostId: z.string().uuid().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!admin) throw new Error("Forbidden: admin role required");

    const { data: uploadRecord, error } = await supabaseAdmin
      .from("blog_uploads")
      .insert({
        blog_post_id: data.blogPostId || null,
        file_name: data.fileName,
        file_path: data.filePath,
        file_size: data.fileSize,
        mime_type: data.mimeType,
        uploaded_by: context.userId,
        storage_bucket: "blog-images",
        url: `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/blog-images/${data.filePath}`,
      })
      .select("id, url")
      .single();

    if (error) throw new Error(error.message);
    return uploadRecord;
  });

export const getBlogUploads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!admin) throw new Error("Forbidden: admin role required");

    const { data, error } = await supabaseAdmin
      .from("blog_uploads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return data;
  });

// =============== ADMIN ACCOUNT MANAGEMENT ===============

export const listAdminAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!admin) throw new Error("Forbidden: admin role required");

    const { data, error } = await supabaseAdmin
      .from("admin_accounts")
      .select("id, full_name, email, phone, role, is_active, last_login_at, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  });

export const updateAdminLastLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await supabaseAdmin
      .from("admin_accounts")
      .update({ last_login_at: new Date().toISOString() })
      .eq("user_id", context.userId);

    if (error) console.error("Failed to update last login:", error.message);
    return { ok: true };
  });

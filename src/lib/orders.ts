import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "./cart";

export type OrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  order_type: "pickup" | "delivery";
  location: any;
  zone: any;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function makeOrderNumber() {
  // Short, human-friendly e.g. MWB-1042
  return `MWB-${Math.floor(1000 + Math.random() * 9000)}`;
}

export type NewOrder = {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  order_type: "pickup" | "delivery";
  location?: any;
  zone?: any;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes?: string | null;
};

export async function createOrder(input: NewOrder) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user_id = sessionData.session?.user.id ?? null;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...input,
      user_id,
      items: input.items as any,
      location: input.location ?? null,
      zone: input.zone ?? null,
      customer_email: input.customer_email ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as OrderRow;
}

export async function listMyOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OrderRow[];
}

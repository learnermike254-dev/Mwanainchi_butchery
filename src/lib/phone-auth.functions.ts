import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { supabase } from "@/integrations/supabase/client";

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format phone number to international format
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // If starts with 7, assume Kenya (254)
  if (cleaned.startsWith("7") && cleaned.length === 9) {
    return `+254${cleaned}`;
  }

  // If already starts with country code
  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  // If has + prefix
  if (phone.startsWith("+")) {
    return phone;
  }

  // Default: assume Kenya
  return `+254${cleaned}`;
}

// Server function to send OTP via WhatsApp
export const sendPhoneOTP = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({ phone: z.string().min(9).max(20) }).parse(i)
  )
  .handler(async ({ data }) => {
    const phone = formatPhoneNumber(data.phone);

    // Validate phone format
    if (!phone.startsWith("+") || phone.length < 10) {
      return { ok: false as const, error: "Invalid phone number format" };
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const { error: dbError } = await supabaseAdmin
      .from("phone_otp")
      .upsert(
        {
          phone_number: phone,
          otp_code: otp,
          expires_at: expiresAt.toISOString(),
          verified: false,
          attempts: 0,
        },
        { onConflict: "phone_number" }
      );

    if (dbError) {
      return { ok: false as const, error: "Failed to generate OTP" };
    }

    // Send OTP via WhatsApp using Twilio or similar service
    // For now, we'll log it and return success
    // TODO: Integrate with actual WhatsApp provider (Twilio, etc.)
    try {
      // Example Twilio integration (uncomment and configure when ready):
      /*
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      await client.messages.create({
        from: 'whatsapp:+14155552671', // Your Twilio WhatsApp number
        to: `whatsapp:${phone}`,
        body: `Your Mwanainchi Butchery verification code is: ${otp}. Valid for 10 minutes.`,
      });
      */
      
      // For development, you can log or send via another service
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
      
      return { 
        ok: true as const, 
        message: "OTP sent successfully",
        // In development, return OTP for testing (remove in production)
        ...(process.env.NODE_ENV === "development" && { otp })
      };
    } catch (error: any) {
      console.error("Failed to send WhatsApp OTP:", error);
      return { 
        ok: false as const, 
        error: "Failed to send OTP via WhatsApp" 
      };
    }
  });

// Server function to verify OTP and create session
export const verifyPhoneOTP = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({ 
      phone: z.string().min(9).max(20),
      otp: z.string().regex(/^\d{6}$/)
    }).parse(i)
  )
  .handler(async ({ data }) => {
    const phone = formatPhoneNumber(data.phone);

    // Get OTP record
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("phone_otp")
      .select("*")
      .eq("phone_number", phone)
      .maybeSingle();

    if (fetchError || !otpRecord) {
      return { ok: false as const, error: "OTP not found or expired" };
    }

    // Check if expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return { ok: false as const, error: "OTP expired" };
    }

    // Check attempts (limit to 5)
    if (otpRecord.attempts >= 5) {
      return { ok: false as const, error: "Too many attempts. Please request a new OTP." };
    }

    // Verify OTP code
    if (otpRecord.otp_code !== data.otp) {
      // Increment attempts
      await supabaseAdmin
        .from("phone_otp")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("phone_number", phone);

      return { ok: false as const, error: "Invalid OTP code" };
    }

    // OTP verified - get or create user
    let { data: user, error: userError } = await supabaseAdmin
      .from("phone_users")
      .select("*")
      .eq("phone_number", phone)
      .maybeSingle();

    if (userError && userError.code !== "PGRST116") {
      // Error other than "not found"
      return { ok: false as const, error: "Failed to verify user" };
    }

    // Create user if doesn't exist
    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("phone_users")
        .insert({
          phone_number: phone,
          verified: true,
          last_login: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        return { ok: false as const, error: "Failed to create user account" };
      }

      user = newUser;
    } else {
      // Update last login
      await supabaseAdmin
        .from("phone_users")
        .update({ last_login: new Date().toISOString() })
        .eq("phone_number", phone);
    }

    // Mark OTP as verified
    await supabaseAdmin
      .from("phone_otp")
      .update({ verified: true, attempts: 0 })
      .eq("phone_number", phone);

    // Return user info (frontend will store this)
    return {
      ok: true as const,
      user: {
        id: user.id,
        phone: phone,
        verified: user.verified,
      },
      // Generate a session token (in production, use JWT or similar)
      sessionToken: Buffer.from(JSON.stringify({
        userId: user.id,
        phone: phone,
        iat: Date.now(),
        exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      })).toString("base64"),
    };
  });

// Client function to retrieve user session
export async function getUserSession() {
  try {
    const stored = localStorage.getItem("phone_session");
    if (!stored) return null;

    const session = JSON.parse(atob(stored));
    
    // Check if expired
    if (session.exp < Date.now()) {
      localStorage.removeItem("phone_session");
      return null;
    }

    return {
      userId: session.userId,
      phone: session.phone,
    };
  } catch {
    return null;
  }
}

// Client function to logout
export async function phoneLogout() {
  localStorage.removeItem("phone_session");
}

// Client function to store session
export async function storePhoneSession(sessionToken: string) {
  localStorage.setItem("phone_session", sessionToken);
}

// Verify user owns a phone number for order operations
export const verifyPhoneOwnership = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      phone: z.string().min(9).max(20),
      phone_last4: z.string().regex(/^\d{4}$/),
    }).parse(i)
  )
  .handler(async ({ data }) => {
    const phone = formatPhoneNumber(data.phone);
    const lastFour = phone.slice(-4);

    if (lastFour !== data.phone_last4) {
      return { ok: false as const, error: "Phone number doesn't match" };
    }

    // Get user
    const { data: user, error } = await supabaseAdmin
      .from("phone_users")
      .select("*")
      .eq("phone_number", phone)
      .eq("verified", true)
      .maybeSingle();

    if (error || !user) {
      return { ok: false as const, error: "User not found" };
    }

    return { ok: true as const, userId: user.id };
  });

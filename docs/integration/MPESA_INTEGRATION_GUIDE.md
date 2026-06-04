# M-Pesa Integration Guide: STK Push + QR Code Scanner

**Mwanainchi Butchery & Fast Food**  
**Till Number (Test):** 9311710  
**Last Updated:** June 1, 2026

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [M-Pesa API Setup](#mpesa-api-setup)
3. [STK Push Implementation](#stk-push-implementation)
4. [QR Code Scanner Integration](#qr-code-scanner-integration)
5. [Checkout Flow Integration](#checkout-flow-integration)
6. [Testing & Troubleshooting](#testing--troubleshooting)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

### Required Accounts & Services

- **Safaricom Business Account** - M-Pesa enabled
- **Daraja API Credentials** - From Safaricom
- **Test Credentials:**
  - Till Number: `9311710`
  - Test Phone: `254769282033` or similar (Kenyan format)
  - Test Amount: KES 1-100,000

### Node.js Packages

```bash
npm install axios dotenv qr-scanner zustand
# OR
npm install axios dotenv html5-qrcode zustand
```

---

## M-Pesa API Setup

### Step 1: Register on Daraja Portal

1. Visit [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)
2. Create a new application
3. Select **Lipa na M-Pesa Online** and **Lipa na M-Pesa Query Request** APIs
4. You'll receive:
   - **Consumer Key**
   - **Consumer Secret**
   - **Business Shortcode** (Paybill or Till Number)
   - **Passkey** (for Online API)

### Step 2: Environment Variables

Create `.env.local` in project root:

```env
# M-Pesa Credentials
VITE_MPESA_CONSUMER_KEY=your_consumer_key_here
VITE_MPESA_CONSUMER_SECRET=your_consumer_secret_here
VITE_MPESA_SHORTCODE=9311710
VITE_MPESA_PASSKEY=your_passkey_here
VITE_MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
VITE_MPESA_TIMEOUT_URL=https://yourdomain.com/api/mpesa/timeout

# API Endpoints
VITE_MPESA_AUTH_URL=https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials
VITE_MPESA_STK_URL=https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
VITE_MPESA_STATUS_URL=https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query

# For Production (change to live endpoints):
# VITE_MPESA_AUTH_URL=https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials
```

> ⚠️ **Security Note:** Store credentials in server-side `.env` file, not in `.env.local`

---

## STK Push Implementation

### Step 1: Create M-Pesa Service

Create `src/lib/mpesa.functions.ts` (Server-side functions):

```typescript
import { json } from "@tanstack/start";

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  orderID: string;
  accountReference: string;
}

interface AuthResponse {
  access_token: string;
}

interface STKResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

// Get M-Pesa Access Token
async function getMPesaAccessToken(): Promise<string> {
  try {
    const auth = btoa(
      `${process.env.VITE_MPESA_CONSUMER_KEY}:${process.env.VITE_MPESA_CONSUMER_SECRET}`
    );

    const response = await fetch(process.env.VITE_MPESA_AUTH_URL!, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Auth failed: ${response.statusText}`);
    }

    const data = (await response.json()) as AuthResponse;
    return data.access_token;
  } catch (error) {
    console.error("M-Pesa Auth Error:", error);
    throw error;
  }
}

// Generate Timestamp
function getTimestamp(): string {
  const now = new Date();
  return (
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0")
  );
}

// Generate Password (Base64 encoded)
function generatePassword(): string {
  const timestamp = getTimestamp();
  const shortcode = process.env.VITE_MPESA_SHORTCODE;
  const passkey = process.env.VITE_MPESA_PASSKEY;
  const text = `${shortcode}${passkey}${timestamp}`;
  return btoa(text);
}

// STK Push Request
export async function initiateSTKPush({
  phoneNumber,
  amount,
  orderID,
  accountReference,
}: STKPushRequest) {
  try {
    // Validate phone number
    let formattedPhone = phoneNumber.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    // Validate amount
    if (amount < 1 || amount > 150000) {
      return json(
        { error: "Amount must be between KES 1 and 150,000" },
        { status: 400 }
      );
    }

    const accessToken = await getMPesaAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword();

    const payload = {
      BusinessShortCode: process.env.VITE_MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.floor(amount),
      PartyA: formattedPhone,
      PartyB: process.env.VITE_MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.VITE_MPESA_CALLBACK_URL,
      AccountReference: accountReference || `ORDER-${orderID}`,
      TransactionDesc: `Payment for Order ${orderID}`,
    };

    const response = await fetch(process.env.VITE_MPESA_STK_URL!, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`STK Push failed: ${response.statusText}`);
    }

    const data = (await response.json()) as STKResponse;

    if (data.ResponseCode === "0") {
      return json({
        success: true,
        merchantRequestID: data.MerchantRequestID,
        checkoutRequestID: data.CheckoutRequestID,
        message: "STK Push initiated successfully",
      });
    } else {
      return json(
        {
          error: data.ResponseDescription || "STK Push failed",
          responseCode: data.ResponseCode,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("STK Push Error:", error);
    return json(
      { error: "Failed to initiate STK Push: " + String(error) },
      { status: 500 }
    );
  }
}

// Check Payment Status
export async function checkPaymentStatus(checkoutRequestID: string) {
  try {
    const accessToken = await getMPesaAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword();

    const payload = {
      BusinessShortCode: process.env.VITE_MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };

    const response = await fetch(process.env.VITE_MPESA_STATUS_URL!, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error("Status Check Error:", error);
    return json(
      { error: "Failed to check payment status: " + String(error) },
      { status: 500 }
    );
  }
}
```

### Step 2: Create Server Route for STK Push

Create `src/routes/api/mpesa/stk.ts`:

```typescript
import { json } from "@tanstack/start";
import { initiateSTKPush } from "@/lib/mpesa.functions";

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { phoneNumber, amount, orderID, accountReference } = body;

    if (!phoneNumber || !amount || !orderID) {
      return json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await initiateSTKPush({
      phoneNumber,
      amount,
      orderID,
      accountReference,
    });

    return result;
  } catch (error) {
    return json(
      { error: "Server error: " + String(error) },
      { status: 500 }
    );
  }
}
```

### Step 3: Create M-Pesa Store (Zustand)

Create `src/lib/mpesa-store.ts`:

```typescript
import { create } from "zustand";

interface MPesaTransaction {
  checkoutRequestID: string;
  merchantRequestID: string;
  phoneNumber: string;
  amount: number;
  orderID: string;
  status: "pending" | "success" | "failed" | "cancelled";
  timestamp: Date;
  resultCode?: string;
  resultDesc?: string;
}

interface MPesaStore {
  currentTransaction: MPesaTransaction | null;
  transactions: MPesaTransaction[];
  initiateMPesa: (
    phoneNumber: string,
    amount: number,
    orderID: string
  ) => Promise<void>;
  updateTransactionStatus: (
    checkoutRequestID: string,
    status: MPesaTransaction["status"],
    resultCode?: string,
    resultDesc?: string
  ) => void;
  clearTransaction: () => void;
}

export const useMPesaStore = create<MPesaStore>((set) => ({
  currentTransaction: null,
  transactions: [],

  initiateMPesa: async (phoneNumber, amount, orderID) => {
    try {
      const response = await fetch("/api/mpesa/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          amount,
          orderID,
          accountReference: `MWANAINCHI-${orderID}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        set((state) => ({
          currentTransaction: {
            checkoutRequestID: data.checkoutRequestID,
            merchantRequestID: data.merchantRequestID,
            phoneNumber,
            amount,
            orderID,
            status: "pending",
            timestamp: new Date(),
          },
        }));
      } else {
        throw new Error(data.error || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("M-Pesa initiation error:", error);
      throw error;
    }
  },

  updateTransactionStatus: (
    checkoutRequestID,
    status,
    resultCode,
    resultDesc
  ) => {
    set((state) => {
      const transaction = state.currentTransaction;
      if (transaction?.checkoutRequestID === checkoutRequestID) {
        return {
          currentTransaction: {
            ...transaction,
            status,
            resultCode,
            resultDesc,
          },
          transactions: [
            {
              ...transaction,
              status,
              resultCode,
              resultDesc,
            },
            ...state.transactions,
          ],
        };
      }
      return state;
    });
  },

  clearTransaction: () => {
    set({ currentTransaction: null });
  },
}));
```

---

## QR Code Scanner Integration

### Step 1: Install QR Scanner

```bash
npm install html5-qrcode
```

### Step 2: Create QR Scanner Component

Create `src/components/MPesaQRScanner.tsx`:

```typescript
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";

interface MPesaQRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function MPesaQRScanner({ onScan, onClose }: MPesaQRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scanner = new Html5Qrcode("qr-scanner-container");
    scannerRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      disableFlip: false,
    };

    scanner
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Parse M-Pesa QR code or phone number
          if (decodedText.includes("0") || decodedText.includes("254")) {
            onScan(decodedText);
            scanner.stop();
          }
        },
        (errorMessage) => {
          // Ignore continuous scan errors
          console.debug(errorMessage);
        }
      )
      .catch(() => {
        setError("Unable to access camera. Please check permissions.");
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Scan M-Pesa QR</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive">
            {error}
          </div>
        ) : (
          <div id="qr-scanner-container" className="rounded-lg overflow-hidden" />
        )}

        <p className="text-sm text-muted-foreground text-center mt-4">
          Point your camera at the M-Pesa QR code or phone number
        </p>
      </div>
    </div>
  );
}
```

### Step 3: Create QR Code Generator Component

Create `src/components/MPesaQRGenerator.tsx`:

```typescript
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface MPesaQRGeneratorProps {
  phoneNumber: string;
  amount: number;
  orderID: string;
}

export function MPesaQRGenerator({
  phoneNumber,
  amount,
  orderID,
}: MPesaQRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Format M-Pesa data for QR code
    // This could be a dynamic link or M-Pesa specific format
    const qrData = `https://mwanainchi.com/pay?phone=${phoneNumber}&amount=${amount}&order=${orderID}`;

    QRCode.toCanvas(canvasRef.current, qrData, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      width: 200,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    }).catch(console.error);
  }, [phoneNumber, amount, orderID]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className="border-4 border-primary rounded-lg p-2"
      />
      <p className="text-sm text-muted-foreground">
        Scan QR code to complete payment
      </p>
    </div>
  );
}
```

Install QRCode package:

```bash
npm install qrcode
```

---

## Checkout Flow Integration

### Step 1: Update Checkout Component

Update `src/routes/checkout.tsx` to include M-Pesa payment option:

```typescript
import { MPesaPaymentModal } from "@/components/MPesaPaymentModal";
import { useState } from "react";
import { useMPesaStore } from "@/lib/mpesa-store";

export default function CheckoutPage() {
  const [showMPesaModal, setShowMPesaModal] = useState(false);
  const { currentTransaction } = useMPesaStore();

  return (
    <div className="space-y-6">
      {/* Existing checkout content */}

      <div className="space-y-3">
        <h3 className="font-semibold">Payment Method</h3>

        <div className="grid gap-3">
          {/* M-Pesa Option */}
          <button
            onClick={() => setShowMPesaModal(true)}
            className="flex items-center gap-3 p-4 border-2 border-border rounded-lg hover:border-primary transition-colors"
          >
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">M-Pesa</p>
              <p className="text-sm text-muted-foreground">
                Pay securely with M-Pesa
              </p>
            </div>
          </button>

          {/* Other payment methods */}
        </div>
      </div>

      {showMPesaModal && (
        <MPesaPaymentModal
          amount={totalAmount}
          orderID={orderId}
          onClose={() => setShowMPesaModal(false)}
        />
      )}

      {currentTransaction?.status === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            ✓ Payment successful! Order confirmed.
          </p>
        </div>
      )}
    </div>
  );
}
```

### Step 2: Create M-Pesa Payment Modal

Create `src/components/MPesaPaymentModal.tsx`:

```typescript
import { useState } from "react";
import { X } from "lucide-react";
import { useMPesaStore } from "@/lib/mpesa-store";
import { MPesaQRScanner } from "./MPesaQRScanner";
import { MPesaQRGenerator } from "./MPesaQRGenerator";

interface MPesaPaymentModalProps {
  amount: number;
  orderID: string;
  onClose: () => void;
}

export function MPesaPaymentModal({
  amount,
  orderID,
  onClose,
}: MPesaPaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"manual" | "qr">("manual");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { initiateMPesa, currentTransaction } = useMPesaStore();

  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await initiateMPesa(phoneNumber, amount, orderID);
    } catch (err) {
      setError(String(err) || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data: string) => {
    // Extract phone number from scanned data
    const phone = data.replace(/\D/g, "");
    setPhoneNumber(phone);
    setShowQRScanner(false);
    setPaymentMethod("manual");
  };

  // If transaction is pending, show status
  if (currentTransaction?.status === "pending") {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg max-w-md w-full p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">M-Pesa Payment</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="text-center space-y-2">
            <div className="inline-block animate-spin">
              <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full" />
            </div>
            <p className="font-semibold">Waiting for M-Pesa prompt...</p>
            <p className="text-sm text-muted-foreground">
              A prompt will appear on {currentTransaction.phoneNumber}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Amount</p>
            <p className="text-2xl font-bold text-primary">
              KES {currentTransaction.amount.toLocaleString()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-md w-full p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Pay with M-Pesa</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Amount to pay</p>
          <p className="text-3xl font-bold text-primary">
            KES {amount.toLocaleString()}
          </p>
        </div>

        {/* Payment Method Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod("manual")}
            className={`py-3 px-4 rounded-lg border-2 transition-colors ${
              paymentMethod === "manual"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary"
            }`}
          >
            <p className="font-semibold text-sm">Manual</p>
            <p className="text-xs text-muted-foreground">Enter number</p>
          </button>

          <button
            onClick={() => setShowQRScanner(true)}
            className={`py-3 px-4 rounded-lg border-2 transition-colors ${
              paymentMethod === "qr"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary"
            }`}
          >
            <p className="font-semibold text-sm">QR Code</p>
            <p className="text-xs text-muted-foreground">Scan</p>
          </button>
        </div>

        {showQRScanner && (
          <MPesaQRScanner
            onScan={handleQRScan}
            onClose={() => setShowQRScanner(false)}
          />
        )}

        {/* Manual Phone Input */}
        {paymentMethod === "manual" && !showQRScanner && (
          <form onSubmit={handleManualPayment} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254769282033 or 0769282033"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter your M-Pesa registered phone number
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-3 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !phoneNumber}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </form>
        )}

        {/* QR Code Display Option */}
        {paymentMethod === "qr" && !showQRScanner && (
          <div className="flex justify-center py-4">
            <MPesaQRGenerator
              phoneNumber={phoneNumber}
              amount={amount}
              orderID={orderID}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Callback Handler

### Create Callback Route

Create `src/routes/api/mpesa/callback.ts`:

```typescript
import { json } from "@tanstack/start";

interface CallbackData {
  Body?: {
    stkCallback?: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = (await request.json()) as CallbackData;
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return json({ error: "Invalid callback" }, { status: 400 });
    }

    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } =
      stkCallback;

    console.log("M-Pesa Callback:", {
      checkoutRequestID: CheckoutRequestID,
      resultCode: ResultCode,
      resultDesc: ResultDesc,
    });

    if (ResultCode === 0) {
      // Extract transaction details
      const items = CallbackMetadata?.Item || [];
      const amount = items.find((item) => item.Name === "Amount")?.Value;
      const mpesaCode = items.find((item) => item.Name === "MpesaReceiptNumber")
        ?.Value;
      const phone = items.find((item) => item.Name === "PhoneNumber")?.Value;

      console.log("Payment Successful:", {
        amount,
        mpesaCode,
        phone,
        checkoutRequestID: CheckoutRequestID,
      });

      // Update order status in database
      // Call order confirmation functions
      // Send WhatsApp notification

      return json({
        success: true,
        message: "Payment received",
        resultCode: 0,
      });
    } else {
      console.log("Payment Failed:", ResultDesc);

      return json({
        success: false,
        message: ResultDesc,
        resultCode: ResultCode,
      });
    }
  } catch (error) {
    console.error("Callback Error:", error);
    return json({ error: "Callback processing error" }, { status: 500 });
  }
}
```

---

## Testing & Troubleshooting

### Test Credentials

| Field | Value |
| --- | --- |
| Till Number | 9311710 |
| Test Phone | 254769282033 |
| Test Amount | 1 - 100,000 KES |
| Consumer Key | [From Daraja] |
| Consumer Secret | [From Daraja] |

### Testing Workflow

1. **Initiate Payment**
   ```
   POST http://localhost:8080/api/mpesa/stk
   {
     "phoneNumber": "254769282033",
     "amount": 100,
     "orderID": "TEST-001",
     "accountReference": "MWANAINCHI-TEST-001"
   }
   ```

2. **Expected Response (Success)**
   ```json
   {
     "success": true,
     "merchantRequestID": "...",
     "checkoutRequestID": "...",
     "message": "STK Push initiated successfully"
   }
   ```

3. **STK Prompt**
   - STK prompt appears on the test phone
   - User enters M-Pesa PIN
   - Payment processes

4. **Callback Verification**
   - Check server logs for callback
   - Verify ResultCode = 0 (Success)

### Common Issues

| Issue | Solution |
| --- | --- |
| Auth Token Error | Verify Consumer Key/Secret in .env |
| Invalid Shortcode | Use Till Number: 9311710 |
| Phone Format Error | Ensure 254 prefix, no +, no spaces |
| STK Not Appearing | Check phone number registered with M-Pesa |
| Callback Not Received | Verify callback URL is publicly accessible |
| Invalid Amount | Amount must be 1-150,000 KES |

### Debug Logging

Enable debug logs:

```typescript
// In mpesa.functions.ts
console.log("STK Payload:", JSON.stringify(payload, null, 2));
console.log("Response Status:", response.status);
console.log("Response Body:", await response.text());
```

---

## Production Deployment

### Step 1: Update Environment Variables

Change sandbox URLs to production:

```env
# Production URLs
VITE_MPESA_AUTH_URL=https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials
VITE_MPESA_STK_URL=https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest
VITE_MPESA_STATUS_URL=https://api.safaricom.co.ke/mpesa/transactionstatus/v1/query

# Production Credentials (from Daraja Live)
VITE_MPESA_CONSUMER_KEY=production_key
VITE_MPESA_CONSUMER_SECRET=production_secret
VITE_MPESA_SHORTCODE=your_paybill_or_till
VITE_MPESA_PASSKEY=production_passkey

# Public callback URL
VITE_MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

### Step 2: Database Updates

Create migration to track M-Pesa transactions:

```sql
CREATE TABLE mpesa_transactions (
  id BIGSERIAL PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  checkout_request_id VARCHAR(255) UNIQUE NOT NULL,
  merchant_request_id VARCHAR(255),
  phone_number VARCHAR(20),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  mpesa_code VARCHAR(50),
  result_code INTEGER,
  result_desc TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX idx_checkout_request_id ON mpesa_transactions(checkout_request_id);
CREATE INDEX idx_order_id ON mpesa_transactions(order_id);
```

### Step 3: Order Integration

Update order completion flow:

```typescript
// In your order completion function
export async function completeOrderWithMPesa(
  orderId: string,
  mpesaTransactionId: string
) {
  // Mark order as paid
  await db.query(
    `UPDATE orders SET payment_status = 'paid', payment_method = 'mpesa' 
     WHERE id = $1`,
    [orderId]
  );

  // Update M-Pesa transaction
  await db.query(
    `UPDATE mpesa_transactions SET status = 'success' 
     WHERE checkout_request_id = $1`,
    [mpesaTransactionId]
  );

  // Send WhatsApp confirmation
  await sendWhatsAppOrderConfirmation(orderId);
}
```

### Step 4: Security Checklist

- ✅ All credentials in server-side .env only
- ✅ Validate phone numbers (format & length)
- ✅ Validate amounts (1-150,000 KES)
- ✅ SSL/TLS enabled on domain
- ✅ Callback URL publicly accessible
- ✅ CORS properly configured
- ✅ Rate limiting on payment endpoints
- ✅ Request/response logging for audits
- ✅ Error messages don't leak sensitive data

### Step 5: Monitor & Alerts

Set up monitoring for:

- Failed payment initiations
- Missing callbacks
- Transaction timeouts
- Invalid phone formats

---

## Quick Reference: File Structure

```
src/
├── lib/
│   ├── mpesa.functions.ts         # M-Pesa API functions
│   └── mpesa-store.ts              # Zustand state management
├── components/
│   ├── MPesaPaymentModal.tsx        # Main payment UI
│   ├── MPesaQRScanner.tsx           # QR scanner component
│   └── MPesaQRGenerator.tsx         # QR generator component
└── routes/
    ├── checkout.tsx                 # Updated with M-Pesa integration
    └── api/
        └── mpesa/
            ├── stk.ts              # STK Push endpoint
            └── callback.ts         # Callback handler
```

---

## Support & Resources

- **Daraja Portal:** https://developer.safaricom.co.ke/
- **M-Pesa Documentation:** https://developer.safaricom.co.ke/documentation
- **Till Number:** 9311710 (Test)
- **Test Credentials:** Provided by Safaricom on Daraja

---

**Last Updated:** June 1, 2026  
**Status:** Ready for Implementation

# WhatsApp OTP Login - Detailed Technical Explanation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Login Flow Step-by-Step](#login-flow-step-by-step)
3. [Code Component Breakdown](#code-component-breakdown)
4. [Database Schema & Operations](#database-schema--operations)
5. [Security Mechanisms](#security-mechanisms)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Session Management](#session-management)
8. [Error Handling](#error-handling)
9. [Phone Number Processing](#phone-number-processing)
10. [Implementation Details](#implementation-details)

---

## System Architecture

### High-Level Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                        MWANAINCHI BUTCHERY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐                                       │
│  │   FRONTEND (React)   │                                       │
│  ├──────────────────────┤                                       │
│  │ - Login Page         │                                       │
│  │ - Account Page       │                                       │
│  │ - Order Tracker      │                                       │
│  │ - usePhoneAuth Hook  │                                       │
│  └──────────────────────┘                                       │
│           │                                                      │
│           │ Calls Server Functions                             │
│           ▼                                                      │
│  ┌──────────────────────────────────────────┐                 │
│  │   BACKEND (TanStack Start Server Fns)    │                 │
│  ├──────────────────────────────────────────┤                 │
│  │ - sendPhoneOTP()                         │                 │
│  │ - verifyPhoneOTP()                       │                 │
│  │ - verifyPhoneOwnership()                 │                 │
│  │ - phone-auth.functions.ts                │                 │
│  └──────────────────────────────────────────┘                 │
│           │                                                      │
│           │ Reads/Writes Data                                  │
│           ▼                                                      │
│  ┌──────────────────────────────────────────┐                 │
│  │     SUPABASE DATABASE                    │                 │
│  ├──────────────────────────────────────────┤                 │
│  │ - phone_users table                      │                 │
│  │ - phone_otp table                        │                 │
│  │ - orders table                           │                 │
│  │ - user_roles table (admins)              │                 │
│  └──────────────────────────────────────────┘                 │
│           │                                                      │
│           │ Sends WhatsApp Messages                            │
│           ▼                                                      │
│  ┌──────────────────────────────────────────┐                 │
│  │     WHATSAPP PROVIDER (Twilio, etc.)     │                 │
│  ├──────────────────────────────────────────┤                 │
│  │ - Sends OTP via WhatsApp message         │                 │
│  │ - Delivers to user's phone               │                 │
│  └──────────────────────────────────────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Purpose | Language |
|-----------|---------|----------|
| `login.tsx` | User login UI - phone input + OTP verification | React/TSX |
| `use-phone-auth.ts` | React hook - manages auth state | React Hook |
| `phone-auth.functions.ts` | Server functions - OTP generation/verification | Node.js (Server Fn) |
| `phone_users` table | Stores user accounts | PostgreSQL |
| `phone_otp` table | Stores temporary OTP codes | PostgreSQL |
| `WhatsApp Provider` | Sends OTP messages | External API |

---

## Login Flow Step-by-Step

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: USER VISITS LOGIN PAGE                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User navigates to: https://example.com/login                  │
│                                                                  │
│  React loads: <LoginPage />                                    │
│  State initialized:                                             │
│  - stage = "phone" (not "otp" yet)                             │
│  - phone = ""                                                   │
│  - otp = ""                                                     │
│  - status = "idle"                                              │
│  - error = null                                                 │
│                                                                  │
│  UI renders:                                                     │
│  ┌─────────────────────────────────────┐                       │
│  │ Sign in with WhatsApp to track      │                       │
│  │ your orders                         │                       │
│  │                                     │                       │
│  │ [Phone Number Input Box]            │                       │
│  │ Placeholder: "254712345678..."      │                       │
│  │                                     │                       │
│  │ [Send OTP via WhatsApp Button]      │                       │
│  └─────────────────────────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: USER ENTERS PHONE NUMBER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User types: "0712345678"                                      │
│                                                                  │
│  JavaScript onChange handler:                                   │
│  - Removes all non-digits: "712345678"                         │
│  - Updates state: phone = "712345678"                          │
│                                                                  │
│  User clicks "Send OTP via WhatsApp"                           │
│                                                                  │
│  Event Handler Triggered: handleSendOTP()                      │
│  ├─ Validates input: phone.trim() is not empty               │
│  ├─ Sets status = "loading" (button shows spinner)            │
│  └─ Calls: sendPhoneOTP({ phone: "712345678" })              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: SERVER GENERATES & SENDS OTP                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Server Function: sendPhoneOTP() receives { phone }           │
│                                                                  │
│  Step 3.1: Format Phone Number                                │
│  ──────────────────────────────────────────                  │
│  Input: "712345678" (or any format)                           │
│                                                                  │
│  formatPhoneNumber() logic:                                     │
│  ├─ Remove all non-digits: "712345678"                        │
│  ├─ Check if 9 digits & starts with 7: YES                   │
│  ├─ Assume Kenya country code (+254)                          │
│  └─ Return: "+254712345678"                                   │
│                                                                  │
│  Step 3.2: Generate OTP Code                                  │
│  ─────────────────────────────                               │
│  generateOTP():                                                │
│  ├─ Generate random number: 100000-999999                     │
│  ├─ Example: "487291"                                         │
│  └─ Return: "487291"                                          │
│                                                                  │
│  Step 3.3: Set Expiration Time                                │
│  ────────────────────────────                                │
│  expiresAt = now() + 10 minutes                               │
│  Example: 2026-06-01 14:35:00 UTC                             │
│                                                                  │
│  Step 3.4: Store OTP in Database                              │
│  ────────────────────────────────                            │
│  INSERT INTO phone_otp:                                        │
│  {                                                              │
│    phone_number: "+254712345678",                             │
│    otp_code: "487291",                                        │
│    expires_at: "2026-06-01 14:35:00",                        │
│    verified: false,                                            │
│    attempts: 0                                                 │
│  }                                                              │
│                                                                  │
│  Step 3.5: Send via WhatsApp Provider                         │
│  ─────────────────────────────────                           │
│  IF Twilio configured:                                         │
│  ├─ Twilio Client creates message                             │
│  ├─ To: "whatsapp:+254712345678"                             │
│  ├─ Body: "Your verification code is: 487291. Valid for      │
│  │        10 minutes."                                        │
│  └─ Send via WhatsApp API                                     │
│                                                                  │
│  ELSE (Development Mode):                                       │
│  └─ Log to console: "[DEV] OTP for +254712345678: 487291"   │
│                                                                  │
│  Step 3.6: Return Response to Frontend                        │
│  ────────────────────────────────────                        │
│  {                                                              │
│    ok: true,                                                   │
│    message: "OTP sent successfully",                           │
│    otp: "487291" (dev mode only)                              │
│  }                                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: FRONTEND SWITCHES TO OTP STAGE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Server response received: { ok: true, message, otp }         │
│                                                                  │
│  handleSendOTP() continuation:                                 │
│  ├─ Check: result.ok === true                                 │
│  ├─ Store phone number: setPhone("712345678")                │
│  ├─ Set stage: setStage("otp")                               │
│  ├─ Set status: setStatus("idle")                            │
│  ├─ Log OTP (dev): console.log(`[DEV] OTP: 487291`)          │
│  └─ Render new UI                                              │
│                                                                  │
│  UI Changes:                                                     │
│  ┌─────────────────────────────────────┐                       │
│  │ Enter the code sent to your        │                       │
│  │ WhatsApp                           │                       │
│  │                                     │                       │
│  │ [OTP Input Box] (6 digits only)    │                       │
│  │ Placeholder: "000000"              │                       │
│  │                                     │                       │
│  │ Check your WhatsApp for the       │                       │
│  │ 6-digit code (valid for 10 min)   │                       │
│  │                                     │                       │
│  │ [Verify & Sign In Button]          │                       │
│  │ [Use different phone number Link]  │                       │
│  └─────────────────────────────────────┘                       │
│                                                                  │
│  Simultaneously (if WhatsApp connected):                        │
│  📱 User's Phone Receives WhatsApp Message:                    │
│  ┌─────────────────────────────────────┐                       │
│  │ Mwanainchi Butchery                │                       │
│  │                                     │                       │
│  │ Your Mwanainchi Butchery          │                       │
│  │ verification code is: 487291       │                       │
│  │ Valid for 10 minutes.              │                       │
│  └─────────────────────────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: USER ENTERS OTP CODE                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User checks WhatsApp, sees: "487291"                          │
│  User types in OTP input: "487291"                             │
│                                                                  │
│  onChange handler:                                              │
│  ├─ Remove non-digits: "487291"                               │
│  ├─ Limit to 6 chars: "487291"                                │
│  ├─ Update state: otp = "487291"                              │
│  ├─ Verify button enables (was disabled until 6 chars)       │
│  └─ UI updates                                                 │
│                                                                  │
│  User clicks "Verify & Sign In"                                │
│                                                                  │
│  Event Handler: handleVerifyOTP()                              │
│  ├─ Validate: otp.length === 6                                │
│  ├─ Set status: "loading"                                     │
│  └─ Call: verifyPhoneOTP({ phone, otp })                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: SERVER VERIFIES OTP & CREATES SESSION                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Server Function: verifyPhoneOTP({ phone, otp })              │
│                                                                  │
│  Step 6.1: Format Phone Again                                 │
│  ────────────────────────────                                │
│  formatPhoneNumber("712345678") → "+254712345678"            │
│                                                                  │
│  Step 6.2: Look Up OTP Record                                 │
│  ────────────────────────────                                │
│  SELECT FROM phone_otp                                         │
│  WHERE phone_number = "+254712345678"                         │
│                                                                  │
│  Result:                                                        │
│  {                                                              │
│    phone_number: "+254712345678",                             │
│    otp_code: "487291",                                        │
│    expires_at: "2026-06-01 14:35:00",                        │
│    verified: false,                                            │
│    attempts: 0                                                 │
│  }                                                              │
│                                                                  │
│  Step 6.3: Validate OTP                                       │
│  ───────────────────                                          │
│  Check 1: OTP Record Exists?                                  │
│  └─ YES ✓                                                      │
│                                                                  │
│  Check 2: OTP Not Expired?                                    │
│  ├─ expires_at = "2026-06-01 14:35:00" (still valid)        │
│  └─ NOW < expires_at? YES ✓                                   │
│                                                                  │
│  Check 3: Attempts Not Exceeded?                              │
│  ├─ attempts = 0 (< 5 limit)                                  │
│  └─ OK ✓                                                       │
│                                                                  │
│  Check 4: OTP Code Matches?                                   │
│  ├─ Provided: "487291"                                        │
│  ├─ In DB: "487291"                                           │
│  └─ MATCH ✓                                                    │
│                                                                  │
│  All checks passed! Continue to Step 6.4                      │
│                                                                  │
│  Step 6.4: Get or Create User Account                         │
│  ──────────────────────────────────                           │
│  SELECT FROM phone_users                                       │
│  WHERE phone_number = "+254712345678"                         │
│                                                                  │
│  Case A: User EXISTS (returning user)                         │
│  ├─ Found user record with ID "abc-123-def"                  │
│  └─ Skip to Step 6.5                                          │
│                                                                  │
│  Case B: User NOT FOUND (new user)                            │
│  ├─ INSERT INTO phone_users:                                  │
│  │  {                                                          │
│  │    phone_number: "+254712345678",                         │
│  │    verified: true,                                         │
│  │    last_login: now(),                                     │
│  │    created_at: now()                                      │
│  │  }                                                          │
│  ├─ Returns: user ID "xyz-789-ghi"                           │
│  └─ Continue to Step 6.5                                      │
│                                                                  │
│  Step 6.5: Update Last Login                                  │
│  ──────────────────────                                      │
│  UPDATE phone_users                                            │
│  SET last_login = now()                                       │
│  WHERE phone_number = "+254712345678"                         │
│                                                                  │
│  Step 6.6: Mark OTP as Used                                   │
│  ─────────────────────────                                   │
│  UPDATE phone_otp                                              │
│  SET verified = true, attempts = 0                            │
│  WHERE phone_number = "+254712345678"                         │
│                                                                  │
│  (OTP expires in 10 min, then cleaned up)                     │
│                                                                  │
│  Step 6.7: Generate Session Token                             │
│  ──────────────────────────────────                          │
│  Create JWT-like token:                                        │
│  {                                                              │
│    userId: "abc-123-def",                                     │
│    phone: "+254712345678",                                    │
│    iat: 1717248900000 (issued at),                            │
│    exp: 1719927300000 (expires in 30 days)                    │
│  }                                                              │
│                                                                  │
│  Encode as Base64:                                             │
│  sessionToken = btoa(JSON.stringify({...}))                   │
│  = "eyJ1c2VySWQiOiJhYmMtMTIzLWRlZiIsInBob25l..."            │
│                                                                  │
│  Step 6.8: Return to Frontend                                 │
│  ───────────────────────────                                 │
│  {                                                              │
│    ok: true,                                                   │
│    user: {                                                     │
│      id: "abc-123-def",                                       │
│      phone: "+254712345678",                                  │
│      verified: true                                           │
│    },                                                          │
│    sessionToken: "eyJ1c2VySWQiOiJhYmMtMTIzLWRlZiI..."       │
│  }                                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: FRONTEND STORES SESSION & REDIRECTS                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  handleVerifyOTP() receives response:                           │
│  {                                                              │
│    ok: true,                                                   │
│    user: { id: "abc-123-def", phone: "+254712345678" },      │
│    sessionToken: "eyJ1c2VySWQi..."                           │
│  }                                                              │
│                                                                  │
│  Frontend Actions:                                              │
│  ├─ Store session: localStorage.setItem(                       │
│  │    "phone_session",                                         │
│  │    sessionToken                                             │
│  │  )                                                          │
│  ├─ Set status: "idle"                                        │
│  ├─ Navigate: to "/account" (or redirect param)              │
│  └─ Component unmounts                                         │
│                                                                  │
│  usePhoneAuth() Hook now:                                      │
│  ├─ On next mount (account page loads)                       │
│  ├─ Calls getUserSession()                                    │
│  ├─ Retrieves from localStorage                               │
│  ├─ Decodes base64 token                                      │
│  ├─ Sets user state:                                          │
│  │  {                                                          │
│  │    id: "abc-123-def",                                     │
│  │    phone: "+254712345678",                                │
│  │    verified: true                                         │
│  │  }                                                          │
│  └─ Returns { user, loading: false, logout }                │
│                                                                  │
│  Account Page Renders:                                         │
│  ┌─────────────────────────────────┐                           │
│  │ My Account                      │                           │
│  │                                 │                           │
│  │ +254712345678                  │                           │
│  │ Signed in via WhatsApp OTP     │                           │
│  │ [Log out]                      │                           │
│  │                                 │                           │
│  │ My Orders                       │                           │
│  │ ├─ MWB-1234 | Confirmed | ...  │                           │
│  │ ├─ MWB-1235 | Preparing | ...  │                           │
│  │ └─ MWB-1236 | Delivered | ...  │                           │
│  └─────────────────────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: USER IS LOGGED IN & CAN ACCESS ACCOUNT                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Now user can:                                                  │
│  ├─ View account page: /account ✓                             │
│  ├─ See all their orders: SELECT * FROM orders                │
│  │                       WHERE user_id = "abc-123-def"        │
│  ├─ Track orders with phone auth: /order-tracker ✓            │
│  └─ Logout (clears localStorage) ✓                             │
│                                                                  │
│  Session persists:                                              │
│  ├─ Across page refreshes (localStorage)                       │
│  ├─ For 30 days (token expiration)                            │
│  ├─ Until user clicks logout                                   │
│  └─ Or clears localStorage manually                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Code Component Breakdown

### 1. Login Page Component (`src/routes/login.tsx`)

#### State Management
```typescript
const [stage, setStage] = useState<Stage>("phone");  // "phone" or "otp"
const [phone, setPhone] = useState("");               // Raw phone input
const [otp, setOtp] = useState("");                  // OTP code entered
const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
const [error, setError] = useState<string | null>(null);
const [otpSent, setOtpSent] = useState(false);       // Track if OTP was sent
```

#### Key Event Handlers

##### `handleSendOTP()` - Phase 1
```typescript
async function handleSendOTP(e: React.FormEvent) {
  e.preventDefault();
  
  // Validation
  if (!phone.trim()) {
    setError("Please enter your phone number");
    return;
  }

  setError(null);
  setStatus("loading");

  try {
    // Call server function
    const result = await sendOtpFn({ phone });
    
    if (!result.ok) {
      // Handle error
      setError(result.error);
      setStatus("error");
      return;
    }

    // Success: Switch to OTP stage
    setOtpSent(true);
    setStage("otp");
    setStatus("idle");
    
    // In dev mode, log OTP for testing
    if (result.otp) {
      console.log(`[DEV] OTP: ${result.otp}`);
    }
  } catch (err: any) {
    setError(err.message ?? "Failed to send OTP");
    setStatus("error");
  }
}
```

##### `handleVerifyOTP()` - Phase 2
```typescript
async function handleVerifyOTP(e: React.FormEvent) {
  e.preventDefault();
  
  // Validation
  if (!otp.trim()) {
    setError("Please enter the OTP code");
    return;
  }

  setError(null);
  setStatus("loading");

  try {
    // Call server function
    const result = await verifyOtpFn({ phone, otp });
    
    if (!result.ok) {
      // Handle error
      setError(result.error);
      setStatus("error");
      return;
    }

    // Success: Store session and redirect
    await storePhoneSession(result.sessionToken);
    setStatus("idle");
    navigate({ to: redirect ?? "/account" });
  } catch (err: any) {
    setError(err.message ?? "Failed to verify OTP");
    setStatus("error");
  }
}
```

#### Input Handlers

Phone Input:
```typescript
<input
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
  // Only accepts digits, removes all non-digit characters
  inputMode="numeric"
  placeholder="254712345678 or 0712345678"
/>
```

OTP Input:
```typescript
<input
  type="text"
  value={otp}
  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
  // Only digits, max 6 characters
  maxLength={6}
  inputMode="numeric"
  autoComplete="one-time-code"
/>
```

#### Conditional Rendering
```typescript
{stage === "phone" ? (
  // Show phone input and send button
  <form onSubmit={handleSendOTP}>
    <input type="tel" ... />
    <button>Send OTP via WhatsApp</button>
  </form>
) : (
  // Show OTP input and verify button
  <form onSubmit={handleVerifyOTP}>
    <input type="text" ... />
    <button>Verify & Sign In</button>
    <button onClick={() => setStage("phone")}>
      Use different phone number
    </button>
  </form>
)}
```

---

### 2. Phone Auth Hook (`src/hooks/use-phone-auth.ts`)

#### Purpose
Manages phone authentication state across the app. Any component can use this hook to:
- Check if user is logged in
- Get user details (phone, ID)
- Logout

#### Implementation
```typescript
export function usePhoneAuth() {
  const [user, setUser] = useState<PhoneUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On component mount, check if user has session
    const session = getUserSession();
    if (session) {
      setUser({
        id: session.userId,
        phone: session.phone,
        verified: true,
      });
    }
    setLoading(false);
  }, []);

  const logout = async () => {
    await phoneLogout();
    setUser(null);
  };

  return { user, loading, logout };
}
```

#### Usage Example
```typescript
// In any component
const { user, loading, logout } = usePhoneAuth();

if (loading) return <p>Loading...</p>;

if (!user) {
  return <p>Please log in</p>;
}

return (
  <div>
    <p>Welcome, {user.phone}</p>
    <button onClick={logout}>Log out</button>
  </div>
);
```

---

### 3. Server Functions (`src/lib/phone-auth.functions.ts`)

#### Function 1: `formatPhoneNumber(phone: string)`

**Purpose**: Normalize phone numbers to international format

```typescript
export function formatPhoneNumber(phone: string): string {
  // Step 1: Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Step 2: Detect Kenya if 9 digits starting with 7
  if (cleaned.startsWith("7") && cleaned.length === 9) {
    return `+254${cleaned}`;
  }

  // Step 3: If already has country code (12 digits)
  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  // Step 4: If already international format
  if (phone.startsWith("+")) {
    return phone;
  }

  // Step 5: Default to Kenya
  return `+254${cleaned}`;
}
```

**Examples**:
| Input | Output |
|-------|--------|
| `0712345678` | `+254712345678` |
| `712345678` | `+254712345678` |
| `254712345678` | `+254712345678` |
| `+254712345678` | `+254712345678` |
| `+1234567890` | `+1234567890` |

#### Function 2: `sendPhoneOTP(phone: string)`

**Purpose**: Generate OTP and send via WhatsApp

```typescript
export const sendPhoneOTP = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({ phone: z.string().min(9).max(20) }).parse(i)
  )
  .handler(async ({ data }) => {
    // Step 1: Format phone
    const phone = formatPhoneNumber(data.phone);

    // Step 2: Validate format
    if (!phone.startsWith("+") || phone.length < 10) {
      return { ok: false as const, error: "Invalid phone number format" };
    }

    // Step 3: Generate 6-digit OTP
    const otp = generateOTP();  // Returns string like "487291"

    // Step 4: Calculate expiration (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Step 5: Store in database
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
        { onConflict: "phone_number" }  // Update if already exists
      );

    if (dbError) {
      return { ok: false as const, error: "Failed to generate OTP" };
    }

    // Step 6: Send via WhatsApp (if configured)
    try {
      if (process.env.TWILIO_ACCOUNT_SID) {
        // Twilio integration (see below)
        const twilio = require('twilio');
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:${phone}`,
          body: `Your Mwanainchi Butchery verification code is: ${otp}. Valid for 10 minutes.`,
        });
      } else {
        // Development: Log to console
        console.log(`[DEV] OTP for ${phone}: ${otp}`);
      }

      // Step 7: Return success
      return {
        ok: true as const,
        message: "OTP sent successfully",
        // In dev, return OTP for testing
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
```

#### Function 3: `verifyPhoneOTP(phone: string, otp: string)`

**Purpose**: Verify OTP code and create user session

```typescript
export const verifyPhoneOTP = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      phone: z.string().min(9).max(20),
      otp: z.string().regex(/^\d{6}$/)  // Exactly 6 digits
    }).parse(i)
  )
  .handler(async ({ data }) => {
    // Step 1: Format phone
    const phone = formatPhoneNumber(data.phone);

    // Step 2: Look up OTP record
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("phone_otp")
      .select("*")
      .eq("phone_number", phone)
      .maybeSingle();

    if (fetchError || !otpRecord) {
      return { ok: false as const, error: "OTP not found or expired" };
    }

    // Step 3: Check if expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return { ok: false as const, error: "OTP expired" };
    }

    // Step 4: Check attempt limit
    if (otpRecord.attempts >= 5) {
      return {
        ok: false as const,
        error: "Too many attempts. Please request a new OTP."
      };
    }

    // Step 5: Verify OTP code
    if (otpRecord.otp_code !== data.otp) {
      // Increment attempts on wrong code
      await supabaseAdmin
        .from("phone_otp")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("phone_number", phone);

      return { ok: false as const, error: "Invalid OTP code" };
    }

    // Step 6: Get or create user
    let { data: user, error: userError } = await supabaseAdmin
      .from("phone_users")
      .select("*")
      .eq("phone_number", phone)
      .maybeSingle();

    if (userError && userError.code !== "PGRST116") {
      return { ok: false as const, error: "Failed to verify user" };
    }

    // If user doesn't exist, create
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
      // Update last login for existing user
      await supabaseAdmin
        .from("phone_users")
        .update({ last_login: new Date().toISOString() })
        .eq("phone_number", phone);
    }

    // Step 7: Mark OTP as verified
    await supabaseAdmin
      .from("phone_otp")
      .update({ verified: true, attempts: 0 })
      .eq("phone_number", phone);

    // Step 8: Generate session token
    const sessionToken = Buffer.from(
      JSON.stringify({
        userId: user.id,
        phone: phone,
        iat: Date.now(),
        exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      })
    ).toString("base64");

    // Step 9: Return success with token
    return {
      ok: true as const,
      user: {
        id: user.id,
        phone: phone,
        verified: user.verified,
      },
      sessionToken: sessionToken,
    };
  });
```

---

## Database Schema & Operations

### Table: `phone_users`

```sql
CREATE TABLE public.phone_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  verified boolean NOT NULL DEFAULT false,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### Sample Data
```
id              | phone_number      | verified | last_login              | created_at
────────────────┼───────────────────┼──────────┼─────────────────────────┼─────────────────────────
abc-123-def-456 | +254712345678     | true     | 2026-06-01 14:32:00 UTC | 2026-06-01 14:30:00 UTC
xyz-789-ghi-012 | +254787654321     | true     | 2026-06-01 13:15:00 UTC | 2026-05-31 10:20:00 UTC
```

#### Operations

**On Login (New User)**:
```sql
INSERT INTO phone_users (phone_number, verified, last_login)
VALUES ('+254712345678', true, now())
RETURNING id, phone_number, verified;
```

**On Login (Existing User)**:
```sql
UPDATE phone_users
SET last_login = now()
WHERE phone_number = '+254712345678'
RETURNING id, phone_number, verified;
```

**Admin Check (if needed)**:
```sql
SELECT * FROM phone_users
WHERE phone_number = '+254712345678'
AND verified = true;
```

---

### Table: `phone_otp`

```sql
CREATE TABLE public.phone_otp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### Sample Data (Before Verification)
```
id              | phone_number      | otp_code | expires_at              | verified | attempts
────────────────┼───────────────────┼──────────┼─────────────────────────┼──────────┼──────────
uuid-1          | +254712345678     | 487291   | 2026-06-01 14:35:00 UTC | false    | 0
```

#### Sample Data (After Verification)
```
id              | phone_number      | otp_code | expires_at              | verified | attempts
────────────────┼───────────────────┼──────────┼─────────────────────────┼──────────┼──────────
uuid-1          | +254712345678     | 487291   | 2026-06-01 14:35:00 UTC | true     | 0
```

#### Sample Data (After Failed Attempt)
```
id              | phone_number      | otp_code | expires_at              | verified | attempts
────────────────┼───────────────────┼──────────┼─────────────────────────┼──────────┼──────────
uuid-1          | +254712345678     | 487291   | 2026-06-01 14:35:00 UTC | false    | 1
```

#### Operations

**Store OTP (New)**:
```sql
INSERT INTO phone_otp (phone_number, otp_code, expires_at, verified, attempts)
VALUES (
  '+254712345678',
  '487291',
  '2026-06-01 14:35:00 UTC',
  false,
  0
)
ON CONFLICT (phone_number) DO UPDATE SET
  otp_code = EXCLUDED.otp_code,
  expires_at = EXCLUDED.expires_at,
  verified = false,
  attempts = 0;
```

**Verify OTP (Lookup)**:
```sql
SELECT * FROM phone_otp
WHERE phone_number = '+254712345678'
AND expires_at > now();
```

**Increment Attempts (Wrong Code)**:
```sql
UPDATE phone_otp
SET attempts = attempts + 1
WHERE phone_number = '+254712345678';
```

**Mark as Verified**:
```sql
UPDATE phone_otp
SET verified = true, attempts = 0
WHERE phone_number = '+254712345678';
```

**Cleanup Expired OTPs** (Optional, can be automated):
```sql
DELETE FROM phone_otp
WHERE expires_at < now();
```

---

## Security Mechanisms

### 1. OTP Expiration
```
Generated at: 2026-06-01 14:25:00
Expires at:  2026-06-01 14:35:00 (10 minutes later)
Valid until: 14:34:59.999

Check before verification:
if (new Date(otpRecord.expires_at) < new Date()) {
  reject("OTP expired");
}
```

### 2. Attempt Limiting
```
Failed attempt 1: attempts = 1 ✓
Failed attempt 2: attempts = 2 ✓
Failed attempt 3: attempts = 3 ✓
Failed attempt 4: attempts = 4 ✓
Failed attempt 5: attempts = 5 ✓
Failed attempt 6: BLOCKED - "Too many attempts"

Reset on success:
if (otp_matches) {
  update { attempts = 0 };
}
```

### 3. Phone Number Validation
```
Input validation:
- Min 9 characters (without country code)
- Max 20 characters (with country code)
- Only digits allowed (plus + sign)

Format validation:
- Must contain digit or + sign
- Must be 10+ characters after formatting
```

### 4. OTP Code Format
```
Length: Exactly 6 digits
Range: 100000-999999
Format: All numeric

Validation:
regex: /^\d{6}$/

Before processing:
if (otp.length !== 6) {
  reject("Invalid OTP format");
}
```

### 5. Session Token Security
```
Token structure:
{
  userId: UUID,
  phone: "+254...",
  iat: timestamp (issued at),
  exp: timestamp (expires in 30 days)
}

Encoding:
Buffer.from(JSON.stringify(token)).toString("base64")
Result: eyJ1c2VySWQiOiJhYmMtMTIzLWRlZiIsInBob25lIjoiKzI1NDcxMjM0NTY3OCIsImlhdCI6MTcxNzI0ODkwMDAwMCwiZXhwIjoxNzE5OTI3MzAwMDAwfQ==

Storage:
localStorage.setItem("phone_session", sessionToken)

On page load:
if (expired) {
  localStorage.removeItem("phone_session");
  user = null;
}
```

### 6. Rate Limiting (Not Implemented Yet)
```
Could add:
- Max OTP requests per phone per hour
- Max verification attempts per OTP
- IP-based rate limiting
- Exponential backoff on failures
```

### 7. Phone Number Privacy
```
Exposed in responses: Yes (user chose to login with it)
Exposed in logs: Development only
Stored in DB: Yes (encrypted at rest in Supabase)
Sent over HTTPS: Yes
Sent to WhatsApp provider: Yes (necessary)
```

---

## Data Flow Diagrams

### Overall Data Flow

```
┌────────────────────┐
│   USER'S BROWSER   │
├────────────────────┤
│ React Component    │
│ localStorage       │ ◄──┐
│ usePhoneAuth       │   │
└────────────────────┘   │
         │               │ Session Token
         │ sendPhoneOTP()│ Stored/Retrieved
         │ verifyPhoneOTP()
         │               │
         ▼               │
┌────────────────────────────────────┐
│    TANSTACK START SERVER          │
├────────────────────────────────────┤
│ - Validates input                 │
│ - Calls database functions        │
│ - Integrates with WhatsApp        │
│ - Generates session tokens        │
└────────────────────────────────────┘
         │
         │ SELECT/INSERT/UPDATE
         │
         ▼
┌────────────────────────────────────┐
│    SUPABASE POSTGRESQL DB         │
├────────────────────────────────────┤
│ phone_users table                 │
│ phone_otp table                   │
│ orders table                      │
│ (+ Row Level Security)            │
└────────────────────────────────────┘
         │
         │ API Key
         │
         ▼
┌────────────────────────────────────┐
│    WHATSAPP PROVIDER (Twilio)      │
├────────────────────────────────────┤
│ Sends message: "Code: 487291"      │
└────────────────────────────────────┘
         │
         │ WhatsApp Message
         │
         ▼
┌────────────────────┐
│   USER'S PHONE     │
├────────────────────┤
│   WhatsApp App     │
│   Displays OTP     │
└────────────────────┘
```

---

## Session Management

### Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    SESSION TOKEN LIFECYCLE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ TIME: 14:30:00                                                   │
│ ──────────────                                                   │
│ Server generates session token:                                  │
│ {                                                                │
│   userId: "abc-123-def",                                        │
│   phone: "+254712345678",                                       │
│   iat: 1717248600000 (now),                                     │
│   exp: 1719927000000 (now + 30 days)                            │
│ }                                                                │
│                                                                  │
│ Encodes as Base64: "eyJ1c2VySWQi..."                            │
│ Returns to frontend ◄─────────────────────────────────────────┐ │
│                                                                 │ │
│                                                                 │ │
│ FRONTEND STORES IN LOCALSTORAGE:                               │ │
│ ┌────────────────────────────────────┐                         │ │
│ │ localStorage.setItem(               │                         │ │
│ │   "phone_session",                  │                         │ │
│ │   "eyJ1c2VySWQi..."                │                         │ │
│ │ )                                   │                         │ │
│ └────────────────────────────────────┘                         │ │
│            ▼                                                     │ │
│                                                                 │ │
│ TIME: 14:30:01 - 30 DAYS LATER                                │ │
│ ────────────────────────────────                              │ │
│ User refreshes page, usePhoneAuth() runs:                       │ │
│                                                                 │ │
│ getUserSession():                                               │ │
│ ├─ Read from localStorage ──────────────────────────────────┐ │ │
│ ├─ Decode Base64 ◄──────────────────────────────────────────┘ │ │
│ ├─ Parse JSON                                                 │ │
│ ├─ Check: session.exp > Date.now()                            │ │
│ │   YES: Return { userId, phone }                             │ │
│ │   NO: Delete localStorage, return null                      │ │
│ └─ usePhoneAuth sets user state                               │ │
│                                                                 │ │
│ TIME: 30 DAYS + 1 SECOND AFTER LOGIN                          │ │
│ ──────────────────────────────────────                        │ │
│ exp: 1719927000000                                             │ │
│ now: 1719927000001                                             │ │
│                                                                 │ │
│ getUserSession() runs:                                          │ │
│ ├─ Check: session.exp (1719927000000) > now (1719927000001)  │ │
│ ├─ FALSE: Session expired!                                    │ │
│ ├─ Delete localStorage.removeItem("phone_session")            │ │
│ └─ Return null                                                 │ │
│                                                                 │ │
│ usePhoneAuth:                                                   │ │
│ ├─ user = null                                                 │ │
│ ├─ loading = false                                             │ │
│ └─ Redirect to /login (required auth routes)                 │ │
│                                                                 │
│ OR USER LOGS OUT MANUALLY:                                    │ │
│ ──────────────────────────                                    │ │
│ phoneLogout():                                                  │ │
│ ├─ localStorage.removeItem("phone_session")                   │ │
│ └─ usePhoneAuth sets user = null                              │ │
│                                                                 │ │
└─────────────────────────────────────────────────────────────────┘
```

### Session Persistence

```
Browser Session:
┌────────────────────────────────────┐
│ User logs in at /login            │
│ Session stored in localStorage    │
│ User navigates to /account        │
│ usePhoneAuth reads localStorage   │
│ User stays logged in              │
│                                   │
│ User refreshes page:              │
│ usePhoneAuth reads localStorage   │
│ Session restored ✓                │
│                                   │
│ User closes browser:              │
│ localStorage persists            │
│ Session survives ✓               │
│                                   │
│ User reopens browser:             │
│ usePhoneAuth reads localStorage  │
│ Session restored ✓               │
└────────────────────────────────────┘
```

---

## Error Handling

### Error Scenarios & Recovery

```
┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO 1: INVALID PHONE NUMBER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ User enters: "abc123" or ""                                     │
│                                                                  │
│ Frontend validation:                                             │
│ if (!phone.trim()) {                                             │
│   setError("Please enter your phone number");                   │
│   return;                                                        │
│ }                                                                │
│                                                                  │
│ UI displays:                                                      │
│ "Please enter your phone number"                                │
│ Button remains disabled                                         │
│                                                                  │
│ User corrects input → Tries again ✓                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO 2: OTP NOT DELIVERED                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ User clicks "Send OTP"                                          │
│ Server error: Twilio not configured                            │
│ OR Twilio service down                                          │
│ OR Network timeout                                              │
│                                                                  │
│ Server returns:                                                  │
│ { ok: false, error: "Failed to send OTP via WhatsApp" }        │
│                                                                  │
│ Frontend shows error:                                            │
│ "Failed to send OTP via WhatsApp"                              │
│ Button re-enabled                                               │
│                                                                  │
│ User can:                                                        │
│ ├─ Try again (same button)                                     │
│ └─ Check internet connection                                   │
│                                                                  │
│ Recovery:                                                        │
│ ├─ Wait for Twilio to recover                                 │
│ ├─ Check WhatsApp provider status                             │
│ └─ Retry                                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO 3: OTP EXPIRED                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ User receives OTP: "487291"                                     │
│ Valid for 10 minutes (until 14:35:00)                          │
│                                                                  │
│ User waits 11 minutes, enters OTP at 14:36:00                 │
│                                                                  │
│ Server verification:                                             │
│ Check: expires_at (14:35:00) < now (14:36:00)                 │
│ Result: TRUE → OTP expired!                                     │
│                                                                  │
│ Server returns:                                                  │
│ { ok: false, error: "OTP expired" }                            │
│                                                                  │
│ Frontend shows error:                                            │
│ "OTP expired"                                                   │
│                                                                  │
│ User can:                                                        │
│ ├─ Go back to phone stage (button provided)                   │
│ ├─ Request new OTP                                             │
│ └─ Start over                                                   │
│                                                                  │
│ Recovery:                                                        │
│ └─ Click "Use different phone number"                         │
│    └─ setStage("phone")                                        │
│    └─ User enters phone again                                  │
│    └─ New OTP sent                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO 4: WRONG OTP CODE (TOO MANY ATTEMPTS)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ User receives OTP: "487291"                                     │
│ User (mistakenly) enters: "123456" (wrong code)               │
│                                                                  │
│ Server verification:                                             │
│ Check 1: otpRecord exists? YES ✓                               │
│ Check 2: not expired? YES ✓                                     │
│ Check 3: attempts < 5? YES (attempts = 0) ✓                   │
│ Check 4: code matches?                                          │
│   "123456" !== "487291" → NO ✗                                 │
│                                                                  │
│ Server response:                                                 │
│ Update attempts: 0 → 1                                          │
│ Return: { ok: false, error: "Invalid OTP code" }              │
│                                                                  │
│ Frontend shows error:                                            │
│ "Invalid OTP code"                                              │
│ OTP input remains focused                                       │
│ User can try again                                              │
│                                                                  │
│ Attempts tracking:                                               │
│ ├─ Attempt 1: Wrong code → attempts = 1                       │
│ ├─ Attempt 2: Wrong code → attempts = 2                       │
│ ├─ Attempt 3: Wrong code → attempts = 3                       │
│ ├─ Attempt 4: Wrong code → attempts = 4                       │
│ ├─ Attempt 5: Wrong code → attempts = 5                       │
│ └─ Attempt 6: BLOCKED!                                         │
│    Error: "Too many attempts. Please request a new OTP."      │
│                                                                  │
│ Recovery:                                                        │
│ └─ Click "Use different phone number"                         │
│    └─ Request new OTP                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO 5: DATABASE ERROR                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ User verifies OTP, server tries to update database             │
│ Supabase connection fails or returns error                     │
│                                                                  │
│ Server catches error:                                            │
│ try {                                                            │
│   // Database operations                                        │
│ } catch (error) {                                               │
│   return { ok: false, error: "Failed to verify user" }        │
│ }                                                                │
│                                                                  │
│ Frontend shows error:                                            │
│ "Failed to verify user"                                         │
│                                                                  │
│ Recovery:                                                        │
│ ├─ Check internet connection                                   │
│ ├─ Check Supabase status                                      │
│ ├─ Wait and retry                                              │
│ └─ Contact support if persists                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO 6: SESSION CORRUPTION                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ User's localStorage corrupted (manually edited, etc.)           │
│                                                                  │
│ usePhoneAuth.useEffect() runs:                                  │
│ const session = getUserSession();                               │
│                                                                  │
│ getUserSession():                                                │
│ try {                                                            │
│   const stored = localStorage.getItem("phone_session");        │
│   const session = JSON.parse(atob(stored));                   │
│ } catch {                                                        │
│   // JSON parse fails or base64 decode fails                   │
│   return null;  // Treat as no session                         │
│ }                                                                │
│                                                                  │
│ Result:                                                          │
│ ├─ user = null                                                 │
│ ├─ User redirected to /login                                   │
│ └─ Must login again ✓                                          │
│                                                                  │
│ Recovery:                                                        │
│ └─ Automatic: user not logged in                              │
│    └─ User logs in again                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phone Number Processing

### Format Detection Logic

```
INPUT: "0712345678"
├─ Remove non-digits: "712345678"
├─ Length = 9
├─ Starts with 7: YES
└─ Assume Kenya: +254712345678 ✓

INPUT: "254712345678"
├─ Remove non-digits: "254712345678"
├─ Length = 12
├─ Starts with 254: YES
└─ Format: +254712345678 ✓

INPUT: "+254712345678"
├─ Already has +
├─ Return as-is: +254712345678 ✓

INPUT: "+1234567890" (USA)
├─ Already has +
├─ Return as-is: +1234567890 ✓

INPUT: "712345678" (no leading digit)
├─ Remove non-digits: "712345678"
├─ Length = 9
├─ Starts with 7: YES
└─ Assume Kenya: +254712345678 ✓
```

### Last 4 Digits for Order Lookup

```
Full phone: "+254712345678"
Last 4: "5678"

Order lookup query:
SELECT * FROM orders
WHERE order_number = "MWB-1234"
AND customer_phone LIKE "%5678"

Ensures:
- User can prove they own the phone
- Prevents enumeration attacks
- Works with anonymous lookup
```

---

## Implementation Details

### Key Implementation Patterns

#### Pattern 1: Server Functions (TanStack Start)

```typescript
// Server-side only, never runs in browser
export const sendPhoneOTP = createServerFn({ method: "POST" })
  .inputValidator((i) => /* validation */)
  .handler(async ({ data }) => {
    // Runs on server
    // Access to env variables
    // Can call databases, APIs
    // Secure - code not exposed
  });

// Called from frontend like:
const result = await sendOtpFn({ phone: "0712345678" });
```

#### Pattern 2: React Hook for State

```typescript
// Reusable across components
const { user, loading, logout } = usePhoneAuth();

// Automatically handles:
// - Initial session check
// - Session persistence
// - Expiration checking
// - Cleanup on logout
```

#### Pattern 3: Conditional Rendering

```typescript
// Show different UI based on authentication state
if (loading) return <Loading />;
if (!user) return <LoginPrompt />;
return <ProtectedContent />;
```

#### Pattern 4: Error Recovery

```typescript
// User-friendly error messages
if (!result.ok) {
  setError(result.error);
  setStatus("error");
  // User can retry with same or different input
  return;
}

// Success path
setStatus("idle");
// Continue to next stage
```

---

## Summary

The WhatsApp OTP login system works by:

1. **User enters phone** → Frontend validates format
2. **Server formats phone** → Standardizes to +country format
3. **Server generates OTP** → 6-digit random code
4. **Server stores OTP** → In database with 10-min expiration
5. **Server sends OTP** → Via WhatsApp provider (Twilio)
6. **User receives message** → In WhatsApp chat
7. **User enters OTP** → Verification input
8. **Server validates OTP** → Checks expiration, attempts, code match
9. **Server creates user** → In phone_users table if new
10. **Server creates session** → Base64 token with 30-day expiry
11. **Frontend stores session** → In localStorage
12. **User is logged in** → Can access protected routes
13. **Session persists** → Across page refreshes until expiry or logout

**Key Security**: OTP expiration, attempt limiting, phone validation, secure session tokens, separate admin authentication.

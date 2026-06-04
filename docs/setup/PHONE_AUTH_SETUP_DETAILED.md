# Phone Authentication & Test Number Setup Guide

## Quick Start

This guide walks you through setting up customer phone authentication with the test number 0769282033 for receiving WhatsApp OTPs.

---

## Test Credentials

- **Test Phone Number**: 0769282033 (or +254769282033)
- **Test WhatsApp Account**: "Mwanainchi test phone number"
- **Default Admin Email**: admin@mwanainchi.co.ke
- **Default Admin Password**: MwanainchiAdmin2026!

---

## Phase 1: Local Development (In-Memory OTP)

### How It Works

In development mode, OTPs are generated and displayed in the browser console instead of sending via WhatsApp.

### Testing Steps

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Visit Login Page**
   ```
   http://localhost:5173/login
   ```

3. **Enter Test Phone Number**
   - Accept any format: `0769282033`, `254769282033`, or `+254769282033`
   - System automatically normalizes to `+254769282033` format

4. **Check Console for OTP**
   ```javascript
   // Browser console output (F12 > Console):
   [DEV] OTP for +254769282033: 123456
   ```

5. **Enter OTP**
   - Go back to the browser login form
   - Enter the 6-digit OTP code
   - Click "Verify"

6. **Success**
   - Redirected to account page
   - Phone number shown: 0769282033
   - Can now track orders

---

## Phase 2: Production Setup (Twilio WhatsApp)

### Step 1: Create Twilio Account

1. Go to https://www.twilio.com
2. Sign up for a free account
3. Verify your phone number
4. Navigate to **Console Home**

### Step 2: Get WhatsApp Credentials

1. In Twilio console, go to **Messaging > WhatsApp**
2. Choose either:
   - **Sandbox** (easiest, for testing)
   - **Production** (requires registration, for live)

3. For **Sandbox**:
   - You get a pre-configured WhatsApp number
   - Customers must "join" with specific message first
   - Perfect for MVP testing

4. **Copy Your Credentials**:
   - Account SID (looks like: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
   - Auth Token (looks like: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
   - WhatsApp Number (looks like: whatsapp:+1234567890)

### Step 3: Add Environment Variables

Create a `.env.local` file in your project root:

```env
# Twilio WhatsApp Configuration
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Other existing env vars
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Important**: Never commit `.env.local` to git. Add to `.gitignore`:
```
.env.local
```

### Step 4: Enable Twilio in Code

**File**: `src/lib/phone-auth.functions.ts`

Find the `sendPhoneOTP` function and uncomment the Twilio section:

```typescript
// Around line 50-80, look for:

// TWILIO_INTEGRATION - uncomment this block
if (process.env.VITE_TWILIO_ACCOUNT_SID) {
  const accountSid = process.env.VITE_TWILIO_ACCOUNT_SID;
  const authToken = process.env.VITE_TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.VITE_TWILIO_WHATSAPP_NUMBER;
  
  const twilio = require('twilio')(accountSid, authToken);
  
  await twilio.messages.create({
    from: whatsappNumber,
    to: `whatsapp:${phoneNumber}`,
    body: `Your Mwanainchi Butchery OTP is: ${otpCode}\n\nValid for 10 minutes.`
  });
} else {
  // Fallback: log to console in development
  console.log(`[DEV] OTP for ${phoneNumber}: ${otpCode}`);
}
```

### Step 5: Install Twilio Package

```bash
npm install twilio
```

### Step 6: Test with Sandbox

**For Twilio Sandbox Testing**:

1. Customer joins the sandbox with test message
2. Send from Twilio dashboard: "join word-word" to join sandbox
3. Then customer can receive OTPs

**Send test message to confirm setup**:
```
curl -X POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages \
  -d "From=whatsapp:+1234567890" \
  -d "To=whatsapp:+254769282033" \
  -d "Body=Test message" \
  -u {AccountSid}:{AuthToken}
```

---

## Phase 3: Handling Different Phone Formats

The system accepts multiple phone formats:

| Input | Stored As | Usage |
|-------|-----------|-------|
| `0769282033` | `+254769282033` | Local format |
| `254769282033` | `+254769282033` | Without + |
| `+254769282033` | `+254769282033` | International (preferred) |

**Important**: For WhatsApp, always use: `whatsapp:+254769282033`

---

## Testing Checklist

### Development (Console OTP)
- [ ] Open `/login` page
- [ ] Enter test phone: `0769282033`
- [ ] Check browser console (F12) for OTP
- [ ] Enter OTP and verify
- [ ] Redirected to account page
- [ ] Phone number shown correctly

### Production (Twilio)
- [ ] Environment variables set
- [ ] Twilio package installed
- [ ] Twilio code uncommented
- [ ] Test WhatsApp number joined sandbox
- [ ] Send OTP request
- [ ] Receive WhatsApp message
- [ ] OTP code in message matches
- [ ] Can verify and login

---

## Customer Login Flow

```
┌─────────────────────────────────────────────┐
│ 1. CUSTOMER VISITS LOGIN                    │
│    URL: /login                              │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ 2. ENTER PHONE NUMBER                       │
│    Format: 0769282033 or +254769282033      │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ 3. SEND OTP                                 │
│    Dev: Shows in console                    │
│    Prod: Sent via WhatsApp                  │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ 4. CUSTOMER RECEIVES OTP                    │
│    Example: "Your OTP is: 123456"           │
│    Valid for 10 minutes                     │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ 5. ENTER OTP IN LOGIN FORM                  │
│    Input: 123456                            │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ 6. VERIFY OTP                               │
│    ✓ Correct = User session created         │
│    ✗ Incorrect = "Invalid OTP" error        │
│    Max 5 attempts per OTP                   │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│ 7. LOGIN SUCCESSFUL                         │
│    Redirected to /account or /order-tracker │
│    Session stored in localStorage           │
└─────────────────────────────────────────────┘
```

---

## Security Features

✅ **Implemented**:
- OTP expires in 10 minutes
- Maximum 5 failed attempts
- Phone number stored in international format
- Session token base64 encoded
- SQL injection prevention via prepared statements
- HTTPS ready

✅ **Recommended for Production**:
- Enable HTTPS only
- Set secure cookie flags
- Implement rate limiting (max 3 OTPs per hour per number)
- Add CSRF protection
- Monitor failed login attempts

---

## Troubleshooting

### OTP Not Appearing in Console
**Problem**: Opened login but no console message
**Solution**:
1. Open browser DevTools (F12)
2. Click "Console" tab
3. Look for `[DEV]` prefix messages
4. If not there, check if Twilio env vars are set

### WhatsApp Message Not Received
**Problem**: OTP sent but message never arrives
**Solutions**:
1. Confirm phone number is correct: `+254769282033`
2. Check Twilio account has credit
3. Verify Twilio WhatsApp sandbox has your number
4. In Twilio dashboard, check message logs for errors
5. Confirm network connectivity on customer phone

### "Invalid OTP" Error
**Problem**: Entered OTP but says invalid
**Solutions**:
1. Verify you're entering the correct 6 digits
2. Check OTP hasn't expired (10 minute limit)
3. Try requesting a new OTP
4. Ensure no extra spaces in input

### Can't Login After OTP
**Problem**: OTP verified but not logged in
**Solutions**:
1. Check browser allows localStorage
2. Refresh page - might be redirect issue
3. Try incognito/private mode
4. Check browser console for JavaScript errors

---

## Environment Variables Reference

### Required (for Twilio)
```env
VITE_TWILIO_ACCOUNT_SID=your_account_sid_here
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

### Optional
```env
# For development, set to disable Twilio
VITE_DEV_MODE=true

# For custom OTP expiration (in minutes)
VITE_OTP_EXPIRY_MINUTES=10

# For max failed attempts
VITE_MAX_OTP_ATTEMPTS=5
```

---

## Next Steps

1. ✅ Understand phone auth flow
2. ✅ Set up test with console OTPs
3. ⏳ Configure Twilio account
4. ⏳ Add environment variables
5. ⏳ Test with Twilio sandbox
6. ⏳ Deploy to production

---

## Support Resources

- **Twilio WhatsApp Docs**: https://www.twilio.com/docs/whatsapp
- **Twilio Sandbox Guide**: https://www.twilio.com/docs/whatsapp/sandbox
- **Phone Auth Implementation**: See `src/lib/phone-auth.functions.ts`
- **Database Schema**: See `supabase/migrations/20260601000000_add_phone_auth_tables.sql`

---

*Last Updated: June 1, 2026*
*Version: 2.0*

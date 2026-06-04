# WhatsApp OTP Authentication Implementation Guide

## Overview
This guide explains the WhatsApp OTP-based authentication system implemented in Mwanainchi Butchery. Customers login with phone number and WhatsApp verification, while admins use email + password authentication.

## Architecture

### Authentication Separation
- **Customer Login**: Phone number + WhatsApp OTP
- **Admin Login**: Email + Password via Supabase
- **Order Tracking**: Available to both authenticated and anonymous users

### Files Modified/Created

#### New Files
1. **`src/lib/phone-auth.functions.ts`** - Server-side phone authentication logic
2. **`src/hooks/use-phone-auth.ts`** - React hook for phone auth state management
3. **`supabase/migrations/20260601000000_add_phone_auth_tables.sql`** - Database migrations

#### Updated Files
1. **`src/routes/login.tsx`** - Replaced with phone/OTP authentication
2. **`src/routes/order-tracker.tsx`** - Added sign-in prompt for authenticated tracking
3. **`src/hooks/use-auth.ts`** - Remains for admin authentication

## Database Schema

### phone_users Table
```sql
id (UUID) - Primary key
phone_number (TEXT) - Unique phone number (international format)
verified (BOOLEAN) - Account verification status
last_login (TIMESTAMPTZ) - Last login timestamp
created_at (TIMESTAMPTZ) - Account creation time
updated_at (TIMESTAMPTZ) - Last update time
```

### phone_otp Table
```sql
id (UUID) - Primary key
phone_number (TEXT) - Unique phone number
otp_code (TEXT) - 6-digit OTP code
expires_at (TIMESTAMPTZ) - OTP expiration time (10 minutes)
verified (BOOLEAN) - Whether OTP was used
attempts (INTEGER) - Failed attempt counter (max 5)
created_at (TIMESTAMPTZ) - Creation time
```

## Setup Instructions

### 1. Apply Database Migrations
Run the migration to create the required tables:

```bash
# If using Supabase CLI
supabase migration up

# Or apply via Supabase dashboard
# Copy the migration SQL from: supabase/migrations/20260601000000_add_phone_auth_tables.sql
```

### 2. Configure WhatsApp Integration

#### Option A: Twilio (Recommended for Production)

1. **Create Twilio Account**
   - Go to https://www.twilio.com
   - Sign up and create an account
   - Verify your phone number

2. **Enable WhatsApp Messaging**
   - Navigate to Messaging > WhatsApp
   - Create a new sandbox or use Production
   - Get your Twilio WhatsApp number

3. **Set Environment Variables**
   - Add to your `.env.local` or deployment environment:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
   ```

4. **Uncomment WhatsApp Integration**
   - Edit `src/lib/phone-auth.functions.ts`
   - Uncomment the Twilio integration code in `sendPhoneOTP` function
   - Install Twilio package: `npm install twilio`

#### Option B: Firebase Phone Authentication
1. Enable Phone Authentication in Firebase Console
2. Configure WhatsApp as a provider
3. Implement custom bridge to Firebase

#### Option C: Custom WhatsApp Business API
1. Register as a WhatsApp Business API partner
2. Implement custom HTTP request handler in `sendPhoneOTP`

### 3. Environment Variables
Create or update your `.env.local`:

```env
# Supabase (existing)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WhatsApp Provider (Choose one)
# Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Node Environment
NODE_ENV=development
```

## Usage Flow

### Customer Login Flow
1. Customer visits `/login`
2. Enters phone number (accepts: 0712345678, 254712345678, +254712345678)
3. System sends 6-digit OTP via WhatsApp
4. Customer enters OTP within 10 minutes
5. System verifies OTP and creates/updates user record
6. Session token stored in `localStorage`
7. User redirected to `/account` or original destination

### Customer Account Access
- **Account Page** (`/account`): Shows orders for authenticated phone user
- **Order Tracker** (`/order-tracker`): 
  - Authenticated users see their orders automatically
  - Anonymous users can lookup by order number + phone last 4 digits

### Admin Login Flow
- **Admin Login** (`/admin-login`): Uses Supabase email + password (separate)
- **Admin Panel** (`/admin`): Requires Supabase auth with admin role

## Development Testing

### Testing Without Twilio
In development, OTP codes are logged to console:

```javascript
// In browser console or server logs:
[DEV] OTP for +254712345678: 123456
```

For testing, use the displayed OTP in the verification step.

### Session Testing
Session token is stored in localStorage. To test:

```javascript
// In browser console
localStorage.getItem('phone_session')
```

Output shows session data with userId and phone.

## Production Checklist

- [ ] WhatsApp provider configured (Twilio/Firebase/Custom)
- [ ] Environment variables set on deployment platform
- [ ] Database migrations applied to production
- [ ] HTTPS enabled (required for secure session tokens)
- [ ] OTP timeout set appropriately (currently 10 minutes)
- [ ] Test flow: send OTP → verify → login → view orders
- [ ] Test admin login still works (should be unchanged)
- [ ] Test order tracking (both authenticated and anonymous)
- [ ] Monitor OTP delivery success rate
- [ ] Set up cleanup for expired OTPs (optional cron job)

## Phone Number Format Handling

The system automatically normalizes phone numbers:
- `0712345678` → `+254712345678` (assumes Kenya)
- `254712345678` → `+254712345678`
- `+254712345678` → `+254712345678` (unchanged)

Supports 9-12 digit inputs. Adjust in `formatPhoneNumber()` for different regions.

## Security Considerations

1. **OTP Expiration**: 10 minutes by default (adjustable in code)
2. **Attempt Limits**: 5 failed attempts before requiring new OTP
3. **Session Storage**: Tokens stored in localStorage (vulnerable to XSS)
   - Consider adding CSRF protection
   - Implement Content Security Policy
4. **Phone Number Privacy**: Phone numbers not exposed in API responses
5. **Admin Separation**: Admin auth completely separate from customer phone auth

## Troubleshooting

### OTP Not Received
1. Check WhatsApp provider integration is configured
2. Verify phone number is in correct international format
3. Check provider logs (Twilio dashboard, Firebase console, etc.)
4. Ensure WhatsApp Business API connection is active

### Customer Can't Login
1. Check phone number format
2. Verify OTP hasn't expired (10 minutes)
3. Check attempt limit (max 5 failed attempts)
4. Clear localStorage if session token is corrupted

### Admin Login Not Working
- Verify email is `admin@mwanainchi.co.ke`
- Check admin user exists (should be auto-created)
- Ensure Supabase auth is still working

## Future Enhancements

1. **Email Fallback**: Send OTP via email if WhatsApp fails
2. **SMS OTP**: Add SMS as alternative to WhatsApp
3. **Biometric Auth**: Support fingerprint/face ID on mobile
4. **Session Management**: Add device management to account page
5. **Rate Limiting**: Implement IP-based rate limiting
6. **Analytics**: Track auth success rates and issues

## Support & Maintenance

### Regular Tasks
- Monitor OTP delivery rates
- Check failed login attempts
- Review cleanup of expired OTPs
- Update WhatsApp provider credentials if needed

### Debugging
- Check server logs in deployment platform
- Monitor Twilio/Firebase dashboards
- Review database logs for errors
- Use browser DevTools to check localStorage and network

---

**Last Updated:** June 1, 2026

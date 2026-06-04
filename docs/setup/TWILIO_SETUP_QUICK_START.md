# Quick Start: WhatsApp OTP Setup with Twilio

## Prerequisites
- Twilio account (free trial available at https://www.twilio.com)
- Mwanainchi Butchery codebase
- Access to your deployment environment

## Step-by-Step Setup

### 1. Create Twilio Account (5 minutes)
1. Visit https://www.twilio.com/try-twilio
2. Sign up with email and phone number
3. Verify your email and phone
4. Create a new project

### 2. Get WhatsApp Sandbox Credentials (2 minutes)
1. In Twilio Console, go to **Messaging → WhatsApp**
2. Click on **Sandbox** (recommended for testing)
3. You'll see your sandbox number like: `+1234567890` (remember this)
4. You'll need to test by sending "join" message from your phone first

### 3. Get API Credentials (1 minute)
1. Go to **Account → API keys & tokens**
2. Copy your:
   - **Account SID** (starts with AC...)
   - **Auth Token** (keep this secret!)
3. Store these securely

### 4. Update Code (2 minutes)
In `src/lib/phone-auth.functions.ts`, uncomment the Twilio section:

```typescript
// Find this section around line 80:
try {
  const twilio = require('twilio');  // ← UNCOMMENT
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);  // ← UNCOMMENT
  
  await client.messages.create({  // ← UNCOMMENT
    from: 'whatsapp:+14155552671', // ← CHANGE THIS
    to: `whatsapp:${phone}`,
    body: `Your Mwanainchi Butchery verification code is: ${otp}. Valid for 10 minutes.`,
  });  // ← UNCOMMENT
  
  // Comment out the console.log line below:
  // console.log(`[DEV] OTP for ${phone}: ${otp}`);
}
```

Change the sandbox number `+14155552671` to your actual Twilio WhatsApp number.

### 5. Install Twilio Package (1 minute)
```bash
npm install twilio
```

### 6. Set Environment Variables

#### For Local Development (.env.local)
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155552671
```

#### For Vercel Deployment
1. Go to your Vercel project settings
2. Go to **Settings → Environment Variables**
3. Add:
   - `TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - `TWILIO_AUTH_TOKEN=your_auth_token_here`
   - `TWILIO_WHATSAPP_NUMBER=whatsapp:+14155552671`
4. Redeploy your application

#### For Other Platforms
- **Netlify**: Go to Site settings → Build & deploy → Environment
- **AWS**: Use Systems Manager Parameter Store or Secrets Manager
- **Docker**: Pass as environment variables

### 7. Test the Integration (5 minutes)

#### Local Testing
1. Opt in to Twilio sandbox:
   - Open WhatsApp on your phone
   - Message: `join <join_code>` to Twilio's sandbox number
   - You'll receive a confirmation
   
2. Test login:
   - Go to http://localhost:5173/login (or your dev URL)
   - Enter your phone number
   - Check WhatsApp - you should receive OTP within 30 seconds
   - Enter OTP and login

#### Vercel/Production Testing
- Same process, just use your production URL

### 8. Move to Production (Optional)
When ready for production:

1. **In Twilio Console:**
   - Go to WhatsApp → Sender Identity
   - Request a phone number or apply for business verification
   - Upgrade from Sandbox to Production mode

2. **Update Environment Variables:**
   - Change `TWILIO_WHATSAPP_NUMBER` to your production number

3. **Test Again:**
   - Full end-to-end test with new number

## Troubleshooting

### "OTP not received"
**Possible causes:**
- Twilio service is not activated
- Phone number not opted into sandbox
- Twilio credentials not set correctly

**Solution:**
1. Check Twilio Console → WhatsApp → Sandbox
2. Send the join message from your phone
3. Verify environment variables are set correctly
4. Check Twilio logs under Messaging → WhatsApp → Conversations

### "400 Bad Request Error"
**Possible cause:** WhatsApp number format is wrong

**Solution:**
- Ensure number is in format: `whatsapp:+1234567890`
- Not `+1234567890` or `whatsapp:1234567890`

### "Invalid Credentials"
**Possible cause:** Account SID or Auth Token is wrong

**Solution:**
1. Double-check credentials in Twilio Console
2. Paste them fresh (don't copy old values)
3. Ensure no extra spaces or characters

### "API Not Found"
**Possible cause:** Twilio package not installed

**Solution:**
```bash
npm install twilio --save
npm run dev  # Restart dev server
```

## Testing Without Sending Real Messages

In development mode, the system logs OTPs to console:
```
[DEV] OTP for +254712345678: 123456
```

To stay in development mode without Twilio:
1. Don't uncomment the Twilio code
2. OTPs will log to console
3. Use logged OTP to verify

## Cost Considerations

Twilio WhatsApp pricing (as of 2024):
- **Sandbox (Testing)**: Free (limited to 5 phone numbers)
- **Production**: ~$0.0200 per conversation (setup) + $0.0017 per message
- **Inbound messages**: Free

Typical cost per user login: ~$0.002 (very cheap!)

## Next Steps

1. ✅ Set up Twilio
2. ✅ Configure code
3. ✅ Test locally
4. ✅ Deploy to production
5. Deploy updated code
6. Test on production URL
7. Monitor Twilio dashboard for metrics

## Useful Links
- Twilio Dashboard: https://www.twilio.com/console
- WhatsApp API Docs: https://www.twilio.com/docs/whatsapp/api
- Send WhatsApp Messages: https://www.twilio.com/docs/whatsapp/tutorial/send-and-receive-messages-nodejs

## Support
- Twilio Support: support@twilio.com
- Twilio Docs: https://www.twilio.com/docs
- WhatsApp Sandbox Help: https://www.twilio.com/docs/whatsapp/sandbox

---

**Note**: Once completed, users can login with just their phone number and WhatsApp! 🎉

# Mwanainchi Butchery - Admin Panel Enhancement Guide

## Overview
This document covers the complete implementation of enhanced admin features for the Mwanainchi Butchery platform, including secure admin login, order management with delivery tracking, real-time inventory POS sync, and blog image uploads.

---

## Table of Contents
1. [Database Setup](#database-setup)
2. [Phone Authentication Enhancement](#phone-authentication-enhancement)
3. [Admin Dashboard Features](#admin-dashboard-features)
4. [POS Inventory Sync](#pos-inventory-sync)
5. [Blog Image Upload System](#blog-image-upload-system)
6. [WhatsApp Notifications](#whatsapp-notifications)
7. [Testing & Deployment](#testing--deployment)

---

## Database Setup

### Apply Migrations
The following migration file adds all necessary tables and structures:
- **File**: `supabase/migrations/20260601000001_enhance_admin_orders_and_pos.sql`

**To apply**:
```bash
# If using Supabase CLI
supabase migration up

# Or manually in Supabase Dashboard:
# Copy-paste the migration SQL into the SQL Editor
```

### New Tables Created

#### 1. `admin_accounts`
Multi-admin support with role-based access control.
- Fields: `user_id`, `full_name`, `email`, `phone`, `role`, `is_active`, `last_login_at`
- Roles: `manager`, `viewer`, `super_admin`

#### 2. `order_notifications`
Tracks WhatsApp notifications sent to customers.
- Status tracking: `pending`, `sent`, `failed`
- Automatic retry with configurable limits
- Links orders to phone numbers for tracking

#### 3. `pos_sync_logs`
Tracks all inventory sync operations from your butchery POS.
- Status: `pending`, `syncing`, `success`, `failed`
- Metrics: items synced, duration, error messages
- Timestamp auditing for compliance

#### 4. `blog_uploads`
Manages blog post image uploads.
- Stores file metadata, S3 URLs, upload history
- Links images to blog posts
- User attribution for audit trails

#### 5. `whatsapp_queue`
Message queue for reliable WhatsApp delivery.
- Automatic retry logic
- Delivery status tracking
- Related order linking

### Indexes Created
Indexes added for optimal query performance:
- `order_notifications_delivery_status` - Fast notification filtering
- `pos_sync_logs_sync_status` - Quick sync history lookup
- `whatsapp_queue_status` - Queue processing efficiency
- `orders_customer_phone`, `orders_status`, `orders_created_at`

### Real-time Notifications
PostgreSQL triggers set up for real-time updates:
- `inventory_change_notification` - Broadcast stock changes
- `order_change_notification` - Broadcast order status updates

These enable WebSocket subscriptions for live dashboard updates.

---

## Phone Authentication Enhancement

### Current Implementation
Phone auth is already functional with:
- OTP generation & verification (10-minute expiration)
- 5-attempt limit before requiring new OTP
- International phone number support (+254 format for Kenya)
- Session token storage in localStorage

### Configuration for Test Number

**File**: `src/lib/phone-auth.functions.ts`

To set up test number (0769282033):

```typescript
// In sendPhoneOTP function, add this for testing:
if (phoneNumber === "+254769282033" || phoneNumber === "0769282033") {
  // In development, log OTP to console
  if (!process.env.VITE_TWILIO_ACCOUNT_SID) {
    console.log(`[DEV] OTP for ${phoneNumber}: ${otpCode}`);
  }
}
```

### WhatsApp Integration (Twilio)

1. **Get Twilio Credentials**:
   - Sign up at https://www.twilio.com
   - Navigate to Messaging > WhatsApp > Sandbox
   - Note your: `ACCOUNT_SID`, `AUTH_TOKEN`, `WHATSAPP_NUMBER`

2. **Add Environment Variables**:
   ```
   VITE_TWILIO_ACCOUNT_SID=your_account_sid
   VITE_TWILIO_AUTH_TOKEN=your_auth_token
   VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
   ```

3. **Uncomment Twilio Code**:
   In `src/lib/phone-auth.functions.ts`, uncomment the Twilio OTP sending block in `sendPhoneOTP()`.

### Customer Login Flow
```
Customer visits /login
  ↓
Enters phone number (format flexible: 0769282033, 254769282033, +254769282033)
  ↓
OTP sent via WhatsApp
  ↓
Customer enters OTP
  ↓
Verified → User session created
  ↓
Can now track orders & manage account
```

---

## Admin Dashboard Features

### New Admin Dashboard Layout

**Tabs Available**:
1. **Orders** - Full order lifecycle management
2. **Inventory** - Stock management & tracking
3. **POS Sync** - Real-time inventory sync with butchery workstation
4. **Blog** - Content management with image uploads

### Orders Tab

#### Features
- **Order Summary Cards**: Quick stats (Pending, Preparing, Ready, Delivered)
- **Order Table**: All orders with:
  - Order number & customer details
  - Item count & total amount
  - Current status (dropdown to update)
  - Delivery status tracking
  - Last action timestamp

#### Order Detail Modal
Click "Track" button on any order to open detailed view:
- Complete order items list
- Customer phone number (for WhatsApp contact)
- Delivery address (if applicable)
- Delivery status progression:
  ```
  Pending → Assigned → Picked Up → In Transit → Delivered
  ```
- Optional delivery notes field

#### Order Status Workflow
```
pending (order received)
  ↓
confirmed (admin acknowledges)
  ↓
preparing (kitchen working)
  ↓
ready_for_pickup
  ├─→ (for pickup orders) delivered
  └─→ (for delivery) out_for_delivery → delivered
```

### Inventory Tab

**Current Features** (Unchanged):
- Stock level management
- Low-stock alerts
- Supplier tracking
- Sync from menu catalog

---

## POS Inventory Sync

### New "POS Sync" Tab

This is the enhanced inventory management system for real-time syncing with your butchery workstation.

#### Features

**1. Manual Sync Controls**
```
┌─────────────────────────────────────────┐
│ Manual POS Sync                         │
├─────────────────────────────────────────┤
│ POS API Endpoint: [________________]    │
│ (e.g., http://butchery-pos:3000/api) │
│                                        │
│ [🔄 Sync Now]  (Syncing...)           │
└─────────────────────────────────────────┘
```

**2. Sync History Dashboard**
- Summary stats: Successful syncs, Failed, Average duration
- Detailed history log with:
  - Sync status (✓ Success or ✗ Failed)
  - Items synced count
  - Duration in milliseconds
  - Error messages (if any)
  - Exact timestamp

#### How to Use

**Step 1: Configure POS API Endpoint**
```bash
# Butchery workstation runs POS system
# It must expose an API endpoint returning:
GET /api/inventory
Response:
[
  {
    "product_slug": "beef-steak",
    "product_name": "Beef Steak",
    "stock_kg": 45.5
  },
  ...
]
```

**Step 2: Enter Endpoint in Admin Dashboard**
- Go to Admin > POS Sync tab
- Paste your endpoint: `http://butchery-pos-ip:3000/api/inventory`
- Click "Sync Now"

**Step 3: Monitor Results**
- View sync history immediately
- Check for any error messages
- Stock levels update in real-time on Inventory tab

#### Data Flow
```
Butchery Workstation (POS)
  │
  └──→ API Endpoint: /api/inventory
        │
        └──→ Admin Dashboard (POS Sync)
              │
              └──→ Fetch latest stock levels
                    │
                    └──→ Update Supabase inventory table
                          │
                          ├──→ Create stock_movements audit log
                          ├──→ Broadcast real-time changes
                          └──→ Update shop display in real-time
```

#### Stock Movement Tracking
Each sync creates audit trail:
- What changed: Product, previous stock, new stock
- When: Exact timestamp
- Why: "POS Sync" reason
- Reference: Sync log ID for traceability

---

## Blog Image Upload System

### Enhanced Blog Editor

**Previous Limitation**: Had to manually enter image URLs
**Now**: Direct upload from device (phone/desktop)

### Upload Process

**Step 1: Click "Upload" in Blog Post Editor**
```
┌──────────────────────────────┐
│ Blog Image                   │
│ ┌──────────────────────────┐ │
│ │ Click to upload or       │ │
│ │ drag & drop              │ │
│ │ JPEG, PNG, WebP 10MB max │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Step 2: Select Image from Device**
- File dialog appears
- Choose from phone photos or desktop files
- Supported: JPEG, PNG, WebP, AVIF
- Max size: 10MB

**Step 3: Upload Begins**
```
Processing... [████████░░░░░░░░░░░░] 50%
```

**Step 4: Image Embedded**
```
┌──────────────────┐
│ [Uploaded Image] │ ← Shows preview
│  ┌────────────┐  │
│  │            │  │ [Remove]
│  └────────────┘  │
└──────────────────┘
```

### Technical Details

**Storage**: Supabase Storage `blog-images` bucket
```
blog-images/
  └── blog/
      ├── 1701234567890-abc123.jpg
      ├── 1701234567891-def456.png
      └── ...
```

**URL Format**:
```
https://[your-supabase-url]/storage/v1/object/public/blog-images/blog/[timestamp]-[randomid].[ext]
```

**Features**:
- Automatic file optimization (Supabase handles compression)
- CORS-enabled for cross-origin uploads
- Public access for published posts only
- Version tracking (file_size, mime_type, upload_by, timestamp)

---

## WhatsApp Notifications

### Automatic Customer Updates

When order status changes, customer receives WhatsApp message:

#### Messages Sent
| Event | Message |
|-------|---------|
| Order Received | "Asante sana! 🎉 Order #123 received successfully. We'll prepare it quickly! - Mwanainchi" |
| Preparing | "Your order #123 is being prepared! 👨‍🍳" |
| Ready for Pickup | "🎉 Your order #123 is READY! Come pick it up now!" |
| Out for Delivery | "📍 Your order #123 is on the way! Expected delivery in 15-20 mins." |
| Delivered | "Order #123 DELIVERED! ✅ Enjoy your meal! Thank you! 🙏" |

### How It Works

**1. Status Change Triggered**
Admin updates order status in dashboard.

**2. Automatic Notification Queued**
System creates message in `whatsapp_queue` table.

**3. Queue Processor Sends**
Background service sends via WhatsApp.

**4. Delivery Tracked**
System records:
- `sent_at` timestamp
- `delivery_status` (sent/failed)
- Error messages if failed
- Retry count for failed messages

**5. Admin Can Resend**
If needed, admin can manually resend notification from order details modal.

### Configuration

To enable WhatsApp notifications:

**File**: `src/lib/admin-enhanced.functions.ts`

In `sendWhatsAppNotification()` and `queueWhatsAppNotification()` functions, integrate with your Twilio client:

```typescript
// Pseudo-code
const twilio = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);

await twilio.messages.create({
  from: TWILIO_WHATSAPP_NUMBER,
  to: `whatsapp:${phoneNumber}`,
  body: messageBody,
});
```

---

## Testing & Deployment

### Pre-Deployment Checklist

- [ ] Database migrations applied (`supabase migration up`)
- [ ] Supabase Storage bucket created: `blog-images`
- [ ] Environment variables set for Twilio (if using WhatsApp)
- [ ] POS API endpoint configured and tested
- [ ] Admin account password changed from default
- [ ] Blog image uploads tested (desktop & mobile)
- [ ] Order notifications tested with test phone number

### Local Testing

**1. Test Phone Auth**
```bash
# Use test number: 0769282033
# In dev mode, OTP prints to console
# Check browser console for OTP code
```

**2. Test Admin Dashboard**
```bash
# Visit http://localhost:5173/admin-login
# Email: admin@mwanainchi.co.ke
# Password: MwanainchiAdmin2026!
```

**3. Test Blog Upload**
```bash
# Go to Admin > Blog tab
# Click "New post"
# Scroll to "Blog Image" section
# Click upload area and select image
# Verify image appears and URL is set
```

**4. Test Order Management**
```bash
# Create test order via /checkout
# Go to Admin > Orders tab
# Click "Track" on test order
# Change delivery status
# Check if WhatsApp notification queued
```

**5. Test POS Sync**
```bash
# Go to Admin > POS Sync tab
# Enter test endpoint
# Click "Sync Now"
# Verify sync appears in history
```

### Production Deployment

**1. Apply Database Migrations**
```bash
# In production environment
supabase migration up --linked
```

**2. Set Production Secrets**
```bash
# Store in your deployment platform (Vercel, Railway, etc.)
VITE_TWILIO_ACCOUNT_SID=prod_account_sid
VITE_TWILIO_AUTH_TOKEN=prod_auth_token
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+your_prod_number
```

**3. Create Storage Bucket**
```bash
# In Supabase Dashboard
# Storage > New Bucket: "blog-images"
# Public (for published posts)
```

**4. Update Admin Credentials**
```bash
# Change default admin password immediately after first login
# Go to Admin > Account Settings (when implemented)
```

**5. Configure POS Endpoint**
```bash
# Update DNS/IP pointing to your butchery workstation
# Test sync before going live
```

---

## Admin Functions Reference

### New Enhanced Functions

#### Orders
```typescript
updateOrderDeliveryStatus(orderId, deliveryStatus, riderId?, notes?)
  // Update delivery tracking status
  
assignOrderToRider(orderId, riderId)
  // Assign rider for delivery
```

#### Inventory Sync
```typescript
syncInventoryFromPOS(posData[])
  // Sync from POS system
  
getPOSSyncHistory()
  // Get past sync records
```

#### Blog
```typescript
generateBlogUploadSignedUrl(fileName, fileSize, mimeType)
  // Get upload URL for file
  
registerBlogUpload(filePath, fileName, fileSize, mimeType, blogPostId?)
  // Register uploaded file in database
  
getBlogUploads()
  // Get all uploaded images
```

#### Notifications
```typescript
sendWhatsAppNotification(orderId, messageType)
  // Send WhatsApp message to customer
  // messageType: "order_received" | "order_status" | "ready_for_pickup" | "delivery_update"
```

---

## Troubleshooting

### Images Not Uploading
**Problem**: "Upload failed" error
**Solutions**:
1. Check file size < 10MB
2. Verify MIME type is image/* 
3. Confirm Supabase Storage bucket exists and is public
4. Check browser console for CORS errors

### POS Sync Failing
**Problem**: "Failed to sync" in history
**Solutions**:
1. Verify POS endpoint is accessible and running
2. Check response format matches expected structure
3. Confirm network connectivity between servers
4. Check Supabase row-level security policies allow insert

### WhatsApp Messages Not Sending
**Problem**: Notification status stays "pending"
**Solutions**:
1. Verify Twilio credentials in environment variables
2. Check phone number format: +254XXXXXXXXX
3. Confirm Twilio WhatsApp sandbox has phone numbers
4. Check for Twilio account suspension/balance issues

### Admin Can't Login
**Problem**: "Forbidden: admin role required"
**Solutions**:
1. Verify user_roles table has admin entry for this user
2. Check email matches exactly: admin@mwanainchi.co.ke
3. Ensure authentication middleware is not blocking
4. Check Supabase auth configuration

---

## Performance Notes

### Optimization Tips

1. **POS Sync Frequency**: Run every 5-15 minutes (not every minute)
2. **Image Optimization**: Use WebP format for smaller files
3. **Order Queries**: Indexed by `customer_phone`, `status`, `created_at`
4. **Notification Queue**: Process in batches (not individual)

### Monitoring

Track these metrics:
- Average POS sync duration (should be < 500ms)
- Failed notification percentage (should be < 2%)
- Order query response time (should be < 100ms)
- Storage usage for blog images

---

## Security Considerations

✅ **Implemented**:
- Row-level security on all tables
- Admin role verification on sensitive operations
- File size limits on uploads
- MIME type validation
- Rate limiting ready (add in production)

⚠️ **Recommended Additions**:
- IP whitelist for POS endpoint
- Encryption for sensitive data in notifications
- Audit logging for admin actions
- CSRF protection on sensitive mutations
- WAF (Web Application Firewall) in production

---

## Next Steps

1. ✅ Apply database migrations
2. ✅ Configure Twilio for WhatsApp
3. ✅ Set up POS API endpoint
4. ✅ Create Supabase Storage bucket
5. ⏳ Deploy to production
6. ⏳ Train staff on admin dashboard
7. ⏳ Monitor sync and notification performance

---

## Support & Documentation

For issues or questions:
- Check Supabase logs for database errors
- Review Twilio documentation for messaging
- Consult Supabase Storage docs for upload issues
- Check browser DevTools for client-side errors

---

*Last Updated: June 1, 2026*
*Version: 2.0 - Enhanced Admin Features*

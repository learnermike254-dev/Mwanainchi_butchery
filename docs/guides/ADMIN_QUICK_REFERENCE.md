# Quick Reference: Admin Panel Features

## 🔑 Admin Login
- **URL**: `/admin-login`
- **Email**: `admin@mwanainchi.co.ke`
- **Password**: `MwanainchiAdmin2026!` (change on first login)

---

## 📊 Admin Dashboard Tabs

### 1️⃣ **Orders** Tab
**What**: View and manage all customer orders  
**Features**:
- 4 summary cards (Pending, Preparing, Ready, Delivered)
- Orders table with customer & delivery info
- Status dropdown to update order state
- "Track" button for delivery details
- WhatsApp notifications (automatic)

**Actions**:
```
1. Click "Track" on any order
2. Change delivery status dropdown
3. Add delivery notes (optional)
4. Click "Save Changes"
5. WhatsApp sent to customer automatically
```

---

### 2️⃣ **Inventory** Tab
**What**: Manage stock levels and suppliers  
**Features**:
- Current stock display with low-stock alerts
- Supplier information
- Stock movement history
- "Sync from menu" for product catalog

**Actions**:
```
1. Click "Stock" button to adjust quantities
2. Select reason (received, sold, waste, adjustment)
3. Enter quantity
4. Add notes (optional - for batch tracking)
5. Click "Save movement"
```

---

### 3️⃣ **POS Sync** Tab ⭐ NEW
**What**: Sync inventory with butchery workstation in real-time  
**Features**:
- Manual sync controls
- Sync history with success/failure tracking
- Items synced count
- Sync duration monitoring
- Error messages for failed syncs

**Actions**:
```
1. Enter your POS API endpoint
   Example: http://butchery-pos-ip:3000/api/inventory
2. Click "Sync Now"
3. Wait for completion
4. Check history for results
5. View items synced in inventory tab
```

**Expected Response from POS**:
```json
[
  {
    "product_slug": "beef-steak",
    "product_name": "Beef Steak",
    "stock_kg": 45.5
  }
]
```

---

### 4️⃣ **Blog** Tab
**What**: Create and manage blog posts with images  
**Features**:
- Post list with tags (Recipe, Catering, Events, News, Guide)
- Published/draft status
- Image preview
- Full text editor

**Create New Post**:
```
1. Click "New post"
2. Enter title (auto-generates URL slug)
3. Select category tag
4. UPLOAD IMAGE:
   - Click upload area or drag-drop
   - Select JPEG/PNG/WebP (max 10MB)
   - Preview appears after upload
5. Write excerpt (shown in blog list)
6. Write body (full article)
7. Check "Published" to go live
8. Click "Save"
```

**Edit Post**:
```
1. Click "Edit" on any post
2. Make changes
3. Update image (if needed)
4. Click "Save"
```

---

## 👥 Order Status Workflow

```
pending (received from customer)
    ↓
confirmed (admin acknowledges)
    ↓
preparing (kitchen is working)
    ↓
ready_for_pickup (food is ready)
    ├─→ delivered (for pickup customers)
    │
    └─→ (for delivery) out_for_delivery
           ↓
        delivered
```

## 📱 Delivery Status (for delivery orders)

```
pending → assigned → picked_up → in_transit → delivered
```

---

## 🤖 Automatic WhatsApp Messages

When order status changes, customer receives:

| Status | Message |
|--------|---------|
| Order Received | "Asante sana! 🎉 Order #123 received successfully. We'll prepare it quickly!" |
| Preparing | "Your order #123 is being prepared! 👨‍🍳" |
| Ready for Pickup | "🎉 Your order #123 is READY! Come pick it up now!" |
| Out for Delivery | "📍 Your order #123 is on the way! Expected in 15-20 mins" |
| Delivered | "Order #123 DELIVERED! ✅ Enjoy your meal! 🙏" |

---

## 📸 Image Upload

**Supported Formats**: JPEG, PNG, WebP, AVIF  
**Max Size**: 10MB  
**Uploading From**:
- Desktop computer ✅
- Mobile phone ✅
- Drag and drop ✅
- Click to select ✅

**Process**:
1. Click in upload area
2. Select image file
3. See preview appear
4. File automatically uploaded to cloud
5. URL inserted in post

---

## 🔔 Customer Notifications

**Automatic WhatsApp messages sent when**:
- Order status changes
- Order is ready for pickup
- Delivery is on the way
- Order delivered

**Manual notification**:
- Open order detail modal
- Status updates automatically trigger message
- Can resend if needed

---

## 📊 Key Metrics (from dashboard cards)

```
PENDING      = Orders waiting to be confirmed
PREPARING    = Orders currently being made
READY        = Orders ready for customer
DELIVERED    = Completed orders
```

---

## ⚙️ POS Sync Details

**What gets synced**:
- Product names
- Stock quantities (in kg)
- Stock changes tracked as audit log

**Sync creates**:
- Timestamp record
- Success/failure status
- Items synced count
- Duration metrics
- Error messages (if failed)

**Frequency**: Run every 5-15 minutes (not constantly)

---

## 🔐 Security Notes

✅ **Only admins** can access admin panel  
✅ **Password required** for login  
✅ **Session expires** after inactivity  
✅ **All actions logged** in database  
✅ **Images uploaded to cloud** (not stored locally)  

⚠️ **Keep password safe** - don't share  
⚠️ **Change default password** on first login  
⚠️ **Logout** when done using admin panel  

---

## 🆘 Troubleshooting

**Can't login?**
- Check email is exactly: `admin@mwanainchi.co.ke`
- Verify password (case-sensitive)
- Check caps lock is off

**Image won't upload?**
- Check file size < 10MB
- Only JPEG, PNG, WebP, AVIF allowed
- Try refreshing page and retry

**WhatsApp message not sent?**
- Check customer phone number is correct
- Verify Twilio is configured
- Check customer has WhatsApp active
- Check Twilio account has credit

**POS sync fails?**
- Verify endpoint URL is correct
- Check POS system is running
- Verify network connection
- Check endpoint returns correct JSON format

**Order not updating?**
- Try refreshing page
- Check database connection
- Verify you're logged in as admin

---

## 📞 Getting Help

**Check these first**:
1. Browser console (F12 > Console) for errors
2. `ADMIN_ENHANCEMENT_GUIDE.md` for features
3. `DEPLOYMENT_GUIDE.md` for setup
4. This quick reference (you're reading it!)

**Contact Support**:
- Email: admin@mwanainchi.co.ke
- Check Supabase logs for database errors
- Check Twilio dashboard for WhatsApp issues

---

## ⏱️ Performance Tips

- Run POS sync every 5-15 minutes (not constant)
- Upload images < 5MB for faster loads
- Close unused browser tabs to save resources
- Refresh admin panel daily for updates

---

## 📋 Daily Checklist

- [ ] Check pending orders in morning
- [ ] Confirm orders and start cooking
- [ ] Update status as orders progress
- [ ] Run POS sync (5-15 min intervals)
- [ ] Monitor blog images
- [ ] Logout at end of day

---

## 🎯 Quick Links

| Page | URL |
|------|-----|
| Admin Login | `/admin-login` |
| Admin Dashboard | `/admin` |
| Customer Login | `/login` |
| Blog | `/blog` |
| Shop | `/shop` |
| Order Tracker | `/order-tracker` |

---

*Quick Reference v1.0*  
*Last Updated: June 1, 2026*

# Mwanainchi Butchery - Documentation Hub

Welcome to the complete documentation for Mwanainchi Butchery & Fast Food platform.

## 📁 Documentation Structure

```
docs/
├── README.md (you are here)
├── setup/
│   ├── ADMIN_LOGIN_SETUP.md - Admin authentication configuration
│   ├── TWILIO_SETUP_QUICK_START.md - Twilio WhatsApp integration
│   ├── PHONE_AUTH_SETUP.md - Phone authentication guide
│   └── PHONE_AUTH_SETUP_DETAILED.md - Detailed phone auth implementation
├── integration/
│   ├── MPESA_INTEGRATION_GUIDE.md - M-Pesa STK push & QR scanner
│   ├── WHATSAPP_LOGIN_DETAILED_EXPLANATION.md - WhatsApp integration details
│   └── routes-README.md - Route structure explanation
├── deployment/
│   ├── DEPLOYMENT_GUIDE.md - Production deployment guide
│   ├── XAMPP_AND_SAFARICOM_SETUP.md - Local XAMPP → Safaricom hosting
│   ├── IMPLEMENTATION_COMPLETE.md - Implementation checklist
│   └── IMPLEMENTATION_SUMMARY.md - Project summary
└── guides/
    ├── ADMIN_QUICK_REFERENCE.md - Admin panel quick reference
    ├── ADMIN_ENHANCEMENT_GUIDE.md - Admin features guide
    └── PRODUCT_IMAGE_UPDATE_GUIDE.md - 🖼️ Complete asset map & image update instructions
```

---

## 🚀 Quick Start by Use Case

### I'm Setting Up Locally
- Start with: [XAMPP & Safaricom Setup](./deployment/XAMPP_AND_SAFARICOM_SETUP.md)
- Then read: [Admin Login Setup](./setup/ADMIN_LOGIN_SETUP.md)

### I'm Integrating M-Pesa Payments
- Read: [M-Pesa Integration Guide](./integration/MPESA_INTEGRATION_GUIDE.md)

### I'm Setting Up WhatsApp
- Start with: [Twilio Quick Start](./setup/TWILIO_SETUP_QUICK_START.md)
- Deep dive: [WhatsApp Integration Details](./integration/WHATSAPP_LOGIN_DETAILED_EXPLANATION.md)

### I'm Deploying to Safaricom Hosting
- Read: [XAMPP & Safaricom Setup](./deployment/XAMPP_AND_SAFARICOM_SETUP.md)
- Then: [Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)

### I'm Managing Admin Panel
- Quick ref: [Admin Quick Reference](./guides/ADMIN_QUICK_REFERENCE.md)
- Full guide: [Admin Enhancement Guide](./guides/ADMIN_ENHANCEMENT_GUIDE.md)

---

## 📚 Complete Documentation List

### Setup Guides
| Document | Purpose |
|----------|---------|
| [Admin Login Setup](./setup/ADMIN_LOGIN_SETUP.md) | Fix Supabase auth issues, configure admin credentials |
| [Twilio Setup](./setup/TWILIO_SETUP_QUICK_START.md) | WhatsApp OTP & messaging via Twilio |
| [Phone Auth](./setup/PHONE_AUTH_SETUP.md) | Phone number authentication basics |
| [Phone Auth Detailed](./setup/PHONE_AUTH_SETUP_DETAILED.md) | Complete phone auth implementation |

### Integration Guides
| Document | Purpose |
|----------|---------|
| [M-Pesa Integration](./integration/MPESA_INTEGRATION_GUIDE.md) | STK Push payments, QR code scanner, callbacks |
| [WhatsApp Details](./integration/WHATSAPP_LOGIN_DETAILED_EXPLANATION.md) | Deep dive into WhatsApp messaging |

### Deployment Guides
| Document | Purpose |
|----------|---------|
| [XAMPP & Safaricom Setup](./deployment/XAMPP_AND_SAFARICOM_SETUP.md) | **NEW** - Local database & Safaricom hosting migration |
| [Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md) | Production deployment checklist |
| [Implementation Complete](./deployment/IMPLEMENTATION_COMPLETE.md) | Project completion status |
| [Implementation Summary](./deployment/IMPLEMENTATION_SUMMARY.md) | High-level project overview |

### Quick Reference Guides
| Document | Purpose |
|----------|---------|
| [Admin Quick Reference](./guides/ADMIN_QUICK_REFERENCE.md) | Quick admin panel command reference |
| [Admin Enhancement](./guides/ADMIN_ENHANCEMENT_GUIDE.md) | Complete admin feature documentation |

---

## 🛠️ Tech Stack

- **Frontend:** React + TanStack Router
- **Backend (Previously):** Supabase (Now migrating to local MySQL via XAMPP)
- **Database:** MySQL (XAMPP local) → Safaricom MySQL hosting
- **Payments:** M-Pesa (STK Push, QR Code)
- **Messaging:** Twilio WhatsApp API
- **Hosting:** Safaricom Domains & Webhosting

---

## 📖 Key Topics

### Authentication & Security
- Admin login with Supabase removal (transitioning to local auth)
- Phone-based OTP authentication
- Admin role-based access control

### Payment Integration
- M-Pesa STK Push implementation
- QR code payment scanning
- Payment callbacks and status tracking

### Database
- Local MySQL setup via XAMPP
- Migration from Supabase
- Connection management

### Deployment
- Local development with XAMPP
- Production deployment on Safaricom hosting
- Environment configuration

---

## ⚙️ Environment Variables

### Development (.env.local)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mwanainchi_butchery

# API URLs
VITE_API_BASE_URL=http://localhost:3000
```

### Production (Safaricom)
```env
DB_HOST=safaricom.mysql.server
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=mwanainchi_db

VITE_API_BASE_URL=https://yourdomain.com
```

---

## 📞 Support

- **M-Pesa Test Till:** 9311710
- **Development Server:** http://localhost:8080
- **Database:** XAMPP MySQL (localhost:3306)

---

**Last Updated:** June 1, 2026  
**Version:** 2.0 (Safaricom Migration Ready)

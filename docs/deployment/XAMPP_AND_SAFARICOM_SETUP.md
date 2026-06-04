# XAMPP Local Setup & Safaricom Hosting Migration Guide

**Mwanainchi Butchery & Fast Food**  
**Date:** June 1, 2026  
**Migration Path:** Supabase → Local MySQL (XAMPP) → Safaricom Hosting

---

## Table of Contents

1. [XAMPP Local Setup](#xampp-local-setup)
2. [Database Migration from Supabase](#database-migration-from-supabase)
3. [Local Development Configuration](#local-development-configuration)
4. [Testing & Verification](#testing--verification)
5. [Safaricom Hosting Setup](#safaricom-hosting-setup)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## XAMPP Local Setup

### Step 1: Install XAMPP

#### On Windows (Your System)

1. Download from **[apachefriends.org](https://www.apachefriends.org/)**
2. Choose **XAMPP for Windows** (includes Apache, MySQL, PHP, Perl)
3. Run installer and select:
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP
   - ✅ phpMyAdmin (optional but useful)
4. Install to default location: `C:\xampp`
5. Click **Finish** and start the control panel

### Step 2: Start Services

In XAMPP Control Panel:

```
Apache:  [START]  ← Click to start
MySQL:   [START]  ← Click to start
```

**Expected Output:**
- Apache: "running" on port 80
- MySQL: "running" on port 3306

### Step 3: Verify Installation

Open browser and navigate to:
```
http://localhost/
```

You should see XAMPP dashboard with green checkmarks.

---

## Database Migration from Supabase

### Step 1: Export Data from Supabase

#### Option A: Via Supabase Dashboard

1. Go to **[Supabase Console](https://app.supabase.com)**
2. Select your Mwanainchi project
3. Navigate to **SQL Editor**
4. Run this query to export all data:

```sql
-- Export users table
SELECT * FROM auth.users;

-- Export orders
SELECT * FROM public.orders;

-- Export inventory
SELECT * FROM public.inventory;

-- Export stock movements
SELECT * FROM public.stock_movements;

-- Export user roles
SELECT * FROM public.user_roles;
```

5. Copy results to CSV files

#### Option B: Via pg_dump (Command Line)

```bash
# Install PostgreSQL client tools if not present

# Export entire database
pg_dump -h db.PROJECT_ID.supabase.co -U postgres -d postgres > mwanainchi_backup.sql

# When prompted, enter your Supabase password
```

### Step 2: Create MySQL Database Locally

#### Via phpMyAdmin (Easiest)

1. Open **http://localhost/phpmyadmin**
2. Click **New** (left sidebar)
3. Enter database name: `mwanainchi_butchery`
4. Choose collation: `utf8mb4_unicode_ci`
5. Click **Create**

#### Via Command Line

```bash
# Open MySQL command line
# On Windows: Right-click MySQL in XAMPP → Shell

mysql -u root -p
# Password: (leave empty, just press Enter)

CREATE DATABASE mwanainchi_butchery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mwanainchi_butchery;
```

### Step 3: Create Tables in MySQL

Run the following SQL in phpMyAdmin or MySQL shell:

```sql
-- Users table (replaces Supabase auth)
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin/User roles
CREATE TABLE user_roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(120),
  items JSON NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  payment_method VARCHAR(50),
  order_status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
  delivery_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_phone (customer_phone),
  INDEX idx_status (order_status)
);

-- Inventory
CREATE TABLE inventory (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_slug VARCHAR(80) UNIQUE NOT NULL,
  product_name VARCHAR(120) NOT NULL,
  stock_kg DECIMAL(10, 2) DEFAULT 0,
  low_stock_threshold DECIMAL(10, 2) DEFAULT 5,
  supplier VARCHAR(120),
  notes TEXT,
  last_restocked_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_slug (product_slug)
);

-- Stock movements
CREATE TABLE stock_movements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  inventory_id BIGINT NOT NULL,
  change_kg DECIMAL(10, 2) NOT NULL,
  reason ENUM('received', 'sold', 'adjustment', 'wasted') NOT NULL,
  note TEXT,
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
  INDEX idx_inventory_id (inventory_id),
  INDEX idx_created_at (created_at)
);

-- M-Pesa transactions
CREATE TABLE mpesa_transactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(255) NOT NULL,
  checkout_request_id VARCHAR(255) UNIQUE NOT NULL,
  merchant_request_id VARCHAR(255),
  phone_number VARCHAR(20),
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  mpesa_code VARCHAR(50),
  result_code INT,
  result_desc TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_checkout_request_id (checkout_request_id),
  INDEX idx_order_id (order_id)
);

-- Blog posts
CREATE TABLE blog_posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content LONGTEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  author_id BIGINT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id),
  INDEX idx_slug (slug),
  INDEX idx_published (published)
);

-- Blog images (for image uploads)
CREATE TABLE blog_images (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  uploaded_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_post_id (post_id)
);

-- Admin audit log
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  changes JSON,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

### Step 4: Create Admin User

```sql
USE mwanainchi_butchery;

-- Insert admin user (password: MwanainchiAdmin2026!)
-- Use a password hashing function in your app to generate this
INSERT INTO users (email, password_hash) VALUES (
  'admin@mwanainchi.co.ke',
  '$2y$10$...' -- bcrypt hash of MwanainchiAdmin2026!
);

-- Get the user ID (it will be 1 for first user)
SET @admin_id = LAST_INSERT_ID();

-- Assign admin role
INSERT INTO user_roles (user_id, role) VALUES (@admin_id, 'admin');
```

### Step 5: Import Existing Data (Optional)

If you have CSV exports from Supabase:

```sql
-- Via phpMyAdmin: Import tab → Choose CSV file
-- OR via command line:

LOAD DATA LOCAL INFILE '/path/to/orders.csv'
INTO TABLE orders
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

---

## Local Development Configuration

### Step 1: Update Environment Variables

Create/update `.env.local` in project root:

```env
# Database (Local XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mwanainchi_butchery

# API
API_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:8080

# Authentication
JWT_SECRET=your_secret_key_change_this_in_production

# Remove Supabase variables
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
```

### Step 2: Create Database Connection Module

Create `src/integrations/database/connection.ts`:

```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const getConnection = async () => {
  return pool.getConnection();
};

export const query = async (sql: string, values?: any[]) => {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, values);
    return results;
  } finally {
    connection.release();
  }
};

export const getPool = () => pool;
```

### Step 3: Install Required Packages

```bash
npm install mysql2 bcrypt jsonwebtoken
npm install -D @types/node @types/express
```

### Step 4: Create Auth Service

Create `src/lib/auth.service.ts`:

```typescript
import { query } from '@/integrations/database/connection';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRY = '7d';

export async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const result = await query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, hashedPassword]
    );
    return { ok: true, userId: (result as any).insertId };
  } catch (error) {
    return { ok: false, error: 'Email already exists' };
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const [users] = await query(
      'SELECT id, password_hash FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (!users?.length) {
      return { ok: false, error: 'Invalid credentials' };
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return { ok: false, error: 'Invalid credentials' };
    }

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    return { ok: true, token, userId: user.id };
  } catch (error) {
    return { ok: false, error: 'Authentication failed' };
  }
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { ok: true, data: decoded };
  } catch (error) {
    return { ok: false, error: 'Invalid token' };
  }
}
```

---

## Testing & Verification

### Test 1: Database Connection

```bash
# Test MySQL connection
mysql -h localhost -u root -e "SELECT 1"

# Output should be:
# +---+
# | 1 |
# +---+
# | 1 |
# +---+
```

### Test 2: Create Test User

```sql
USE mwanainchi_butchery;
INSERT INTO users (email, password_hash) VALUES ('test@example.com', 'hashed_password');
SELECT * FROM users;
```

### Test 3: Application Connection

Start dev server and check console:

```bash
npm run dev
```

**Expected output:** No database connection errors

### Test 4: Admin Login

Navigate to `http://localhost:8080/admin-login` and attempt login

---

## Safaricom Hosting Setup

### Step 1: Purchase Safaricom Hosting Package

1. Visit **[Safaricom Domains](https://domains.safaricom.co.ke/)**
2. Purchase:
   - Domain name (e.g., `mwanainchi.co.ke`)
   - Hosting plan (recommended: Business or above)
   - MySQL database

### Step 2: Get Hosting Credentials

Safaricom will provide:

```
FTP Host: ftp.yourdomain.com
FTP Username: your_username
FTP Password: your_password

MySQL Host: mysql.yourdomain.com (or shared host)
MySQL User: your_db_user
MySQL Password: your_db_password
MySQL Database: your_db_name
```

### Step 3: Update Production Environment

Create `.env.production` or configure in Safaricom control panel:

```env
# Production Database (Safaricom)
DB_HOST=mysql.yourdomain.com
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Production API
API_URL=https://yourdomain.com/api
VITE_API_BASE_URL=https://yourdomain.com

# Security
JWT_SECRET=your_production_secret_key_min_32_chars
NODE_ENV=production
```

### Step 4: Build for Production

```bash
npm run build

# Output: dist/ folder ready for deployment
```

### Step 5: Deploy via FTP

#### Option A: Using FileZilla (GUI)

1. Download **[FileZilla](https://filezilla-project.org/)**
2. Connect:
   - Host: `ftp.yourdomain.com`
   - Username: from Safaricom
   - Password: from Safaricom
   - Port: 21
3. Navigate to `public_html` folder
4. Upload contents of `dist/` folder

#### Option B: Using Command Line (SCP/SFTP)

```bash
# Install scp or use sftp
scp -r dist/* username@yourdomain.com:/public_html/

# Or use rsync for faster updates
rsync -avz dist/ username@yourdomain.com:/public_html/
```

### Step 6: Configure Web Server

If Safaricom uses Apache, create `.htaccess` in public root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Step 7: Test Production

```
https://yourdomain.com
```

---

## Production Deployment

### Pre-Deployment Checklist

- ✅ Database migrated to Safaricom MySQL
- ✅ All environment variables configured
- ✅ SSL certificate installed (automatic with Safaricom)
- ✅ Database backups configured
- ✅ Email notifications tested
- ✅ API rate limiting enabled
- ✅ CORS properly configured

### Backup Strategy

#### Automated Daily Backups

```bash
# Create backup script: backup_db.sh
#!/bin/bash

BACKUP_DIR="/var/backups/mwanainchi"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MySQL database
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete

# Upload to cloud storage (optional)
# rclone copy $BACKUP_DIR remote:backups/
```

#### Schedule with Cron

```bash
# Edit crontab
crontab -e

# Add this line (daily at 2 AM)
0 2 * * * /home/username/backup_db.sh
```

### Monitoring & Alerts

Monitor these metrics:

```
- Database connection errors
- Failed authentication attempts
- Order processing failures
- M-Pesa callback failures
- API response times
- Server CPU/Memory usage
```

Setup via Safaricom monitoring dashboard or tools like:
- Uptime monitoring
- Error logging (Sentry)
- Performance monitoring (New Relic)

### Rollback Plan

If issues occur:

1. **Revert to Previous Version**
   ```bash
   git revert <commit_hash>
   npm run build
   scp -r dist/* username@yourdomain.com:/public_html/
   ```

2. **Database Rollback**
   ```sql
   # Restore from backup
   mysql -u $DB_USER -p $DB_NAME < backup_20260601_020000.sql
   ```

---

## Troubleshooting

### Issue: "Can't connect to MySQL server"

**Solution:**
```bash
# Check if MySQL is running
xampp-control.exe

# Verify credentials
mysql -h localhost -u root -p

# Check port
netstat -an | find "3306"
```

### Issue: "Database not found"

**Solution:**
```sql
-- List all databases
SHOW DATABASES;

-- Verify database exists
USE mwanainchi_butchery;

-- Check table count
SHOW TABLES;
```

### Issue: "JWT token invalid"

**Solution:**
```env
# Regenerate JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo $JWT_SECRET
```

### Issue: "CORS error in browser"

**Solution:**

Create CORS middleware in your API:

```typescript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

### Issue: "Safaricom FTP upload fails"

**Solution:**
```bash
# Verify connection
ftp ftp.yourdomain.com
# Enter username and password

# Check available space
quota

# Try SFTP instead (more secure)
sftp username@yourdomain.com
```

---

## Migration Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Preparation** | 1 day | XAMPP setup, table creation, initial testing |
| **Data Migration** | 2-3 days | Export from Supabase, import to MySQL, verify data integrity |
| **Development** | 3-5 days | Update app code, test all features locally |
| **Testing** | 2-3 days | UAT, performance testing, security audit |
| **Deployment** | 1 day | Deploy to Safaricom, DNS setup, verify production |
| **Monitoring** | Ongoing | Monitor logs, user feedback, performance |

---

## Support & Resources

### XAMPP
- Documentation: https://www.apachefriends.org/docs/
- Forum: https://www.apachefriends.org/community/

### Safaricom Hosting
- Support Portal: https://domains.safaricom.co.ke/support
- Knowledge Base: https://help.safaricom.co.ke/

### MySQL
- Documentation: https://dev.mysql.com/doc/
- Reference: https://dev.mysql.com/doc/refman/8.0/

---

## Conclusion

You're now ready to:
1. ✅ Develop locally with XAMPP
2. ✅ Deploy to Safaricom hosting
3. ✅ Manage production database
4. ✅ Scale your Mwanainchi Butchery platform

**Happy deploying! 🚀**

---

**Last Updated:** June 1, 2026  
**Version:** 1.0 (Production Ready)

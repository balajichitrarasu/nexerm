# NexERM — Employee Resource Management System

**100% Free · Open Source · GitHub Pages + Supabase**

---

## ═══════════════════════════════════════
## COMPLETE DEPLOYMENT GUIDE (Step by Step)
## ═══════════════════════════════════════

---

## PART 1 — SUPABASE BACKEND SETUP (Free)

### Step 1: Create Supabase Account
1. Go to → https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. It's completely free — no credit card needed

### Step 2: Create a New Project
1. Click **"New Project"**
2. Fill in:
   - **Project Name**: nexerm (or anything you like)
   - **Database Password**: create a strong password (SAVE THIS!)
   - **Region**: Choose nearest to you (e.g., Singapore for India)
3. Click **"Create new project"**
4. Wait ~2 minutes for project to be ready

### Step 3: Run the Database Schema
1. In your Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase_schema.sql` from this project
4. **Copy all contents** and paste into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see: ✅ "Success. No rows returned"

### Step 4: Get Your API Keys
1. In Supabase dashboard, go to **Settings → API** (left sidebar)
2. Copy these two values:
   - **Project URL** — looks like: `https://abcdefgh.supabase.co`
   - **anon public key** — long string starting with `eyJ...`
3. Keep these ready for the next part

### Step 5: Enable Email Auth
1. Go to **Authentication → Providers** (left sidebar)
2. Make sure **Email** is enabled (it is by default)
3. Under **Authentication → Settings**:
   - Set **Site URL** to: `https://YOUR-USERNAME.github.io/nexerm`
   - Add the same URL under **Redirect URLs**
4. Click **Save**

---

## PART 2 — CONFIGURE THE APP

### Step 6: Edit config.js
1. Open the file `js/config.js` in any text editor (Notepad, VS Code, etc.)
2. Replace these two lines:

```javascript
SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
SUPABASE_ANON_KEY: 'YOUR_ANON_KEY_HERE',
```

With your actual values from Step 4:

```javascript
SUPABASE_URL: 'https://abcdefgh.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
```

3. Also update the currency/locale if needed:
```javascript
CURRENCY_SYMBOL: '₹',      // Change to $ € £ etc
CURRENCY_LOCALE: 'en-IN',  // Change to en-US, en-GB etc
```

4. **Save the file**

---

## PART 3 — DEPLOY TO GITHUB PAGES (Free)

### Step 7: Create GitHub Account
- Go to https://github.com and sign up (free) if you don't have one

### Step 8: Create a New Repository
1. Click the **"+"** button → **"New repository"**
2. Fill in:
   - **Repository name**: `nexerm` (exactly this, lowercase)
   - **Description**: Employee Resource Management System
   - Set to **Public** (required for free GitHub Pages)
   - ✅ Check **"Add a README file"**
3. Click **"Create repository"**

### Step 9: Upload All Project Files
**Option A — GitHub Website (easiest, no Git needed):**
1. Open your repository on GitHub
2. Click **"Add file"** → **"Upload files"**
3. Upload ALL files maintaining the folder structure:
   ```
   index.html
   README.md
   supabase_schema.sql
   css/
     main.css
     app.css
   js/
     config.js
     db.js
     utils.js
     auth.js
     app.js
     pages/
       dashboard.js
       employees.js
       departments.js
       shifts.js
       attendance.js
       leaves.js
       payroll.js
       reports.js
       settings.js
   pages/
     app.html
   ```
4. Scroll down, add commit message: "Initial deploy"
5. Click **"Commit changes"**

**Option B — Git Command Line (faster for updates):**
```bash
# 1. Install Git from https://git-scm.com if not installed
# 2. Open terminal in your project folder

git init
git add .
git commit -m "Initial NexERM deploy"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/nexerm.git
git push -u origin main
```

### Step 10: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **"Settings"** tab (top)
3. Scroll down to **"Pages"** in left sidebar
4. Under **"Source"**: Select **"Deploy from a branch"**
5. Under **"Branch"**: Select **"main"** → **"/ (root)"**
6. Click **"Save"**
7. Wait 1–2 minutes
8. Your site is now live at:
   **`https://YOUR-USERNAME.github.io/nexerm`**

### Step 11: Update Supabase Redirect URL
1. Go back to Supabase dashboard
2. **Authentication → Settings**
3. Set **Site URL** to your actual GitHub Pages URL:
   `https://YOUR-USERNAME.github.io/nexerm`
4. Save

---

## PART 4 — FIRST LOGIN

### Step 12: Create Your Admin Account
1. Open your site: `https://YOUR-USERNAME.github.io/nexerm`
2. Click **"Create workspace"**
3. Fill in your details and create account
4. **Check your email** — Supabase will send a confirmation link
5. Click the confirmation link
6. Return to the site and **Sign In**

### Step 13: Initial Setup
1. Go to **Settings** → configure your company name
2. Go to **Departments** → add your departments
3. Go to **Shift Manager** → set up your shifts and timings
4. Go to **Employees** → add your team members
5. Go to **Attendance** → start marking daily attendance
6. Go to **Payroll** → calculate monthly payroll

---

## MAKING UPDATES (after initial deploy)

### Option A — GitHub Website:
1. Go to the file on GitHub (e.g., `js/config.js`)
2. Click the pencil ✏️ icon
3. Edit and commit

### Option B — Git:
```bash
# After making changes locally:
git add .
git commit -m "Update description"
git push
```
GitHub Pages auto-deploys in 1–2 minutes after every push.

---

## FEATURES

| Feature | Status |
|---------|--------|
| Employee CRUD | ✅ Full |
| Department Management | ✅ Full |
| Shift Manager + Reassign | ✅ Full |
| Daily Attendance (check-in/out) | ✅ Full |
| Leave Requests (apply/approve/reject) | ✅ Full |
| Payroll Calculator (PF, Tax, OT) | ✅ Full |
| Payslip generation | ✅ Full |
| Reports (Attendance, Payroll, Shift, Leave) | ✅ Full |
| CSV Export (all modules) | ✅ Full |
| Email Authentication | ✅ Supabase |
| Real-time Database | ✅ Supabase |
| Mobile Responsive | ✅ Full |
| Dark Theme | ✅ Built-in |
| Demo Mode (no backend) | ✅ localStorage |

---

## TECH STACK (all free)

- **Frontend**: Pure HTML + CSS + Vanilla JS (no frameworks, no build step)
- **Backend**: Supabase (PostgreSQL + Auth + REST API) — Free tier
- **Hosting**: GitHub Pages — Free forever
- **Fonts**: Google Fonts — Free

---

## FREE TIER LIMITS

**Supabase Free:**
- 500 MB database storage
- 1 GB file storage
- 50,000 monthly active users
- Unlimited API requests

**GitHub Pages Free:**
- Unlimited public repos
- 1 GB storage
- 100 GB bandwidth/month

Both are more than enough for an SME with 100–500 employees.

---

## TROUBLESHOOTING

**Site shows blank page:**
- Check browser console (F12) for errors
- Verify config.js has correct Supabase URL and key
- Make sure all files are uploaded with correct paths

**Login not working:**
- Check Supabase Authentication → Settings → Site URL matches your GitHub Pages URL
- Check email inbox (including spam) for confirmation email

**Data not saving:**
- Open F12 → Console → look for Supabase errors
- Verify SQL schema was run correctly in Supabase SQL Editor
- Check Supabase → Table Editor to confirm tables exist

**CORS errors:**
- Go to Supabase → Settings → API → add your GitHub Pages URL to allowed origins

---

## CUSTOM DOMAIN (Optional)

If you want `erm.yourcompany.com` instead of GitHub Pages URL:
1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In GitHub repo → Settings → Pages → Custom domain
3. Add a CNAME record in your DNS pointing to `YOUR-USERNAME.github.io`
4. GitHub will auto-provision HTTPS (Let's Encrypt, free)


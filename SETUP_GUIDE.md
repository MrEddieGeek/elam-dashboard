# ELAM Dashboard - Setup Guide

## ✅ Completed Fixes & Improvements

This guide covers all the security fixes, code quality improvements, and new features that have been implemented.

---

## 🔒 Security Fixes

### 1. Environment Variables Setup

**What was fixed**: Hard-coded Google Sheet ID and configuration values are now environment variables.

**Action Required**:

1. Create a `.env` file in the project root (already in `.gitignore`):
```bash
cp .env.example .env
```

2. Edit `.env` with your actual values:
```bash
VITE_GOOGLE_SHEET_ID=1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE
VITE_UPDATE_INTERVAL=120000
VITE_APP_TITLE=ELAM Dashboard
VITE_FLEET_NAME=ELAM Logistics
```

3. **Never commit `.env` to Git** - it's already protected by `.gitignore`

### 2. n8n Credentials Security

**What was fixed**: Documentation created for properly storing Wialon API tokens in n8n.

**Action Required**:

1. Read the security guide: `N8N_SECURITY_GUIDE.md`

2. **CRITICAL**: Remove hardcoded token from `n8n_workflows/workflow.json:34`

3. Store Wialon token in n8n Credentials:
   - Login to n8n Cloud
   - Go to Credentials → Add Credential
   - Create "Wialon GPS API - ELAM" credential
   - Store your token there
   - Update workflow nodes to use the credential

4. Export workflow again (credentials will be excluded automatically)

---

## 🎨 Code Quality Improvements

### 1. Error Handling

**What was fixed**:
- Robust error handling in data fetching
- User-visible error notifications in the dashboard
- Better parsing of Google Sheets API responses

**Features**:
- Red notification banner appears when data fetch fails
- Users can dismiss error messages
- Errors logged to console for debugging

### 2. ESLint & Prettier

**What was added**: Code quality and formatting tools

**Action Required**:

1. Install dependencies:
```bash
npm install
```

2. Run linting:
```bash
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix errors
```

3. Format code:
```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

### 3. Configuration Constants

**What was fixed**: Magic numbers replaced with named constants

**Example**:
```javascript
// Before
setInterval(fetchData, 120000); // What's 120000?

// After
const UPDATE_INTERVAL = 120000; // 2 minutes
setInterval(fetchData, UPDATE_INTERVAL);
```

---

## 🆕 New Feature: Automatic Geocercas Sync

### What It Does

Automatically syncs geofences (geocercas) from Wialon to Google Sheets every 6 hours. When you add or modify a geofence in Wialon, it will appear in your Google Sheet automatically.

### Setup Instructions

**Full documentation**: `n8n_workflows/GEOCERCAS_SYNC_README.md`

**Quick Setup**:

1. **Import Workflow to n8n**:
   - Go to n8n Cloud
   - Import `n8n_workflows/sync_geocercas_workflow.json`

2. **Configure Credentials**:
   - Add Wialon API credential (same as main workflow)
   - Add Google Sheets OAuth2 credential

3. **Verify Sheet Structure**:
   - Ensure you have a sheet named `geocercas`
   - First row should have headers from `templates/template_geocercas_completo.csv`

4. **Test the Workflow**:
   - Click "Execute Workflow" in n8n
   - Check Google Sheet for synced geofences

5. **Activate**:
   - Toggle "Active" in workflow
   - Runs automatically every 6 hours

### Features

✅ **Automatic Type Detection**: Identifies taller, puerto, caseta, cliente based on names
✅ **Smart Status Mapping**: Assigns appropriate statuses per geofence type
✅ **Coordinate Extraction**: Handles circles, polygons, complex shapes
✅ **Address Resolution**: Includes location addresses
✅ **Full Sync**: Ensures data consistency

---

## 📂 Project Structure (After Changes)

```
elam-dashboard/
├── .env.example              # ✨ NEW: Environment variables template
├── .gitignore                # ✨ NEW: Protects sensitive data
├── .eslintrc.cjs             # ✨ NEW: ESLint configuration
├── .prettierrc.json          # ✨ NEW: Prettier configuration
├── .prettierignore           # ✨ NEW: Prettier ignore rules
├── N8N_SECURITY_GUIDE.md     # ✨ NEW: Security best practices
├── SETUP_GUIDE.md            # ✨ NEW: This file
├── package.json              # ✏️ UPDATED: Added lint/format scripts
├── src/
│   └── App.jsx               # ✏️ UPDATED: Env vars, error handling, better parsing
├── n8n_workflows/
│   ├── workflow.json         # ⚠️ ACTION REQUIRED: Remove hardcoded token
│   ├── sync_geocercas_workflow.json  # ✨ NEW: Geocercas sync workflow
│   └── GEOCERCAS_SYNC_README.md      # ✨ NEW: Geocercas setup guide
└── templates/
    └── (existing CSV templates)
```

---

## ⚡ Quick Start Checklist

### Immediate Actions (This Week)

- [ ] **Create `.env` file** from `.env.example`
- [ ] **Fill in your Google Sheet ID** in `.env`
- [ ] **Remove Wialon token** from `n8n_workflows/workflow.json`
- [ ] **Store Wialon token** in n8n Credentials
- [ ] **Update workflow nodes** to use stored credentials
- [ ] **Test dashboard** with environment variables
- [ ] **Run `npm install`** to get new dev dependencies

### Setup Geocercas Sync (This Week)

- [ ] **Read** `n8n_workflows/GEOCERCAS_SYNC_README.md`
- [ ] **Create `geocercas` sheet** in Google Sheets (if not exists)
- [ ] **Import workflow** to n8n Cloud
- [ ] **Configure credentials** (Wialon + Google Sheets)
- [ ] **Test workflow** manually
- [ ] **Activate workflow** for automatic sync

### Code Quality Setup (This Month)

- [ ] **Run `npm run lint`** and fix any errors
- [ ] **Run `npm run format`** to format code
- [ ] **Add pre-commit hooks** (optional, recommended)
- [ ] **Set up editor integration** (ESLint + Prettier plugins)

### Production Deployment (Before Scaling)

- [ ] **Review security checklist** in `N8N_SECURITY_GUIDE.md`
- [ ] **Verify no credentials** in Git history
- [ ] **Set up monitoring** (Sentry, error tracking)
- [ ] **Configure alerts** for workflow failures
- [ ] **Document deployment process**

---

## 🚀 Running the Dashboard

### Development Mode

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Code Quality Checks

```bash
# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format
npm run format:check
```

---

## 🔍 Verifying Security Fixes

### Check 1: No Hardcoded Credentials in Code

```bash
# Should NOT find any tokens in source code
grep -r "token" src/ --exclude-dir=node_modules

# Should find credentials storage documentation
grep -r "credentials" N8N_SECURITY_GUIDE.md
```

### Check 2: Environment Variables Working

```bash
# Start dev server and check console
npm run dev

# Console should show: "Using Sheet ID from environment: 1KKT..."
# Not: "Using hardcoded Sheet ID"
```

### Check 3: Git Protection

```bash
# .env should be in .gitignore
cat .gitignore | grep ".env"

# Git should ignore .env
git status  # Should NOT show .env file
```

---

## 📊 Testing the Geocercas Sync

### Manual Test

1. **Add a test geofence in Wialon**:
   - Name it "TEST TALLER" (will be detected as type: taller)
   - Set coordinates and radius
   - Save

2. **Run the workflow manually** in n8n

3. **Check Google Sheet**:
   - Open `geocercas` sheet
   - Look for "TEST TALLER" row
   - Verify: lat, lng, tipo=taller, status_entrada=En Taller

4. **Modify the geofence** in Wialon:
   - Change name or location
   - Wait for next sync (or run manually)
   - Verify changes in Google Sheet

5. **Delete test geofence** in Wialon:
   - Run sync again
   - Should be removed from Google Sheet

---

## 🛠️ Troubleshooting

### Dashboard not loading data

**Check**:
1. Is `.env` file created with correct Sheet ID?
2. Is Google Sheet publicly readable?
3. Check browser console for errors
4. Verify Sheet has `status_operativo` sheet

**Solution**:
```bash
# Verify environment variables are loaded
npm run dev
# Should see: "Using Sheet ID from environment: ..."
```

### ESLint errors

**Check**:
```bash
npm run lint
```

**Solution**:
```bash
# Auto-fix most errors
npm run lint:fix

# For remaining errors, review and fix manually
```

### Geocercas not syncing

**Check**:
1. Is workflow activated in n8n?
2. Are credentials configured correctly?
3. Does `geocercas` sheet exist in Google Sheets?
4. Check workflow execution history in n8n

**Solution**: See `n8n_workflows/GEOCERCAS_SYNC_README.md` → Troubleshooting section

---

## 📚 Additional Resources

- **Main Documentation**: `ELAM_Project_Documentation.md`
- **Security Guide**: `N8N_SECURITY_GUIDE.md`
- **Geocercas Setup**: `n8n_workflows/GEOCERCAS_SYNC_README.md`
- **Wialon API Docs**: https://sdk.wialon.com/wiki/en/sidebar/remoteapi/apiref/apiref
- **n8n Documentation**: https://docs.n8n.io
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html

---

## 💡 Next Steps

### Phase 1: Stabilization (This Month)
1. Complete security fixes (remove hardcoded credentials)
2. Test geocercas sync in production
3. Set up monitoring and alerts
4. Document any issues encountered

### Phase 2: Enhancement (Next Month)
1. Implement Operador auto-population (documented in main docs)
2. Implement Próximo Movimiento calculation
3. Add unit tests for critical functions
4. Consider TypeScript migration

### Phase 3: Scaling (Quarter)
1. Add caching layer if fleet grows beyond 50 units
2. Implement real-time updates (WebSocket)
3. Add data analytics dashboard
4. Integrate cost tracking features

---

## 🤝 Contributing

When making changes:

1. **Lint before committing**:
```bash
npm run lint:fix
npm run format
```

2. **Test locally**:
```bash
npm run dev
# Test all features
```

3. **Never commit credentials**:
```bash
# Verify .gitignore is working
git status
# Should NOT see .env or credentials
```

4. **Update documentation** if adding features

---

## ⚠️ Important Reminders

🔴 **NEVER commit**:
- `.env` files
- API tokens or passwords
- `workflow.json` with hardcoded credentials
- Database connection strings

✅ **ALWAYS**:
- Use environment variables for config
- Store secrets in n8n Credentials
- Review `git diff` before committing
- Test changes locally first
- Update documentation

---

**Setup Guide Version**: 1.0
**Last Updated**: 2025-11-10
**Questions?** Check main documentation or create an issue.

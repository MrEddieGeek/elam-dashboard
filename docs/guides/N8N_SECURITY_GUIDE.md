# n8n Security Guide - ELAM Dashboard

## Critical Security Fixes Required

### 🔴 IMMEDIATE ACTION: Remove Hardcoded Credentials

The current `n8n_workflows/workflow.json` file contains a hardcoded Wialon token at line 34:
```json
"token": "TU_TOKEN_AQUI"
```

**This is a critical security vulnerability** and must be fixed immediately.

---

## How to Properly Store Credentials in n8n

### Option 1: n8n Cloud Credentials (RECOMMENDED)

1. **Login to n8n Cloud**: Access your n8n instance at https://app.n8n.cloud

2. **Navigate to Credentials**:
   - Click on your workspace
   - Go to "Credentials" in the left sidebar
   - Click "Add Credential"

3. **Create Wialon API Credential**:
   - Type: Choose "HTTP Request Auth" or create custom credential
   - Name: `Wialon API - ELAM`
   - Authentication Method: `Header Auth`
   - Header Name: `Authorization` (or however Wialon expects it)
   - Header Value: Your actual Wialon token

4. **Update Your Workflow**:
   - In the workflow editor, select each Wialon HTTP Request node
   - Under "Authentication", select "Predefined Credential Type"
   - Choose your newly created credential
   - Remove any hardcoded tokens from the workflow JSON

5. **Export Workflow Safely**:
   - When exporting, n8n will automatically **exclude** credential values
   - Only credential references (IDs) are included in exports
   - Safe to commit to Git

### Option 2: Environment Variables (n8n Self-Hosted)

If you're self-hosting n8n, use environment variables:

1. **Create `.env` file** (never commit this to Git):
```bash
WIALON_TOKEN=your_actual_wialon_token_here
GOOGLE_SHEET_ID=1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE
```

2. **Reference in n8n**:
   - In n8n nodes, use expressions: `{{$env.WIALON_TOKEN}}`
   - This keeps secrets out of workflow JSON

3. **Add to `.gitignore`**:
```
.env
.env.local
n8n_workflows/*.backup
```

---

## Updated Workflow Structure (Secure)

### Before (INSECURE ❌):
```json
{
  "name": "Login Wialon",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://hst-api.wialon.com/wialon/ajax.html",
    "method": "POST",
    "body": {
      "params": {
        "token": "TU_TOKEN_AQUI"  // ❌ NEVER DO THIS
      }
    }
  }
}
```

### After (SECURE ✅):
```json
{
  "name": "Login Wialon",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://hst-api.wialon.com/wialon/ajax.html",
    "method": "POST",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "wialongpsApi"
  },
  "credentials": {
    "wialongpsApi": {
      "id": "1",  // ✅ Credential reference, not the actual token
      "name": "Wialon API - ELAM"
    }
  }
}
```

---

## Step-by-Step Migration Guide

### For Existing Workflows:

1. **Backup Current Workflow**:
```bash
cp n8n_workflows/workflow.json n8n_workflows/workflow.json.backup
```

2. **Create Credentials in n8n**:
   - Go to n8n UI → Credentials → Add Credential
   - Create "Wialon GPS API" credential
   - Save your token there

3. **Update Each Node**:
   - Open workflow in n8n editor
   - For each HTTP Request node calling Wialon:
     - Remove token from request body/parameters
     - Select "Authentication" dropdown
     - Choose your Wialon credential
   - Save workflow

4. **Export Updated Workflow**:
   - Click "..." menu in workflow
   - Choose "Download"
   - Replace `n8n_workflows/workflow.json` with the new version
   - Verify no sensitive data remains:
   ```bash
   grep -i "token" n8n_workflows/workflow.json
   ```

5. **Commit Changes**:
```bash
git add n8n_workflows/workflow.json
git commit -m "Security: Move Wialon credentials to n8n Credentials store"
git push
```

---

## Best Practices Checklist

- [ ] **Never commit credentials** to Git (tokens, passwords, API keys)
- [ ] **Use n8n Credentials** for all sensitive values
- [ ] **Enable 2FA** on n8n Cloud account
- [ ] **Rotate tokens** every 90 days
- [ ] **Use separate credentials** for dev/staging/production
- [ ] **Audit workflow exports** before committing to Git
- [ ] **Set up alerts** for failed authentication in workflows
- [ ] **Document credential requirements** in project README
- [ ] **Restrict n8n access** to authorized team members only

---

## Google Sheets API Security

Currently, the dashboard uses public read access to Google Sheets. For production:

### Option 1: Service Account (Better)
1. Create a Google Cloud service account
2. Generate JSON key
3. Store key in n8n Credentials (not in Git!)
4. Share sheet with service account email
5. Use Google Sheets node in n8n with service account auth

### Option 2: OAuth 2.0 (Best for Multi-User)
1. Set up OAuth 2.0 in Google Cloud Console
2. Configure OAuth credentials in n8n
3. Users authenticate once
4. Tokens automatically refreshed

---

## Emergency Response: If Credentials Are Leaked

If you accidentally committed credentials to Git:

1. **Immediately Revoke Compromised Credentials**:
   - Wialon: Generate new token, revoke old one
   - Google: Revoke API access, generate new key

2. **Clean Git History** (if needed):
```bash
# Install BFG Repo-Cleaner
brew install bfg  # macOS
# or download from https://rtyley.github.io/bfg-repo-cleaner/

# Remove sensitive file from history
bfg --delete-files workflow.json.backup

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (be careful!)
git push --force
```

3. **Update Documentation**: Note the incident and lessons learned

4. **Notify Team**: Inform all developers of the breach

---

## Additional Resources

- [n8n Security Best Practices](https://docs.n8n.io/hosting/security/)
- [n8n Credentials Documentation](https://docs.n8n.io/credentials/)
- [Wialon API Documentation](https://sdk.wialon.com/wiki/en/sidebar/remoteapi/apiref/apiref)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

## Contact

If you have questions about implementing these security measures, reach out to the DevOps team or security lead.

**Remember**: Security is everyone's responsibility!

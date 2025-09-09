# Device-Based Access Control Setup Guide

This guide will help you configure the device-based access control system for your Personal Expense Tracker on Vercel.

## Environment Variables Required

You need to set up the following environment variables in your Vercel project:

### 1. Master Password
```
EXPENSE_TRACKER_MASTER_PASSWORD=your_secure_master_password_here
```

**Choose a strong master password that you'll remember. This is what you'll use to authenticate new devices.**

### 2. Device Tokens (initially empty)
```
EXPENSE_TRACKER_DEVICE_TOKENS=
```

**Start with an empty value. Device tokens will be added automatically when you authenticate devices.**

### 3. Registered Devices (initially empty)
```
EXPENSE_TRACKER_REGISTERED_DEVICES=[]
```

**Start with an empty JSON array. Device information will be stored here automatically.**

## Vercel Environment Variable Setup

### Option 1: Using Vercel Dashboard (Recommended)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Navigate to your project: `personal-expense-tracker`
3. Click on the "Settings" tab
4. Click on "Environment Variables" in the sidebar
5. Add each environment variable:

   **Variable 1:**
   - Name: `EXPENSE_TRACKER_MASTER_PASSWORD`
   - Value: `your_secure_master_password_here` (replace with your chosen password)
   - Environment: Production, Preview, Development (check all)

   **Variable 2:**
   - Name: `EXPENSE_TRACKER_DEVICE_TOKENS`
   - Value: (leave empty)
   - Environment: Production, Preview, Development (check all)

   **Variable 3:**
   - Name: `EXPENSE_TRACKER_REGISTERED_DEVICES`
   - Value: `[]`
   - Environment: Production, Preview, Development (check all)

6. Click "Save" for each variable

### Option 2: Using Vercel CLI

If you have Vercel CLI installed, you can also set environment variables from the command line:

```bash
# Set master password
vercel env add EXPENSE_TRACKER_MASTER_PASSWORD

# Set device tokens (empty initially)
vercel env add EXPENSE_TRACKER_DEVICE_TOKENS

# Set registered devices (empty JSON array initially)
vercel env add EXPENSE_TRACKER_REGISTERED_DEVICES
```

## Testing the Setup

### 1. Deploy Your Changes

First, make sure your code changes are deployed:

```bash
# From your project directory
npm run build
git add .
git commit -m "Add device-based access control"
git push origin main
```

Vercel will automatically deploy your changes.

### 2. Test Authentication

1. Visit your deployed site: `https://personal-expense-tracker-one-psi.vercel.app`
2. You should see an authentication screen requesting your master password
3. Enter the master password you set in the environment variable
4. The system should register your device and grant access
5. Future visits from the same browser should automatically authenticate

### 3. Test Multi-Device Access

1. Open your site on a different device or browser
2. You should see the authentication screen again
3. Enter your master password to register the new device
4. Both devices should now have automatic access

## Security Recommendations

### Master Password Best Practices

- Use a strong, unique password (at least 12 characters)
- Include uppercase, lowercase, numbers, and symbols
- Don't use the same password for other services
- Store it securely (password manager recommended)

### Regular Maintenance

1. **Monitor Device List**: Regularly check registered devices in Settings
2. **Revoke Old Devices**: Remove devices you no longer use
3. **Rotate Password**: Consider changing your master password periodically

### Additional Security Measures

1. **Enable Vercel Security Headers**: Add security headers in your `vercel.json`
2. **Monitor Access Logs**: Keep an eye on Vercel function logs for suspicious activity
3. **Use HTTPS Only**: Ensure your site is only accessible via HTTPS (Vercel does this by default)

## Troubleshooting

### Common Issues

**Issue: "Master password environment variable not set"**
- Solution: Verify the environment variable is set correctly in Vercel dashboard
- Check spelling: `EXPENSE_TRACKER_MASTER_PASSWORD`

**Issue: Authentication screen appears every time**
- Solution: Check browser localStorage, ensure cookies/storage aren't being cleared
- Try a different browser to test

**Issue: "Invalid or expired token" errors**
- Solution: Clear browser localStorage and re-authenticate
- Check that device tokens environment variable is properly formatted

**Issue: Can't access settings page**
- Solution: Ensure you're authenticated first, then navigate to `/settings`

### Getting Help

If you encounter issues:

1. Check browser developer console for error messages
2. Check Vercel function logs in the dashboard
3. Verify all environment variables are set correctly
4. Try clearing browser localStorage and re-authenticating

## Environment Variable Management

### Updating Device Lists

As you use the system, the `EXPENSE_TRACKER_DEVICE_TOKENS` and `EXPENSE_TRACKER_REGISTERED_DEVICES` environment variables will be automatically updated. However, these updates only persist in the server memory during runtime.

**Important**: In a production Vercel environment, you'll need to manually update these environment variables in the Vercel dashboard when:

- You want to permanently save device registrations
- You want to revoke devices permanently
- You're cleaning up old device data

### Backup and Recovery

1. **Backup Device Data**: Regularly copy the values of your device environment variables
2. **Export Settings**: Use the settings page to download your financial data
3. **Master Password Recovery**: There's no way to recover a forgotten master password - choose carefully!

## Migration from Unprotected Version

If you're migrating from an unprotected version:

1. Your existing data will remain intact
2. All users (including you) will need to authenticate on first visit after deployment
3. Consider notifying users if this is a shared family expense tracker

## Next Steps

After successful setup:

1. Test the authentication flow on multiple devices
2. Share the master password securely with family members (if applicable)  
3. Regularly monitor the device list in Settings
4. Consider setting up alerts for unusual access patterns

Your Personal Expense Tracker is now secured with device-based access control! 🔒

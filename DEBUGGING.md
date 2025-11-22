# Debugging Vercel API Errors

## Current Issue: FUNCTION_INVOCATION_FAILED

This error means the function is being invoked but failing during execution.

## Step-by-Step Debugging

### 1. Test Basic API Connectivity

First, verify that your API endpoints are accessible:

```bash
# Test health endpoint
curl https://resume-builder-3cbg.vercel.app/api/health

# Test simple endpoint
curl https://resume-builder-3cbg.vercel.app/api/export/test

# Test simple PDF endpoint (no Chromium)
curl https://resume-builder-3cbg.vercel.app/api/export/simple-pdf
```

If these work, the issue is specific to Chromium/Puppeteer.

### 2. Check Vercel Function Logs

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on the latest deployment
4. Go to "Functions" tab
5. Click on `api/export/pdf`
6. Check the "Logs" section for detailed error messages

Look for:
- Dependency loading errors
- Chromium executable path errors
- Memory/timeout errors
- Browser launch failures

### 3. Common Issues and Solutions

#### Issue: Chromium Binary Too Large

**Symptom**: Function size exceeds 50MB limit

**Solution**:
- The `@sparticuz/chromium` package should handle this automatically
- If still failing, try using a lighter version or external PDF service

#### Issue: Memory Limit Exceeded

**Symptom**: Function runs out of memory

**Solution**:
- Current setting: 1024MB (1GB)
- Vercel Free tier: 1024MB max
- Vercel Pro: Up to 3008MB
- If needed, upgrade to Pro plan or optimize HTML size

#### Issue: Timeout

**Symptom**: Function times out after 60 seconds

**Solution**:
- Current timeout: 60 seconds
- Reduce HTML complexity
- Use `waitUntil: 'load'` instead of `'networkidle0'` (already done)

#### Issue: Chromium Initialization Fails

**Symptom**: Error getting Chromium executable path

**Solution**:
- Check that `@sparticuz/chromium` version is compatible
- Current version: `^131.0.0`
- Try updating: `npm install @sparticuz/chromium@latest` in `api/` directory

### 4. Test Locally First

Before deploying, test the function locally:

```bash
cd api
npm install

# Create a test script
node -e "
const func = require('./export/pdf.js');
const req = {
  method: 'POST',
  body: {
    html: '<html><body><h1>Test</h1></body></html>'
  }
};
const res = {
  setHeader: () => {},
  status: (code) => ({ json: (obj) => console.log(code, obj) }),
  send: (data) => console.log('Sent', data.length, 'bytes')
};
func(req, res).catch(console.error);
"
```

### 5. Alternative: Use External PDF Service

If Chromium continues to fail, consider using an external service:

- **PDFShift API**: https://pdfshift.io
- **HTML/CSS to PDF API**: https://htmlcsstoimage.com
- **Puppeteer as a Service**: Various providers

### 6. Check Vercel Plan Limits

**Free Tier Limits**:
- Function size: 50MB
- Memory: 1024MB
- Duration: 60s (Pro: 300s)
- Concurrent executions: Limited

**If hitting limits**, consider:
- Upgrading to Vercel Pro
- Using external PDF service
- Optimizing function size

### 7. Recent Changes Made

1. ✅ Improved error handling with detailed logging
2. ✅ Changed `waitUntil` from `networkidle0` to `load` (faster)
3. ✅ Added browser launch error handling
4. ✅ Added dependency loading error handling
5. ✅ Reduced memory from 3008MB to 1024MB (free tier compatible)
6. ✅ Increased timeout to 60 seconds
7. ✅ Added single-process flag for Chromium

### 8. Next Steps

1. **Deploy the updated code**
2. **Check function logs** in Vercel dashboard
3. **Test with simple HTML** first (minimal content)
4. **Gradually increase complexity** to find the breaking point

### 9. If Still Failing

Share the exact error from Vercel logs, including:
- Full error message
- Stack trace
- Function execution time
- Memory usage
- Any dependency errors

This will help identify the specific issue.


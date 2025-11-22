const sanitizeHtml = require('sanitize-html');
const { JSDOM } = require('jsdom');

let puppeteer;
let chromium;

async function getBrowser() {
  try {
    if (!puppeteer) {
      puppeteer = require('puppeteer-core');
      chromium = require('@sparticuz/chromium');
      
      if (chromium.setGraphicsMode) {
        chromium.setGraphicsMode(false);
      }
    }
    return { puppeteer, chromium };
  } catch (err) {
    console.error('Failed to load dependencies:', err);
    throw new Error(`Dependency loading failed: ${err.message}`);
  }
}

function sanitizeHtmlStrict(html) {
  return sanitizeHtml(html, {
    allowedTags: false,
    allowedAttributes: false,
    allowedSchemesByTag: {},
    allowProtocolRelative: false,
  });
}

function wrapHtmlDocument(contentHtml) {
  const hasHtmlTag = /<html[\s\S]*?>[\s\S]*<\/html>/i.test(contentHtml);
  if (hasHtmlTag) return contentHtml;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body>${contentHtml}</body></html>`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    
    if (!body) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }

    const { html, pdfOptions } = body;
    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid html string' });
    }
    
    if (html.length > 2_000_000) {
      return res.status(400).json({ error: 'HTML string too large (max 2MB)' });
    }

    const safeHtml = wrapHtmlDocument(sanitizeHtmlStrict(html));
    new JSDOM(safeHtml);

    const { puppeteer: pptr, chromium: chrom } = await getBrowser();

    let executablePath;
    try {
      executablePath = await chrom.executablePath();
      console.log('Chromium executable path obtained');
    } catch (chromErr) {
      console.error('Failed to get Chromium executable path:', chromErr);
      return res.status(500).json({ 
        error: 'Failed to initialize Chromium',
        message: chromErr.message,
        details: chromErr.stack
      });
    }

    let browser;
    try {
      const launchArgs = [
        ...chrom.args,
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ];

      browser = await pptr.launch({
        args: launchArgs,
        defaultViewport: chrom.defaultViewport || { width: 1920, height: 1080 },
        executablePath: executablePath,
        headless: chrom.headless !== false,
        ignoreHTTPSErrors: true,
      });
      console.log('Browser launched successfully');
    } catch (launchErr) {
      console.error('Failed to launch browser:', launchErr);
      return res.status(500).json({ 
        error: 'Failed to launch browser',
        message: launchErr.message,
        details: launchErr.stack
      });
    }

    const page = await browser.newPage();
    
    await page.setContent(safeHtml, { 
      waitUntil: 'load',
      timeout: 10000
    });

    await page.evaluateHandle('document.fonts.ready');

    const defaultPdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    };
    
    const pdfBuffer = await page.pdf({ ...defaultPdfOptions, ...(pdfOptions || {}) });
    
    await page.close();
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('PDF export failed:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'PDF export failed', 
        message: err.message,
        name: err.name,
        stack: process.env.VERCEL_ENV === 'development' ? err.stack : undefined
      });
    }
  }
};


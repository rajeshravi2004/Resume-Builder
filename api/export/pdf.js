const sanitizeHtml = require('sanitize-html');
const { JSDOM } = require('jsdom');

let puppeteer;
let chromium;

async function getBrowser() {
  if (!puppeteer) {
    puppeteer = require('puppeteer-core');
    chromium = require('@sparticuz/chromium');
    chromium.setGraphicsMode(false);
  }
  return { puppeteer, chromium };
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
    const { html, pdfOptions } = req.body || {};
    if (!html || typeof html !== 'string' || html.length > 2_000_000) {
      return res.status(400).json({ error: 'Missing or invalid html string' });
    }

    const safeHtml = wrapHtmlDocument(sanitizeHtmlStrict(html));
    new JSDOM(safeHtml);

    const { puppeteer: pptr, chromium: chrom } = await getBrowser();

    const browser = await pptr.launch({
      args: chrom.args,
      defaultViewport: chrom.defaultViewport,
      executablePath: await chrom.executablePath(),
      headless: chrom.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setContent(safeHtml, { waitUntil: 'networkidle0' });

    const defaultPdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    };
    const pdfBuffer = await page.pdf({ ...defaultPdfOptions, ...(pdfOptions || {}) });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('PDF export failed:', err);
    res.status(500).json({ error: 'PDF export failed', message: err.message });
  }
};


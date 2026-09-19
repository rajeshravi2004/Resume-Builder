const express = require('express');
const cors = require('cors');
const sanitizeHtml = require('sanitize-html');
const puppeteer = require('puppeteer');
const { buildResumeDocx } = require('../api/export/build-docx');
const aiHandler = require('../api/ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '5mb' }));

function getChromePath(overridePath) {
  if (overridePath && overridePath.trim().length > 0) return overridePath.trim();
  if (process.env.CHROME_PATH && process.env.CHROME_PATH.trim().length > 0) return process.env.CHROME_PATH.trim();
  // Common Windows default (user requested own Chrome path; we keep a sensible fallback)
  return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

function sanitizeHtmlStrict(html) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['html', 'head', 'body', 'style', 'section', 'article', 'header', 'main', 'aside', 'img']),
    allowedAttributes: {
      '*': ['class', 'style'],
      img: ['src', 'alt'],
      meta: ['charset', 'name', 'content'],
      html: ['lang'],
    },
    allowedSchemes: ['http', 'https', 'data', 'mailto'],
    allowProtocolRelative: false,
    allowVulnerableTags: true,
  });
}

function wrapHtmlDocument(contentHtml) {
  const hasHtmlTag = /<html[\s\S]*?>[\s\S]*<\/html>/i.test(contentHtml);
  if (hasHtmlTag) return contentHtml;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body>${contentHtml}</body></html>`;
}

app.get('/health', (req, res) => {
  const aiProviders = aiHandler.getAiProviders();
  res.json({ ok: true, aiConfigured: Object.values(aiProviders).some(Boolean), aiProviders, chromePath: getChromePath() });
});

app.post('/ai', aiHandler);

app.post('/export/pdf', async (req, res) => {
  try {
    const { html, pdfOptions, chromePath } = req.body || {};
    if (!html || typeof html !== 'string' || html.length > 2_000_000) {
      return res.status(400).json({ error: 'Missing html string' });
    }

    const safeHtml = wrapHtmlDocument(sanitizeHtmlStrict(html));
    const launchConfig = {
      headless: true,
      executablePath: getChromePath(chromePath),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
    const browser = await puppeteer.launch(launchConfig);
    const page = await browser.newPage();
    await page.setContent(safeHtml, { waitUntil: 'networkidle0' });

    const defaultPdfOptions = { format: 'A4', printBackground: true, margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' } };
    const pdfBuffer = await page.pdf({ ...defaultPdfOptions, ...(pdfOptions || {}) });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('PDF export failed:', err);
    res.status(500).json({ error: 'PDF export failed' });
  }
});

app.post('/export/docx', async (req, res) => {
  try {
    const docxBuffer = await buildResumeDocx(req.body?.resume);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.docx"');
    res.send(docxBuffer);
  } catch (err) {
    console.error('DOCX export failed:', err);
    res.status(500).json({ error: 'DOCX export failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});



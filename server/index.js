const express = require('express');
const cors = require('cors');
const sanitizeHtml = require('sanitize-html');
const puppeteer = require('puppeteer');
const { buildResumeDocx } = require('../api/export/build-docx');
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
  res.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY), chromePath: getChromePath() });
});

app.post('/ai', async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'AI is not configured. Add OPENAI_API_KEY to the server environment.' });
  }
  try {
    const { type, text, instruction, context, prompt } = req.body || {};
    if (!['refine', 'design'].includes(type)) return res.status(400).json({ error: 'Unsupported AI request' });
    if (type === 'refine' && (!text || text.length > 15000)) return res.status(400).json({ error: 'Text is required and must be under 15,000 characters.' });
    if (type === 'design' && (!prompt || prompt.length > 3000)) return res.status(400).json({ error: 'A design prompt is required.' });

    const instructions = type === 'refine'
      ? 'You are a meticulous executive resume editor. Return only the revised text. Preserve factual accuracy, dates, technologies, names, and metrics. Never invent achievements.'
      : 'You are a senior editorial designer creating ATS-conscious resume systems. Return ONLY valid JSON without markdown. Use accessible contrast and print-safe choices.';
    const input = type === 'refine'
      ? `Context: ${String(context || 'resume content').slice(0, 500)}\nInstruction: ${String(instruction || 'Improve clarity and impact').slice(0, 1000)}\n\nText:\n${text}`
      : `Create an editable resume design from this request: ${prompt}\nReturn JSON exactly with this shape: {"name":"short design name","design":{"primaryColor":"#hex","accentColor":"#hex","textColor":"#hex","fontFamily":"Inter, Arial, Georgia, Times New Roman, Trebuchet, or Garamond with fallbacks","headingFont":"same options","fontSize":number 8.5-13,"nameSize":number 24-46,"lineHeight":number 1.2-1.8,"pageMargin":number 20-56,"sectionSpacing":number 8-30,"itemSpacing":number 5-18,"layout":"one-column or two-column","sidebarSide":"left or right","sidebarWidth":number 25-40,"headerAlign":"left or center"}}`;
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-5-mini', instructions, input, store: false }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message || 'OpenAI request failed');
    const output = payload.output_text || (payload.output || []).flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text || '';
    if (!output) throw new Error('The AI response was empty.');
    if (type === 'refine') return res.json({ text: output.trim() });
    const cleaned = output.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    return res.json(JSON.parse(cleaned));
  } catch (error) {
    console.error('AI request failed:', error);
    return res.status(500).json({ error: error.message || 'AI request failed' });
  }
});

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



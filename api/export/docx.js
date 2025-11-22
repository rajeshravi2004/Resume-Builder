const sanitizeHtml = require('sanitize-html');
const htmlDocx = require('html-docx-js');

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
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }

    const { html } = body || {};
    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'Missing html string' });
    }

    const safeHtml = wrapHtmlDocument(
      sanitizeHtml(html, {
        allowedTags: false,
        allowedAttributes: false,
        allowProtocolRelative: false,
      })
    );

    const docxBuffer = htmlDocx.asBlob(safeHtml);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.docx"');
    res.send(Buffer.from(docxBuffer));
  } catch (err) {
    console.error('DOCX export failed:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'DOCX export failed', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};


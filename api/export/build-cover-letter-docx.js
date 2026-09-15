const { BorderStyle, Document, Packer, Paragraph, TextRun } = require('docx');

const clean = value => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const color = (value, fallback) => /^#[0-9a-f]{6}$/i.test(value || '') ? value.slice(1) : fallback;

const buildCoverLetterDocx = async resume => {
  const letter = resume?.coverLetter;
  const basics = resume?.data?.basics;
  if (!basics || !letter || typeof letter.body !== 'string' || !letter.body.trim()) throw new Error('A cover letter with body text is required.');
  const paragraph = (text, options = {}) => new Paragraph({ spacing: { after: 200 }, children: clean(text).split('\n').map((line, index) => new TextRun({ text: line, ...(index ? { break: 1 } : {}), ...options })) });
  const subject = letter.subject || (letter.role ? `Application for ${letter.role}` : '');
  const children = [
    paragraph(basics.fullName || 'Your name', { font: 'Georgia', size: 56, bold: true, color: color(resume.design?.primaryColor, '172554') }),
    new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: color(resume.design?.accentColor, 'C2410C') } }, spacing: { after: 320 }, children: [new TextRun({ text: [basics.email, basics.phone, basics.location, basics.website].filter(Boolean).map(clean).join(' · '), size: 18, color: '596579' })] }),
    ...(letter.date ? [paragraph(letter.date)] : []),
    ...([letter.recipient, letter.company, letter.address].some(Boolean) ? [paragraph([letter.recipient, letter.company, letter.address].filter(Boolean).join('\n'))] : []),
    ...(subject ? [paragraph(subject, { bold: true })] : []),
    paragraph(letter.greeting || ''),
    ...letter.body.split(/\n\s*\n/).filter(Boolean).map(text => paragraph(text)),
    paragraph([letter.closing, basics.fullName].filter(Boolean).join('\n')),
  ];
  return Packer.toBuffer(new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 22, color: '253044' }, paragraph: { spacing: { line: 384 }, widowControl: true } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1020, right: 1020, bottom: 1020, left: 1020 } } }, children }],
  }));
};

module.exports = { buildCoverLetterDocx };

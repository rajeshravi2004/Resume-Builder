const {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} = require('docx');

const clean = value => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const color = (value, fallback) => /^#[0-9a-f]{6}$/i.test(value || '') ? value.slice(1) : fallback;
const fontName = value => clean(value || 'Arial').split(',')[0].replace(/["']/g, '').trim();

const itemParagraphs = (key, item, design) => {
  const primary = color(design.primaryColor, '172554');
  const accent = color(design.accentColor, 'C2410C');
  const base = { spacing: { after: Math.round((design.itemSpacing || 10) * 10) } };
  if (key === 'experience') return [
    new Paragraph({ ...base, children: [new TextRun({ text: clean(item.role), bold: true, color: primary }), new TextRun({ text: item.company ? `  |  ${clean(item.company)}` : '', bold: true, color: accent })] }),
    ...(item.period ? [new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: clean(item.period), italics: true, color: '667085', size: 18 })] })] : []),
    ...(item.summary ? [new Paragraph({ ...base, children: [new TextRun(clean(item.summary))] })] : []),
  ];
  if (key === 'projects') return [
    new Paragraph({ ...base, children: [new TextRun({ text: clean(item.name), bold: true, color: primary }), new TextRun({ text: item.tech ? `  |  ${clean(item.tech)}` : '', italics: true, color: '667085', size: 18 })] }),
    ...(item.description ? [new Paragraph({ ...base, children: [new TextRun(clean(item.description))] })] : []),
  ];
  if (key === 'education') return [new Paragraph({ ...base, children: [new TextRun({ text: clean(item.degree), bold: true, color: primary }), new TextRun({ text: item.school ? `  |  ${clean(item.school)}` : '', color: accent }), new TextRun({ text: [item.period, item.score].filter(Boolean).length ? `  —  ${[item.period, item.score].filter(Boolean).map(clean).join(' · ')}` : '', color: '667085', size: 18 })] })];
  if (key === 'skills') return [new Paragraph({ ...base, children: [new TextRun({ text: clean(item.name), bold: true, color: primary }), new TextRun({ text: item.level ? `: ${clean(item.level)}` : '' })] })];
  if (key === 'certifications') return [new Paragraph({ ...base, children: [new TextRun({ text: clean(item.name), bold: true }), new TextRun({ text: item.year ? ` — ${clean(item.year)}` : '', color: '667085' })] })];
  if (key === 'languages') return [new Paragraph({ ...base, children: [new TextRun({ text: clean(item.name), bold: true }), new TextRun({ text: item.level ? ` — ${clean(item.level)}` : '', color: '667085' })] })];
  return [new Paragraph({ ...base, bullet: { level: 0 }, children: [new TextRun(clean(item.name))] })];
};

const buildResumeDocx = async resume => {
  if (!resume?.data?.basics || !resume?.data?.sections) throw new Error('A valid resume document is required.');
  const design = resume.design || {};
  const basics = resume.data.basics;
  const primary = color(design.primaryColor, '172554');
  const accent = color(design.accentColor, 'C2410C');
  const bodyFont = fontName(design.fontFamily);
  const headingFont = fontName(design.headingFont || design.fontFamily);
  const bodySize = Math.round(Number(design.fontSize || 10.5) * 2);
  const alignment = design.headerAlign === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT;
  const children = [
    new Paragraph({ alignment, spacing: { after: 40 }, children: [new TextRun({ text: clean(basics.fullName || 'Your name'), bold: true, color: primary, font: headingFont, size: Math.round(Number(design.nameSize || 32) * 2) })] }),
    new Paragraph({ alignment, spacing: { after: 70 }, children: [new TextRun({ text: clean(basics.title), bold: true, color: accent, size: bodySize + 2 })] }),
    new Paragraph({ alignment, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: accent } }, spacing: { after: 160 }, children: [new TextRun({ text: [basics.email, basics.phone, basics.location, basics.linkedin, basics.github, basics.website].filter(Boolean).map(clean).join('  |  '), color: '4B5563', size: Math.max(16, bodySize - 2) })] }),
  ];

  if (basics.summary) children.push(new Paragraph({ spacing: { after: 170 }, children: [new TextRun(clean(basics.summary))] }));
  const order = design.sectionOrder || Object.keys(resume.data.sections);
  for (const key of order) {
    const settings = design.sectionSettings?.[key] || {};
    const items = resume.data.sections[key] || [];
    if (settings.hidden || !items.length) continue;
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 80, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: accent } }, children: [new TextRun({ text: clean(settings.title || key), bold: true, color: primary, font: headingFont, size: bodySize + 1, allCaps: true })] }));
    for (const item of items) children.push(...itemParagraphs(key, item, design));
  }

  const margin = Math.round(Number(design.pageMargin || 32) * 15);
  const document = new Document({
    styles: { default: { document: { run: { font: bodyFont, size: bodySize, color: color(design.textColor, '1F2937') }, paragraph: { spacing: { line: Math.round(Number(design.lineHeight || 1.48) * 240) } } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: margin, right: margin, bottom: margin, left: margin } } }, children }],
  });
  return Packer.toBuffer(document);
};

module.exports = { buildResumeDocx };

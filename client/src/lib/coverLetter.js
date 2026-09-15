export const getCoverLetter = resume => ({
  company: '', role: resume?.targetRole || resume?.data?.basics?.title || '',
  recipient: '', address: '', date: new Date().toLocaleDateString('en-CA'),
  subject: '', greeting: 'Dear Hiring Manager,', body: '', closing: 'Sincerely,',
  ...resume?.coverLetter,
})

export const createCoverLetterDraft = (resume, letter) => {
  const basics = resume?.data?.basics || {}
  const experience = resume?.data?.sections?.experience?.find(item => item.summary?.trim())
  const project = resume?.data?.sections?.projects?.find(item => item.description?.trim())
  return [
    `I am writing to apply for the ${letter.role.trim() || 'open'} position${letter.company.trim() ? ` at ${letter.company.trim()}` : ''}. ${basics.summary?.trim() || 'I would welcome the opportunity to discuss how my background could contribute to your team.'}`,
    experience ? `${experience.role ? `In my role as ${experience.role}${experience.company ? ` at ${experience.company}` : ''}: ` : ''}${experience.summary}` : project ? `${project.name ? `My work on ${project.name}: ` : ''}${project.description}` : '',
    'Thank you for considering my application. I would appreciate the opportunity to discuss the role and how I can contribute. I look forward to hearing from you.',
  ].filter(Boolean).join('\n\n')
}

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const lines = value => escape(value).replace(/\n/g, '<br>')
const color = value => /^#[\da-f]{6}$/i.test(value || '') ? value : '#172554'

export const renderCoverLetterHtml = resume => {
  const letter = getCoverLetter(resume)
  const basics = resume?.data?.basics || {}
  const subject = letter.subject || (letter.role ? `Application for ${letter.role}` : '')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(basics.fullName || 'Cover letter')} — Cover letter</title><style>
    @page { size: A4; margin: 18mm; }
    * { box-sizing: border-box; } body { margin: 0; color: #253044; background: white; font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; overflow-wrap: anywhere; }
    article { padding: 18mm; } header { border-bottom: 2px solid ${color(resume?.design?.accentColor)}; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { margin: 0 0 4px; color: ${color(resume?.design?.primaryColor)}; font-family: Georgia, serif; font-size: 28pt; line-height: 1.2; }
    .contact { color: #596579; font-size: 9pt; } .recipient { margin: 18px 0; } .subject { font-weight: bold; } p { margin: 0 0 16px; orphans: 3; widows: 3; } .signature { break-inside: avoid; }
    @media print { article { padding: 0; } }
  </style></head><body><article><header><h1>${escape(basics.fullName || 'Your name')}</h1><div class="contact">${[basics.email, basics.phone, basics.location, basics.website].filter(Boolean).map(escape).join(' · ')}</div></header>
    ${letter.date ? `<p>${escape(letter.date)}</p>` : ''}
    ${[letter.recipient, letter.company, letter.address].some(Boolean) ? `<div class="recipient">${[letter.recipient, letter.company, letter.address].filter(Boolean).map(lines).join('<br>')}</div>` : ''}
    ${subject ? `<p class="subject">${escape(subject)}</p>` : ''}<p>${escape(letter.greeting)}</p>
    ${letter.body.split(/\n\s*\n/).filter(Boolean).map(paragraph => `<p>${lines(paragraph)}</p>`).join('')}
    <div class="signature">${escape(letter.closing)}<br>${escape(basics.fullName)}</div>
  </article></body></html>`
}

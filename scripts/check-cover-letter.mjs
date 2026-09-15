import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { createCoverLetterDraft, getCoverLetter, renderCoverLetterHtml } from '../client/src/lib/coverLetter.js'

const require = createRequire(import.meta.url)
const { buildResumeDocx } = require('../api/export/build-docx.js')
const JSZip = require('../api/node_modules/jszip')
const resume = { data: { basics: { fullName: 'Test Applicant', email: 'applicant@example.com', summary: 'Built accessible tools.' }, sections: { experience: [{ role: 'Engineer', company: 'Example', summary: 'Improved document workflows.' }] } }, design: { primaryColor: '#15213b', accentColor: '#e05a33' } }
const letter = { ...getCoverLetter(resume), company: 'Example & Co', role: 'Product Engineer', recipient: 'Hiring Team', body: 'First paragraph.\nA second line.\n\nA final paragraph.' }
const draft = createCoverLetterDraft(resume, letter)
assert.match(draft, /Built accessible tools/)
assert.match(draft, /Improved document workflows/)
assert.match(draft, /Example & Co/)
const emptyDraft = createCoverLetterDraft({ data: { basics: {}, sections: {} } }, { role: '', company: '' })
assert.ok(!emptyDraft.includes('undefined'))
const html = renderCoverLetterHtml({ ...resume, coverLetter: { ...letter, recipient: '<script>alert(1)</script>' } })
assert.ok(!html.includes('<script>'))
assert.match(html, /&lt;script&gt;/)
assert.match(html, /Example &amp; Co/)
assert.match(html, /First paragraph\.<br>A second line\./)
const buffer = await buildResumeDocx({ ...resume, documentType: 'cover-letter', coverLetter: letter })
const xml = await (await JSZip.loadAsync(buffer)).file('word/document.xml').async('string')
for (const text of ['Test Applicant', 'Hiring Team', 'Product Engineer', 'First paragraph.', 'A second line.', 'A final paragraph.']) assert.ok(xml.includes(text), `Missing DOCX text: ${text}`)
assert.ok(xml.includes('Example &amp; Co'))
await assert.rejects(buildResumeDocx({ ...resume, documentType: 'cover-letter', coverLetter: { body: '' } }), /body text/)
const resumeBuffer = await buildResumeDocx(resume)
assert.ok(resumeBuffer.length > 1000, 'Existing resume export still works')
console.log('PASS: factual draft, blank profile, safe HTML, multiline text, valid Word contents, empty-letter validation, and existing resume export')

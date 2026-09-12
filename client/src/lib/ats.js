const STOP_WORDS = new Set([
  'and', 'the', 'with', 'for', 'from', 'that', 'this', 'you', 'your', 'our', 'are', 'will', 'have', 'has', 'into', 'using', 'who', 'but', 'not', 'all', 'any', 'can', 'job', 'role', 'team', 'work', 'years', 'about', 'their', 'they', 'them', 'its', 'must', 'preferred', 'required', 'responsibilities', 'skills',
])

const textOf = resume => {
  const basics = resume?.data?.basics || {}
  const sections = resume?.data?.sections || {}
  return [
    ...Object.values(basics),
    ...Object.values(sections).flatMap(items => (items || []).flatMap(item => Object.values(item))),
  ].filter(Boolean).join(' ')
}

const words = value => String(value || '').toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || []

const meaningfulKeywords = value => {
  const frequency = new Map()
  words(value).forEach(word => {
    const clean = word.replace(/^[.-]+|[.-]+$/g, '')
    if (!STOP_WORDS.has(clean) && clean.length > 2) frequency.set(clean, (frequency.get(clean) || 0) + 1)
  })
  return [...frequency.entries()].sort((a, b) => b[1] - a[1]).map(([word]) => word).slice(0, 24)
}

const clamp = value => Math.max(0, Math.min(100, Math.round(value)))

export function getFormatScore(design = {}) {
  let score = 100
  const risks = []
  if (design.layout === 'two-column') { score -= 10; risks.push('Two-column layouts can be read out of order by older ATS tools.') }
  if (design.showPhoto) { score -= 12; risks.push('Photos add no searchable information and can confuse parsers.') }
  if (design.customCSS?.trim()) { score -= 6; risks.push('Custom CSS should be tested in the exported file.') }
  if (Number(design.fontSize) < 9.5) { score -= 5; risks.push('Body text below 9.5px may be difficult to read.') }
  if (Number(design.fontSize) > 12) { score -= 3; risks.push('Large body text can create unnecessary extra pages.') }
  if (design.headerAlign === 'center') score -= 2
  if (Object.values(design.sectionSettings || {}).some(setting => setting.variant === 'timeline')) { score -= 3; risks.push('Timeline decoration can reduce parsing consistency.') }
  return { score: clamp(score), risks }
}

export function analyzeResume(resume, jobDescription = '', designOverride) {
  const basics = resume?.data?.basics || {}
  const activeDesign = designOverride || resume?.design || {}
  const rawSections = resume?.data?.sections || {}
  const sections = Object.fromEntries(Object.entries(rawSections).map(([key, items]) => [key, activeDesign.sectionSettings?.[key]?.hidden ? [] : items]))
  const visibleResume = { ...resume, data: { ...resume?.data, sections } }
  const checks = []
  let earned = 0
  let possible = 0
  const add = (id, label, points, pass, detail, section = 'basics') => {
    possible += points
    const gained = typeof pass === 'number' ? points * pass : pass ? points : 0
    earned += gained
    checks.push({ id, label, pass: gained >= points * 0.75, points: Math.round(gained), max: points, detail, section })
  }

  add('identity', 'Complete identity and contact details', 12, [basics.fullName, basics.title, basics.email, basics.phone, basics.location].filter(Boolean).length / 5, 'Add a name, target title, email, phone and location.')
  const summaryLength = words(basics.summary).length
  add('summary', 'Focused professional summary', 10, summaryLength >= 35 && summaryLength <= 100, summaryLength < 35 ? 'Aim for 35-100 words with role, strengths and value.' : 'Keep the summary between 35 and 100 words.')
  const experiences = sections.experience || []
  add('experience', 'Complete work experience', 18, Math.min(1, experiences.filter(item => item.role && item.company && item.period && item.summary).length / 2), 'Include at least two complete roles with dates and outcomes.', 'experience')
  const impactText = experiences.map(item => item.summary).join(' ')
  const quantified = (impactText.match(/(?:\d+(?:\.\d+)?%?|\$[\d,.]+|₹[\d,.]+|\b\d+x\b)/gi) || []).length
  add('impact', 'Measurable achievements', 13, Math.min(1, quantified / Math.max(2, experiences.length)), 'Add numbers, percentages, scale, time saved or revenue impact.', 'experience')
  const skillCount = (sections.skills || []).flatMap(item => String(item.level || item.name || '').split(/[,|/]/)).filter(value => value.trim()).length
  add('skills', 'Searchable skills', 12, Math.min(1, skillCount / 10), 'List at least 10 role-relevant hard skills.', 'skills')
  add('education', 'Education details', 8, (sections.education || []).some(item => item.degree && item.school), 'Include a degree or qualification and institution.', 'education')
  add('supporting', 'Projects or certifications', 7, (sections.projects || []).length > 0 || (sections.certifications || []).length > 0, 'Add proof through projects or certifications.', 'projects')
  const contentWordCount = words(textOf(visibleResume)).length
  add('length', 'Useful content depth', 10, contentWordCount >= 250 && contentWordCount <= 900, contentWordCount < 250 ? 'Add specific evidence; the resume is currently too light.' : 'Keep the resume concise and remove repetition.')
  const professionalLink = Boolean(basics.linkedin || basics.github || basics.website)
  add('links', 'Professional links', 5, professionalLink, 'Add LinkedIn, GitHub or a portfolio URL.')
  add('dates', 'Consistent dates', 5, experiences.length > 0 && experiences.every(item => /\d{4}|present|current/i.test(item.period || '')), 'Use clear years for every role.', 'experience')

  const contentScore = clamp((earned / possible) * 100)
  const format = getFormatScore(activeDesign)
  const jobKeywords = meaningfulKeywords(jobDescription)
  const resumeWords = new Set(words(textOf(visibleResume)))
  const matchedKeywords = jobKeywords.filter(keyword => resumeWords.has(keyword))
  const missingKeywords = jobKeywords.filter(keyword => !resumeWords.has(keyword))
  const keywordScore = jobKeywords.length ? clamp((matchedKeywords.length / jobKeywords.length) * 100) : null
  const overall = keywordScore === null
    ? clamp(contentScore * 0.75 + format.score * 0.25)
    : clamp(contentScore * 0.55 + format.score * 0.25 + keywordScore * 0.20)

  return {
    overall,
    contentScore,
    formatScore: format.score,
    keywordScore,
    matchedKeywords,
    missingKeywords,
    checks: checks.sort((a, b) => Number(a.pass) - Number(b.pass) || b.max - a.max),
    formatRisks: format.risks,
    wordCount: contentWordCount,
  }
}

export function projectedTemplateScore(resume, preset, jobDescription = '') {
  const design = { ...(resume?.design || {}), ...(preset?.patch || {}), template: preset?.id }
  return analyzeResume(resume, jobDescription, design).overall
}

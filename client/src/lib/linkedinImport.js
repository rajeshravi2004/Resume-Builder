const clean = value => String(value || '').replace(/\s+/g, ' ').trim()

const SECTION_NAMES = {
  experience: ['experience', 'work experience', 'employment'],
  education: ['education'],
  skills: ['skills', 'top skills'],
  certifications: ['licenses & certifications', 'licenses and certifications', 'certifications'],
  projects: ['projects'],
}

const headingKey = line => Object.entries(SECTION_NAMES).find(([, names]) => names.includes(clean(line).toLowerCase()))?.[0]

const splitBlocks = lines => {
  const buckets = { header: [] }
  let current = 'header'
  lines.forEach(line => {
    const next = headingKey(line)
    if (next) { current = next; buckets[current] ||= []; return }
    buckets[current] ||= []
    buckets[current].push(line)
  })
  return buckets
}

const chunk = lines => {
  const groups = []
  let active = []
  lines.forEach(line => {
    if (!clean(line)) {
      if (active.length) groups.push(active)
      active = []
    } else active.push(clean(line))
  })
  if (active.length) groups.push(active)
  return groups
}

export function parseLinkedInText(raw) {
  const source = String(raw || '').replace(/\r/g, '')
  const lines = source.split('\n').map(line => line.trim())
  const nonEmpty = lines.filter(Boolean)
  const buckets = splitBlocks(lines)
  const email = source.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0] || ''
  const linkedin = source.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w%-]+\/?/i)?.[0] || ''
  const phone = (source.match(/(?:\+?\d[\d\s().-]{7,}\d)/g) || []).find(value => value.replace(/\D/g, '').length >= 10)?.trim() || ''
  const header = (buckets.header || []).filter(line => !email.includes(line) && !/linkedin\.com|contact/i.test(line))
  const name = clean(header[0] || nonEmpty[0] || '')
  const title = clean(header.find((line, index) => index > 0 && !line.includes('@') && !/^\+?\d/.test(line) && line.length < 120) || '')
  const location = clean(header.find(line => /,/.test(line) && !/@|linkedin\.com/i.test(line) && !/\d{4}/.test(line)) || '')

  const experience = chunk(buckets.experience || []).map((group, index) => {
    const dateIndex = group.findIndex(line => /(?:19|20)\d{2}|present|current/i.test(line))
    const beforeDate = dateIndex >= 0 ? group.slice(0, dateIndex) : group.slice(0, 2)
    const afterDate = dateIndex >= 0 ? group.slice(dateIndex + 1) : group.slice(2)
    return { id: `linkedin-exp-${index}`, role: beforeDate[0] || '', company: beforeDate[1] || '', period: dateIndex >= 0 ? group[dateIndex] : '', summary: afterDate.join(' ') }
  }).filter(item => item.role || item.company)

  const education = chunk(buckets.education || []).map((group, index) => {
    const dateIndex = group.findIndex(line => /(?:19|20)\d{2}/.test(line))
    return { id: `linkedin-edu-${index}`, school: group[0] || '', degree: group[1] || '', period: dateIndex >= 0 ? group[dateIndex] : '', score: '' }
  }).filter(item => item.school || item.degree)

  const skills = (buckets.skills || []).filter(Boolean).flatMap(line => line.split(/[,|•]/)).map(clean).filter(Boolean)
  const certifications = chunk(buckets.certifications || []).map((group, index) => ({ id: `linkedin-cert-${index}`, name: group[0] || '', year: group.slice(1).join(' · ') })).filter(item => item.name)
  const projects = chunk(buckets.projects || []).map((group, index) => ({ id: `linkedin-project-${index}`, name: group[0] || '', tech: '', description: group.slice(1).join(' ') })).filter(item => item.name)

  return {
    basics: { fullName: name, title, email, phone, location, linkedin, summary: '' },
    sections: {
      experience,
      education,
      skills: skills.length ? [{ id: 'linkedin-skills', name: 'Core skills', level: skills.join(', ') }] : [],
      certifications,
      projects,
    },
    sourceLength: source.length,
  }
}

export async function textFromImportFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'pdf') {
    const pdfjs = await import('pdfjs-dist')
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
    const pages = []
    for (let number = 1; number <= document.numPages; number += 1) {
      const page = await document.getPage(number)
      const content = await page.getTextContent()
      let previousY
      let text = ''
      content.items.forEach(item => {
        const y = item.transform?.[5]
        text += previousY !== undefined && Math.abs(y - previousY) > 3 ? `\n${item.str}` : ` ${item.str}`
        previousY = y
      })
      pages.push(text)
    }
    return pages.join('\n')
  }
  if (extension === 'json') {
    const data = JSON.parse(await file.text())
    return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  }
  return file.text()
}

const apiBase = import.meta.env.PROD ? '/api' : 'http://localhost:4000'
export const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
  { id: 'gemini', name: 'Google Gemini', placeholder: 'AIza...' },
]
export const getAiProvider = () => {
  const provider = sessionStorage.getItem('resume-studio-ai-provider')
  return AI_PROVIDERS.some(item => item.id === provider) ? provider : 'openai'
}
export const setAiProvider = provider => {
  if (AI_PROVIDERS.some(item => item.id === provider)) sessionStorage.setItem('resume-studio-ai-provider', provider)
}
const sessionKeyName = provider => `resume-studio-${provider}-key`

export const getSessionAiKey = (provider = getAiProvider()) => sessionStorage.getItem(sessionKeyName(provider)) || ''
export const setSessionAiKey = (value, provider = getAiProvider()) => {
  if (value.trim()) sessionStorage.setItem(sessionKeyName(provider), value.trim())
  else sessionStorage.removeItem(sessionKeyName(provider))
}

const parseError = async response => {
  const payload = await response.json().catch(() => ({}))
  throw new Error(payload.error || payload.message || 'Something went wrong')
}

export const requestAi = async payload => {
  const provider = getAiProvider()
  const sessionKey = getSessionAiKey(provider)
  const response = await fetch(`${apiBase}/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(sessionKey ? { 'X-AI-API-Key': sessionKey } : {}) },
    body: JSON.stringify({ ...payload, provider }),
  })
  if (!response.ok) return parseError(response)
  return response.json()
}

export const exportResume = async (type, html, filename = 'resume', resume) => {
  const response = await fetch(`${apiBase}/export/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, resume, ...(resume?.documentType === 'cover-letter' ? { pdfOptions: { preferCSSPageSize: true, margin: { top: '18mm', right: '18mm', bottom: '18mm', left: '18mm' } } } : {}) }),
  })
  if (!response.ok) return parseError(response)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${filename.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()}.${type}`
  anchor.click()
  URL.revokeObjectURL(url)
}

export const getSystemStatus = async () => {
  const response = await fetch(`${apiBase}/health`)
  if (!response.ok) return { ok: false, aiConfigured: false }
  return response.json()
}

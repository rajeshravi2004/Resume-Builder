const apiBase = import.meta.env.PROD ? '/api' : 'http://localhost:4000'

const parseError = async response => {
  const payload = await response.json().catch(() => ({}))
  throw new Error(payload.error || payload.message || 'Something went wrong')
}

export const requestAi = async payload => {
  const response = await fetch(`${apiBase}/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) return parseError(response)
  return response.json()
}

export const exportResume = async (type, html, filename = 'resume', resume) => {
  const response = await fetch(`${apiBase}/export/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, resume }),
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

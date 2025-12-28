export const getApiBase = () => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (fromEnv) return fromEnv
  if (import.meta.env.DEV) {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    return `http://${host}:5660`
  }
  return ''
}

const buildQuery = (query) => {
  if (!query) return ''
  const params = new URLSearchParams()
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    params.set(k, String(v))
  })
  const s = params.toString()
  return s ? `?${s}` : ''
}

export const requestJson = async ({ method, path, query, body, headers }) => {
  const apiBase = getApiBase()
  const res = await fetch(`${apiBase}${path}${buildQuery(query)}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = data?.message || 'Request failed'
    throw new Error(message)
  }
  return data
}

export const requestForm = async ({ path, formData, headers }) => {
  const apiBase = getApiBase()
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { ...(headers || {}) },
    body: formData,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = data?.message || 'Request failed'
    throw new Error(message)
  }
  return data
}

export const getJson = async (path, query) => requestJson({ method: 'GET', path, query })
export const postJson = async (path, body) => requestJson({ method: 'POST', path, body })
export const putJson = async (path, body) => requestJson({ method: 'PUT', path, body })
export const deleteJson = async (path) => requestJson({ method: 'DELETE', path })

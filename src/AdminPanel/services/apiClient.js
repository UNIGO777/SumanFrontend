export const getApiBase = () => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (fromEnv) return fromEnv
  if (import.meta.env.DEV) {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    return `http://${host}:5660`
  }
  return ''
}

const getAdminToken = () => {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem('admin_token') || window.sessionStorage.getItem('admin_token') || ''
}

const inflightGet = new Map()
const getCache = new Map()

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

export const requestJson = async ({ method, path, query, body, headers, options }) => {
  const apiBase = getApiBase()
  const token = getAdminToken()
  const url = `${apiBase}${path}${buildQuery(query)}`
  const isGet = String(method || '').toUpperCase() === 'GET'

  const noCache = Boolean(options?.noCache)
  const explicitTtl = Number(options?.cacheTtlMs)
  const defaultTtl = String(path || '').startsWith('/api/cms/') ? 10000 : 500
  const cacheTtlMs = isGet && !noCache ? (Number.isFinite(explicitTtl) ? explicitTtl : defaultTtl) : 0

  const tokenKey = token ? `auth:${token.slice(-12)}` : 'anon'
  const cacheKey = `${tokenKey}:${url}`

  if (isGet && cacheTtlMs > 0) {
    const cached = getCache.get(cacheKey)
    if (cached && Date.now() - cached.ts < cacheTtlMs) return cached.data
  }

  if (isGet) {
    const pending = inflightGet.get(cacheKey)
    if (pending) return pending
  }

  const run = async () => {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      const message = data?.message || 'Request failed'
      throw new Error(message)
    }
    return data
  }

  if (!isGet) return run()

  const p = run()
    .then((data) => {
      if (cacheTtlMs > 0) getCache.set(cacheKey, { ts: Date.now(), data })
      return data
    })
    .finally(() => {
      inflightGet.delete(cacheKey)
    })

  inflightGet.set(cacheKey, p)
  return p
}

export const requestForm = async ({ path, formData, headers }) => {
  const apiBase = getApiBase()
  const token = getAdminToken()
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(headers || {}) },
    body: formData,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = data?.message || 'Request failed'
    throw new Error(message)
  }
  return data
}

export const getJson = async (path, query, options) => requestJson({ method: 'GET', path, query, options })
export const postJson = async (path, body) => requestJson({ method: 'POST', path, body })
export const putJson = async (path, body) => requestJson({ method: 'PUT', path, body })
export const deleteJson = async (path) => requestJson({ method: 'DELETE', path })

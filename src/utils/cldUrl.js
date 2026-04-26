const CLOUDINARY_RE = /^https?:\/\/res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\//i

export const isCloudinaryUrl = (url) => typeof url === 'string' && CLOUDINARY_RE.test(url)

export const cldUrl = (url, opts = {}) => {
  if (!isCloudinaryUrl(url)) return url
  const { w, h, c = 'fill', q = 'auto', f = 'auto', dpr } = opts
  const parts = []
  if (f) parts.push(`f_${f}`)
  if (q) parts.push(`q_${q}`)
  if (w) parts.push(`w_${Math.round(w)}`)
  if (h) parts.push(`h_${Math.round(h)}`)
  if (w || h) parts.push(`c_${c}`)
  if (dpr) parts.push(`dpr_${dpr}`)
  if (!parts.length) return url
  return url.replace(/\/upload\//, `/upload/${parts.join(',')}/`)
}

export const cldThumb = (url, w = 400) => cldUrl(url, { w, c: 'fill' })
export const cldCard = (url, w = 600) => cldUrl(url, { w, c: 'fill' })
export const cldHero = (url, w = 1600) => cldUrl(url, { w, c: 'fill' })

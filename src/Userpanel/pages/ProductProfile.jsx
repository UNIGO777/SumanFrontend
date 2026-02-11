import { Heart, Minus, Plus, Star } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import productFallback from '../../assets/876 × 1628-1.png'
import { getApiBase, getJson, postJson } from '../../AdminPanel/services/apiClient.js'
import { computeProductPricing, getSilver925RatePerGram, getSilverWeightGrams } from '../UserServices/pricingService.js'

const CART_KEY = 'sj_cart_v1'
const WISHLIST_KEY = 'sj_wishlist_v1'

const escapeHtml = (s) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const plainTextToHtml = (text) => escapeHtml(text).replace(/\r\n|\r|\n/g, '<br />')

const looksLikeHtml = (s) => /<\/?[a-z][\s\S]*>/i.test(String(s || ''))

const normalizeText = (v) => String(v || '').trim()

const isMongoId = (v) => /^[a-f0-9]{24}$/i.test(normalizeText(v))

const extractMongoId = (key) => {
  const v = normalizeText(key)
  if (!v) return ''
  if (isMongoId(v)) return v
  const parts = v.split('-').map((p) => p.trim()).filter(Boolean)
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (isMongoId(parts[i])) return parts[i]
  }
  return ''
}

const slugify = (v) =>
  normalizeText(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const dedupeUrls = (urls) => {
  const out = []
  const seen = new Set()
  ;(Array.isArray(urls) ? urls : []).forEach((u) => {
    const v = normalizeText(u)
    if (!v) return
    if (seen.has(v)) return
    seen.add(v)
    out.push(v)
  })
  return out
}

const ensureMetaTag = (selector, create, content) => {
  if (typeof document === 'undefined') return
  const head = document.head
  if (!head) return
  const existing = head.querySelector(selector)
  const el = existing || create()
  if (!existing) head.appendChild(el)
  if (content !== undefined) el.setAttribute('content', String(content))
}

const ensureLinkTag = (selector, create, href) => {
  if (typeof document === 'undefined') return
  const head = document.head
  if (!head) return
  const existing = head.querySelector(selector)
  const el = existing || create()
  if (!existing) head.appendChild(el)
  if (href !== undefined) el.setAttribute('href', String(href))
}

const pickPrimaryVariant = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : []
  if (!variants.length) return null
  const active = variants.find((v) => v?.isActive !== false)
  return active || variants[0]
}

const toUiProduct = (apiProduct, silverPricePerGram = 0) => {
  const v = pickPrimaryVariant(apiProduct) || {}
  const images = dedupeUrls([
    apiProduct?.image,
    ...(Array.isArray(apiProduct?.images) ? apiProduct.images : []),
    v?.image,
    ...(Array.isArray(v?.images) ? v.images : []),
  ]).filter(Boolean)
  const cover = images[0] || productFallback
  const pricing = computeProductPricing(apiProduct, silverPricePerGram)
  const gramsNum = getSilverWeightGrams(apiProduct)
  const attributes =
    apiProduct?.attributes && typeof apiProduct.attributes === 'object' && !Array.isArray(apiProduct.attributes)
      ? apiProduct.attributes
      : undefined

  return {
    id: apiProduct?._id,
    title: apiProduct?.name || 'Product',
    images: images.length ? images : [cover],
    imageUrl: cover,
    price: Number.isFinite(pricing?.price) ? pricing.price : 0,
    originalPrice: Number.isFinite(pricing?.originalPrice) ? pricing.originalPrice : undefined,
    discountPercent: Number.isFinite(pricing?.discountPercent) ? pricing.discountPercent : 0,
    silverWeightGrams: gramsNum || undefined,
    rating: undefined,
    ratingCount: undefined,
    description: apiProduct?.description || '',
    tags: Array.isArray(apiProduct?.tags) ? apiProduct.tags : ['Jewellery'],
    attributes,
    sku: v?.sku || '',
  }
}

const readCartItems = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed?.items) ? parsed.items : []
  } catch {
    return []
  }
}

const writeCartItems = (items) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify({ items: items || [], updatedAt: Date.now() }))
    window.dispatchEvent(new Event('sj_cart_updated'))
  } catch {
    return
  }
}

const readWishlistItems = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed?.items) ? parsed.items : []
  } catch {
    return []
  }
}

const writeWishlistItems = (items) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify({ items: items || [], updatedAt: Date.now() }))
    window.dispatchEvent(new Event('sj_wishlist_updated'))
  } catch {
    return
  }
}

const ProductProfile = () => {
  const { productKey } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const zoomRef = useRef(null)

  const formatter = useMemo(() => new Intl.NumberFormat('en-IN'), [])
  const apiBase = useMemo(() => getApiBase(), [])

  const toPublicUrl = useMemo(() => {
    return (p) => {
      if (!p) return ''
      if (/^https?:\/\//i.test(p)) return p
      if (String(p).startsWith('/')) {
        if (!/^\/(uploads|api)\b/i.test(String(p))) return p
        return apiBase ? `${apiBase}${p}` : p
      }
      return apiBase ? `${apiBase}/${p}` : p
    }
  }, [apiBase])

  const productId = useMemo(() => {
    const fromState = location?.state?.product?.id
    const fallback = isMongoId(fromState) ? String(fromState) : ''
    if (!productKey) return fallback
    try {
      const decoded = decodeURIComponent(productKey)
      return extractMongoId(decoded) || fallback || decoded
    } catch {
      const raw = String(productKey)
      return extractMongoId(raw) || fallback || raw
    }
  }, [location?.state?.product?.id, productKey])

  const [apiProduct, setApiProduct] = useState(null)
  const [apiError, setApiError] = useState('')
  const [apiRecommendations, setApiRecommendations] = useState([])
  const [silverPricePerGram, setSilverPricePerGram] = useState(0)
  const [reviews, setReviews] = useState([])
  const [reviewsSummary, setReviewsSummary] = useState({ avg: 0, count: 0 })
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState('')
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState('')
  const reviewsReqIdRef = useRef(0)

  const fetchReviews = useCallback(async () => {
    if (!productId) return
    const reqId = (reviewsReqIdRef.current || 0) + 1
    reviewsReqIdRef.current = reqId
    setReviewsLoading(true)
    setReviewsError('')
    try {
      const data = await getJson(`/api/products/${encodeURIComponent(productId)}/reviews`, { page: 1, limit: 10 })
      if (reviewsReqIdRef.current !== reqId) return
      setReviews(Array.isArray(data?.data) ? data.data : [])
      setReviewsSummary(
        data?.summary && typeof data.summary === 'object' ? { avg: Number(data.summary.avg || 0), count: Number(data.summary.count || 0) } : { avg: 0, count: 0 }
      )
    } catch (e) {
      if (reviewsReqIdRef.current !== reqId) return
      setReviews([])
      setReviewsSummary({ avg: 0, count: 0 })
      setReviewsError(e?.message || 'Failed to load reviews')
    } finally {
      if (reviewsReqIdRef.current === reqId) setReviewsLoading(false)
    }
  }, [productId])

  useEffect(() => {
    let active = true
    if (!productId) return () => {}

    Promise.resolve().then(() => {
      if (!active) return
      setApiError('')
    })

    getJson(`/api/products/${encodeURIComponent(productId)}`)
      .then((data) => {
        if (!active) return
        if (data?.ok && data?.data) setApiProduct(data.data)
        else setApiError('Product not found')
      })
      .catch((e) => {
        if (!active) return
        setApiError(e?.message || 'Failed to load product')
      })

    return () => {
      active = false
    }
  }, [productId])

  useEffect(() => {
    let active = true
    getSilver925RatePerGram()
      .then((rate) => {
        if (!active) return
        setSilverPricePerGram(Number.isFinite(Number(rate)) ? Number(rate) : 0)
      })
      .catch(() => {
        if (!active) return
        setSilverPricePerGram(0)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (!active) return
      setApiRecommendations([])
    })

    getJson('/api/products', { page: 1, limit: 12 })
      .then((data) => {
        if (!active) return
        const rows = Array.isArray(data?.data) ? data.data : []
        const mapped = rows
          .filter((p) => String(p?._id || '') && String(p?._id || '') !== String(productId || ''))
          .slice(0, 4)
          .map((p) => toUiProduct(p, silverPricePerGram))
        setApiRecommendations(mapped)
      })
      .catch(() => {
        if (!active) return
        setApiRecommendations([])
      })

    return () => {
      active = false
    }
  }, [productId, silverPricePerGram])

  const product = useMemo(() => {
    if (apiProduct) {
      const ui = toUiProduct(apiProduct, silverPricePerGram)
      const imgs = dedupeUrls((Array.isArray(ui?.images) ? ui.images : []).map((u) => toPublicUrl(u)).filter(Boolean))
      const cover = imgs[0] || toPublicUrl(ui?.imageUrl) || productFallback
      return { ...ui, images: imgs.length ? imgs : [cover], imageUrl: cover }
    }

    const p = location?.state?.product || {}
    const title = p.title || (productKey ? decodeURIComponent(productKey) : 'Product')
    const images = dedupeUrls((Array.isArray(p.images) ? p.images : []).map((u) => toPublicUrl(u)).filter(Boolean))
    const cover = toPublicUrl(p.imageUrl) || images[0] || productFallback
    const attributes = p?.attributes && typeof p.attributes === 'object' && !Array.isArray(p.attributes) ? p.attributes : undefined

    return {
      id: p.id,
      title,
      images: images.length ? images : [cover],
      price: Number.isFinite(p.price) ? p.price : 0,
      originalPrice: Number.isFinite(p.originalPrice) ? p.originalPrice : undefined,
      rating: Number.isFinite(p.rating) ? p.rating : undefined,
      ratingCount: Number.isFinite(p.ratingCount) ? p.ratingCount : undefined,
      description:
        p.description ||
        'A timeless piece designed to elevate everyday looks. Crafted with care and finished for lasting shine.',
      tags: Array.isArray(p.tags) ? p.tags : ['Jewellery', 'New Arrival'],
      attributes,
      sku: p.sku || '',
      imageUrl: cover,
    }
  }, [apiProduct, location?.state?.product, productKey, silverPricePerGram, toPublicUrl])

  const attributeEntries = useMemo(() => {
    const attrs = product.attributes && typeof product.attributes === 'object' && !Array.isArray(product.attributes) ? product.attributes : {}
    return Object.entries(attrs)
      .map(([k, v]) => [String(k || '').trim(), String(v ?? '').trim()])
      .filter(([k, v]) => k && v)
  }, [product.attributes])

  const descriptionHtml = useMemo(() => {
    const raw = String(product.description || '')
    if (!raw) return ''
    if (looksLikeHtml(raw)) return raw
    return plainTextToHtml(raw)
  }, [product.description])

  const breadcrumbs = useMemo(() => {
    const b = location?.state?.breadcrumbs
    if (Array.isArray(b) && b.length) return b
    return ['Home', 'Products', product.title]
  }, [location?.state?.breadcrumbs, product.title])

  const recommendations = useMemo(() => {
    const r = location?.state?.recommendations
    if (Array.isArray(r) && r.length) return r
    if (Array.isArray(apiRecommendations) && apiRecommendations.length) return apiRecommendations
    return []
  }, [apiRecommendations, location?.state?.recommendations])

  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%')
  const [zoomEnabled, setZoomEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(min-width: 768px)').matches
  })
  const [justAdded, setJustAdded] = useState(false)

  const showOriginal =
    Number.isFinite(product.originalPrice) && Number.isFinite(product.price) && product.originalPrice > product.price

  const displayRating = useMemo(() => {
    if (Number(reviewsSummary?.count || 0) > 0) return Number(reviewsSummary?.avg || 0)
    return product.rating
  }, [product.rating, reviewsSummary?.avg, reviewsSummary?.count])

  const displayRatingCount = useMemo(() => {
    if (Number(reviewsSummary?.count || 0) > 0) return Number(reviewsSummary?.count || 0)
    return product.ratingCount
  }, [product.ratingCount, reviewsSummary?.count])

  const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1
  const mainUrl = product.images[Math.min(Math.max(activeImage, 0), product.images.length - 1)]

  const slug = useMemo(() => {
    const idPart = normalizeText(product?.id || productId || '')
    const base = slugify(product?.title || product?.sku || 'product')
    const raw = base && idPart ? `${base}-${idPart}` : idPart || base || 'product'
    return encodeURIComponent(raw)
  }, [product?.id, product?.sku, product?.title, productId])

  const itemKey = useMemo(() => decodeURIComponent(slug || ''), [slug])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia('(min-width: 768px)')
    const apply = () => setZoomEnabled(Boolean(mql.matches))
    apply()
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', apply)
      return () => mql.removeEventListener('change', apply)
    }
    mql.addListener(apply)
    return () => mql.removeListener(apply)
  }, [])

  useEffect(() => {
    if (zoomEnabled) return
    setIsZoomed(false)
    setZoomOrigin('50% 50%')
  }, [zoomEnabled])

  useEffect(() => {
    setActiveImage((idx) => {
      const nextMax = Math.max(0, (product.images?.length || 1) - 1)
      return Math.min(Math.max(0, idx), nextMax)
    })
  }, [product.images])

  useEffect(() => {
    const id = normalizeText(product?.id || productId || '')
    if (!id) return
    const base = slugify(product?.title || product?.sku || '')
    if (!base) return
    const canonicalRaw = `${base}-${id}`
    let currentRaw = ''
    try {
      currentRaw = normalizeText(decodeURIComponent(productKey || ''))
    } catch {
      currentRaw = normalizeText(productKey || '')
    }
    if (!currentRaw || currentRaw === canonicalRaw) return
    navigate(`/product/${encodeURIComponent(canonicalRaw)}`, { replace: true, state: location?.state })
  }, [location?.state, navigate, product?.id, product?.sku, product?.title, productId, productKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const title = normalizeText(product?.title)
    const image = normalizeText(product?.images?.[0] || product?.imageUrl || '')
    if (!title && !image) return

    if (title) document.title = title

    const absImage = image ? new URL(image, window.location.origin).toString() : ''
    const absUrl = new URL(window.location.href, window.location.origin).toString()

    ensureMetaTag('meta[property="og:title"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('property', 'og:title')
      return m
    }, title)
    ensureMetaTag('meta[property="og:type"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('property', 'og:type')
      return m
    }, 'product')
    ensureMetaTag('meta[property="og:image"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('property', 'og:image')
      return m
    }, absImage || undefined)
    ensureMetaTag('meta[property="og:url"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('property', 'og:url')
      return m
    }, absUrl)

    ensureMetaTag('meta[name="twitter:card"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'twitter:card')
      return m
    }, 'summary_large_image')
    ensureMetaTag('meta[name="twitter:title"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'twitter:title')
      return m
    }, title)
    ensureMetaTag('meta[name="twitter:image"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'twitter:image')
      return m
    }, absImage || undefined)

    ensureLinkTag('link[rel="canonical"]', () => {
      const l = document.createElement('link')
      l.setAttribute('rel', 'canonical')
      return l
    }, absUrl)
  }, [product?.imageUrl, product?.images, product?.title])

  const [wishlisted, setWishlisted] = useState(() => {
    const items = readWishlistItems()
    return items.some((it) => String(it?.key || '') === String(itemKey))
  })

  useEffect(() => {
    const sync = () => {
      const items = readWishlistItems()
      setWishlisted(items.some((it) => String(it?.key || '') === String(itemKey)))
    }
    const onStorage = (e) => {
      if (e?.key && e.key !== WISHLIST_KEY) return
      sync()
    }
    const onCustom = () => sync()
    window.addEventListener('storage', onStorage)
    window.addEventListener('sj_wishlist_updated', onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('sj_wishlist_updated', onCustom)
    }
  }, [itemKey])

  const addToCart = (goToCart = false) => {
    const key = decodeURIComponent(slug || '')
    const cover = product.images?.[0] || ''

    const nextItem = {
      key,
      id: product.id || location?.state?.product?.id,
      sku: product.sku,
      title: product.title,
      price: Number.isFinite(product.price) ? product.price : 0,
      originalPrice: Number.isFinite(product.originalPrice) ? product.originalPrice : undefined,
      images: Array.isArray(product.images) ? product.images.filter(Boolean) : cover ? [cover] : [],
      imageUrl: cover,
      qty: safeQty,
    }

    const items = readCartItems()
    const idx = items.findIndex((it) => String(it?.key || '') === String(key))
    if (idx >= 0) {
      const current = items[idx]
      const qtyNext = Math.max(1, (Number.parseInt(current?.qty, 10) || 1) + safeQty)
      const updated = { ...current, ...nextItem, qty: qtyNext }
      const next = items.slice()
      next[idx] = updated
      writeCartItems(next)
    } else {
      writeCartItems([...(items || []), nextItem])
    }

    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1200)
    if (goToCart) navigate('/cart')
  }

  const toggleWishlist = () => {
    const cover = product.images?.[0] || ''
    const nextItem = {
      key: itemKey,
      id: product.id || location?.state?.product?.id,
      sku: product.sku,
      title: product.title,
      price: Number.isFinite(product.price) ? product.price : 0,
      originalPrice: Number.isFinite(product.originalPrice) ? product.originalPrice : undefined,
      images: Array.isArray(product.images) ? product.images.filter(Boolean) : cover ? [cover] : [],
      imageUrl: cover,
    }

    const items = readWishlistItems()
    const idx = items.findIndex((it) => String(it?.key || '') === String(itemKey))
    const next = idx >= 0 ? items.filter((it) => String(it?.key || '') !== String(itemKey)) : [...items, nextItem]
    writeWishlistItems(next)
    setWishlisted(idx < 0)
  }

  return (
    <div className="bg-white">
      <div className="mx-auto px-5 md:px-10 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-gray-500">
          {breadcrumbs.map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1
            if (idx === 0) {
              return (
                <span key={`${b}-${idx}`} className="flex items-center gap-2">
                  <Link to="/" className="text-gray-700 hover:text-[#0f2e40]">
                    {String(b).toUpperCase()}
                  </Link>
                  {!isLast ? <span className="text-gray-300">/</span> : null}
                </span>
              )
            }

            return (
              <span key={`${b}-${idx}`} className="flex items-center gap-2">
                <span className={`${isLast ? 'text-gray-700' : 'text-gray-500'}`}>{String(b).toUpperCase()}</span>
                {!isLast ? <span className="text-gray-300">/</span> : null}
              </span>
            )
          })}
        </div>
        {apiError ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {apiError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <div
              ref={zoomRef}
              className={`overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-gray-200 ${
                zoomEnabled ? (isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in') : 'cursor-default'
              }`}
              onMouseEnter={
                zoomEnabled
                  ? () => {
                      setIsZoomed(true)
                    }
                  : undefined
              }
              onMouseLeave={
                zoomEnabled
                  ? () => {
                      setIsZoomed(false)
                      setZoomOrigin('50% 50%')
                    }
                  : undefined
              }
              onMouseMove={
                zoomEnabled
                  ? (e) => {
                      if (!zoomRef.current) return
                      const rect = zoomRef.current.getBoundingClientRect()
                      const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
                      const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
                      setZoomOrigin(`${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`)
                    }
                  : undefined
              }
              onClick={zoomEnabled ? () => setIsZoomed((z) => !z) : undefined}
              role={zoomEnabled ? 'button' : undefined}
              tabIndex={zoomEnabled ? 0 : undefined}
              onKeyDown={
                zoomEnabled
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setIsZoomed((z) => !z)
                      }
                    }
                  : undefined
              }
            >
              <img
                src={mainUrl}
                alt={product.title}
                className="h-[420px] w-full object-contain md:h-[520px]"
                style={{
                  transform: zoomEnabled && isZoomed ? 'scale(2)' : 'scale(1)',
                  transformOrigin: zoomOrigin,
                  transition: zoomEnabled && isZoomed ? 'transform 40ms linear' : 'transform 180ms ease',
                  willChange: zoomEnabled ? 'transform' : undefined,
                }}
              />
            </div>

            {product.images.length > 1 ? (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {product.images.slice(0, 10).map((u, idx) => {
                  const isActive = idx === activeImage
                  return (
                    <button
                      key={`${u}-${idx}`}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      className={`overflow-hidden rounded-xl bg-white ring-1 transition-colors ${
                        isActive ? 'ring-[#0f2e40]' : 'ring-gray-200 hover:ring-gray-300'
                      }`}
                    >
                      <img src={u} alt="" className="h-16 w-full object-contain" />
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div>
              <div className="text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl">{product.title}</div>

              {Number.isFinite(displayRating) && Number(displayRatingCount || 0) > 0 ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-800">
                    {Number(displayRating).toFixed(1)}
                    <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
                  </span>
                  <span className="text-gray-400">|</span>
                  <span>{formatter.format(Number(displayRatingCount))} reviews</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="text-xl font-bold text-gray-900 sm:text-2xl">₹{formatter.format(product.price)}</div>
              {showOriginal ? (
                <div className="pb-0.5 text-base font-semibold text-gray-500 line-through sm:text-lg">
                  ₹{formatter.format(product.originalPrice)}
                </div>
              ) : null}
            </div>

            <div
              className="text-sm leading-relaxed text-gray-600 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:text-[#0f2e40] [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />

            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">QTY</div>
              <div className="inline-flex items-center overflow-hidden rounded-xl ring-1 ring-gray-200">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, (Number.isFinite(q) ? q : 1) - 1))}
                  className="grid h-10 w-12 place-items-center bg-white text-gray-800 hover:bg-gray-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="grid h-10 w-14 place-items-center bg-white text-sm font-semibold text-gray-900">
                  {safeQty}
                </div>
                <button
                  type="button"
                  onClick={() => setQty((q) => (Number.isFinite(q) ? q + 1 : 2))}
                  className="grid h-10 w-12 place-items-center bg-white text-gray-800 hover:bg-gray-50"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => addToCart(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f2e40] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#13384d]"
              >
                {justAdded ? 'Added' : 'Add to Cart'}
              </button>

              <button
                type="button"
                onClick={() => addToCart(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0f2e40] ring-1 ring-[#0f2e40]/40 hover:bg-[#0f2e40]/5"
              >
                Buy Now
              </button>

              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-xl bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
                aria-label="Wishlist"
                onClick={toggleWishlist}
              >
                <Heart className={`h-5 w-5 ${wishlisted ? 'text-pink-500' : 'text-gray-800'}`} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
              >
                Back
              </button>
            </div>

            {attributeEntries.length ? (
              <div className="rounded-2xl bg-gray-50 px-4 py-4 ring-1 ring-gray-200">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700">
                  <span className="text-gray-500">Details:</span>
                  {attributeEntries.map(([k, v]) => (
                    <span key={k} className="rounded-full bg-white px-3 py-1 ring-1 ring-gray-200">
                      {k}: {v}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'description' ? 'border-b-2 border-[#0f2e40] text-[#0f2e40]' : 'text-gray-600'
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'details' ? 'border-b-2 border-[#0f2e40] text-[#0f2e40]' : 'text-gray-600'
              }`}
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tags')}
              className={`px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'tags' ? 'border-b-2 border-[#0f2e40] text-[#0f2e40]' : 'text-gray-600'
              }`}
            >
              Product Tags
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'reviews' ? 'border-b-2 border-[#0f2e40] text-[#0f2e40]' : 'text-gray-600'
              }`}
            >
              Review
            </button>
          </div>

          <div className="rounded-b-2xl bg-white px-1 py-6">
            {activeTab === 'description' ? (
              <div
                className="max-w-4xl text-sm leading-relaxed text-gray-700 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:text-[#0f2e40] [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : null}
            {activeTab === 'details' ? (
              <div className="max-w-4xl">
                {attributeEntries.length ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {attributeEntries.map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-200">
                        <div className="text-xs font-semibold text-gray-500">{k}</div>
                        <div className="mt-1 text-sm font-semibold text-gray-900">{v}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No details available.</div>
                )}
              </div>
            ) : null}
            {activeTab === 'tags' ? (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((t, idx) => (
                  <span
                    key={`${t}-${idx}`}
                    className="rounded-full bg-[#0f2e40]/5 px-4 py-2 text-sm font-semibold text-[#0f2e40] ring-1 ring-[#0f2e40]/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            {activeTab === 'reviews' ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-gray-900">Customer Reviews</div>
                  {Number(reviewsSummary?.count || 0) > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-800">
                        {Number(reviewsSummary.avg || 0).toFixed(1)}
                        <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
                      </span>
                      <span className="text-gray-400">|</span>
                      <span>{formatter.format(Number(reviewsSummary.count || 0))} reviews</span>
                    </div>
                  ) : null}
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!productId || reviewSubmitting) return
                    setReviewSubmitting(true)
                    setReviewSuccess('')
                    setReviewsError('')
                    try {
                      await postJson(`/api/products/${encodeURIComponent(productId)}/reviews`, {
                        name: reviewName,
                        rating: reviewRating,
                        comment: reviewComment,
                      })
                      setReviewComment('')
                      setReviewSuccess('Review submitted.')
                      await fetchReviews()
                    } catch (err) {
                      setReviewsError(err?.message || 'Failed to submit review')
                    } finally {
                      setReviewSubmitting(false)
                    }
                  }}
                  className="rounded-2xl bg-gray-50 px-4 py-4 ring-1 ring-gray-200"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <div className="text-xs font-semibold text-gray-700">Your name</div>
                      <input
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        type="text"
                        className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f2e40]/40"
                        placeholder="Anonymous"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <div className="text-xs font-semibold text-gray-700">Rating</div>
                      <div className="mt-2 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => {
                          const active = Number(reviewRating) >= n
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setReviewRating(n)}
                              className="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-gray-200 hover:bg-gray-50"
                              aria-label={`Rate ${n}`}
                            >
                              <Star className={`h-5 w-5 ${active ? 'text-amber-500' : 'text-gray-300'}`} fill={active ? 'currentColor' : 'none'} />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="text-xs font-semibold text-gray-700">Your review</div>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        className="mt-2 w-full resize-none rounded-xl bg-white px-4 py-3 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f2e40]/40"
                        placeholder="Write your review here..."
                      />
                    </div>
                  </div>

                  {reviewSuccess ? <div className="mt-3 text-sm font-semibold text-emerald-700">{reviewSuccess}</div> : null}
                  {reviewsError ? <div className="mt-3 text-sm font-semibold text-red-600">{reviewsError}</div> : null}

                  <div className="mt-4 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={reviewSubmitting || !String(reviewComment || '').trim()}
                      className="inline-flex items-center justify-center rounded-xl bg-[#0f2e40] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#13384d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit review'}
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {reviewsLoading ? <div className="text-sm text-gray-600">Loading reviews...</div> : null}
                  {!reviewsLoading && !reviews.length ? (
                    <div className="rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-600 ring-1 ring-gray-200">No reviews yet.</div>
                  ) : null}
                  {reviews.map((r) => {
                    const created = r?.createdAt ? new Date(r.createdAt) : null
                    const dateLabel = created && !Number.isNaN(created.getTime()) ? created.toLocaleDateString() : ''
                    const rating = Number(r?.rating || 0)
                    return (
                      <div key={r?._id || `${r?.name}-${r?.createdAt}`} className="rounded-2xl bg-white px-4 py-4 ring-1 ring-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-gray-900">{r?.name || 'Anonymous'}</div>
                          {dateLabel ? <div className="text-xs font-semibold text-gray-500">{dateLabel}</div> : null}
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={`h-4 w-4 ${rating >= n ? 'text-amber-500' : 'text-gray-200'}`} fill={rating >= n ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                        {r?.comment ? <div className="mt-2 text-sm leading-relaxed text-gray-700">{r.comment}</div> : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-base font-semibold text-gray-900 sm:text-lg">You may also like</div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f2e40]">
              View all
              <span className="text-[#0f2e40]">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {recommendations.map((p, idx) => (
              <div key={p.id || p.sku || p.title || idx} className="w-full">
                <ProductCard {...p} className="max-w-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductProfile

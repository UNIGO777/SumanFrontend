import { Heart, Minus, Plus, Star } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'

const CART_KEY = 'sj_cart_v1'
const WISHLIST_KEY = 'sj_wishlist_v1'

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

  const product = useMemo(() => {
    const p = location?.state?.product || {}
    const title = p.title || (productKey ? decodeURIComponent(productKey) : 'Product')
    const images = Array.isArray(p.images) ? p.images.filter(Boolean) : []
    const cover = p.imageUrl || images[0] || 'https://via.placeholder.com/900x900?text=Product'

    return {
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
      sku: p.sku || '',
    }
  }, [location?.state?.product, productKey])

  const breadcrumbs = useMemo(() => {
    const b = location?.state?.breadcrumbs
    if (Array.isArray(b) && b.length) return b
    return ['Home', 'Products', product.title]
  }, [location?.state?.breadcrumbs, product.title])

  const recommendations = useMemo(() => {
    const r = location?.state?.recommendations
    if (Array.isArray(r) && r.length) return r

    const baseImages = product.images.length ? product.images : ['https://via.placeholder.com/900x900?text=Product']
    const pick = (i) => baseImages[i % baseImages.length]

    return [
      {
        id: 'rec-1',
        images: [pick(0), pick(1)],
        title: 'Silver Stud Earrings',
        price: 1999,
        originalPrice: 2999,
        rating: 4.6,
        ratingCount: 118,
        couponText: 'EXTRA 5% OFF with coupon',
      },
      {
        id: 'rec-2',
        images: [pick(1), pick(0)],
        title: 'Minimal Pendant',
        price: 2199,
        originalPrice: 3999,
        rating: 4.7,
        ratingCount: 84,
        couponText: 'EXTRA 5% OFF with coupon',
      },
      {
        id: 'rec-3',
        images: [pick(0), pick(1)],
        title: 'Everyday Ring',
        price: 1599,
        originalPrice: 2999,
        rating: 4.8,
        ratingCount: 326,
        couponText: 'EXTRA 5% OFF with coupon',
      },
      {
        id: 'rec-4',
        images: [pick(1), pick(0)],
        title: 'Classic Bracelet',
        price: 3799,
        originalPrice: 8399,
        rating: 4.5,
        ratingCount: 206,
        couponText: 'EXTRA 5% OFF with coupon',
      },
    ]
  }, [location?.state?.recommendations, product.images])

  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%')
  const [justAdded, setJustAdded] = useState(false)

  const showOriginal =
    Number.isFinite(product.originalPrice) && Number.isFinite(product.price) && product.originalPrice > product.price

  const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1
  const mainUrl = product.images[Math.min(Math.max(activeImage, 0), product.images.length - 1)]

  const slug = useMemo(() => {
    const raw = String(productKey || product?.sku || product?.title || 'product')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    return encodeURIComponent(raw || 'product')
  }, [productKey, product?.sku, product?.title])

  const itemKey = useMemo(() => decodeURIComponent(slug || ''), [slug])

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
      id: location?.state?.product?.id,
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
      id: location?.state?.product?.id,
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
      <div className="mx-auto  px-10 py-6">
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

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <div
              ref={zoomRef}
              className={`overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-gray-200 ${
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => {
                setIsZoomed(false)
                setZoomOrigin('50% 50%')
              }}
              onMouseMove={(e) => {
                if (!zoomRef.current) return
                const rect = zoomRef.current.getBoundingClientRect()
                const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
                const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
                setZoomOrigin(`${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`)
              }}
              onClick={() => setIsZoomed((z) => !z)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setIsZoomed((z) => !z)
                }
              }}
            >
              <img
                src={mainUrl}
                alt={product.title}
                className="h-[420px] w-full object-contain md:h-[520px]"
                style={{
                  transform: isZoomed ? 'scale(2)' : 'scale(1)',
                  transformOrigin: zoomOrigin,
                  transition: isZoomed ? 'transform 40ms linear' : 'transform 180ms ease',
                  willChange: 'transform',
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
              <div className="text-3xl font-semibold text-gray-900">{product.title}</div>

              {Number.isFinite(product.rating) && Number.isFinite(product.ratingCount) ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-800">
                    {product.rating}
                    <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
                  </span>
                  <span className="text-gray-400">|</span>
                  <span>{formatter.format(product.ratingCount)} reviews</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="text-2xl font-bold text-gray-900">₹{formatter.format(product.price)}</div>
              {showOriginal ? (
                <div className="pb-0.5 text-lg font-semibold text-gray-500 line-through">
                  ₹{formatter.format(product.originalPrice)}
                </div>
              ) : null}
            </div>

            <div className="text-sm leading-relaxed text-gray-600">{product.description}</div>

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

            <div className="rounded-2xl bg-gray-50 px-4 py-4 ring-1 ring-gray-200">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700">
                <span className="text-gray-500">Tags:</span>
                {product.tags.map((t, idx) => (
                  <span key={`${t}-${idx}`} className="rounded-full bg-white px-3 py-1 ring-1 ring-gray-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>
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
              <div className="max-w-4xl text-sm leading-relaxed text-gray-700">{product.description}</div>
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
              <div className="space-y-3 text-sm text-gray-700">
                <div className="font-semibold text-gray-900">Customer Reviews</div>
                <div className="rounded-2xl bg-gray-50 px-4 py-4 ring-1 ring-gray-200">
                  <div className="text-gray-600">No reviews yet.</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">You may also like</div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f2e40]">
              View all
              <span className="text-[#0f2e40]">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

import { Heart, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiBase } from '../../AdminPanel/services/apiClient.js'
import productFallback from '../../assets/876 × 1628-1.png'

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

export default function ProductCard({
  id,
  sku,
  images,
  imageUrl,
  title,
  price,
  originalPrice,
  rating,
  ratingCount,
  couponText,
  ctaText = 'Add to Cart',
  showBestseller = false,
  bestsellerText = 'Bestseller',
  showWishlist = true,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  className = '',
}) {
  const formatter = useMemo(() => new Intl.NumberFormat('en-IN'), [])
  const navigate = useNavigate()
  const [justAdded, setJustAdded] = useState(false)
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

  const showOriginal = Number.isFinite(originalPrice) && Number.isFinite(price) && originalPrice > price
  const showRating = Number.isFinite(rating) && Number.isFinite(ratingCount)

  const resolvedImages = useMemo(
    () => (Array.isArray(images) ? images : []).map((u) => toPublicUrl(u)).filter(Boolean),
    [images, toPublicUrl]
  )

  const coverUrl = resolvedImages[0] || toPublicUrl(imageUrl) || productFallback
  const hoverUrl = resolvedImages[2] || resolvedImages[0]

  const slug = useMemo(() => {
    const raw = String(id || sku || title || 'product')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    return encodeURIComponent(raw || 'product')
  }, [id, sku, title])

  const itemKey = useMemo(() => decodeURIComponent(slug || ''), [slug])

  const [localWishlisted, setLocalWishlisted] = useState(() => {
    const items = readWishlistItems()
    return items.some((it) => String(it?.key || '') === String(itemKey))
  })

  useEffect(() => {
    const sync = () => {
      const items = readWishlistItems()
      setLocalWishlisted(items.some((it) => String(it?.key || '') === String(itemKey)))
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

  const effectiveWishlisted = onToggleWishlist ? isWishlisted : localWishlisted

  const goToProfile = () => {
    navigate(`/product/${slug}`, {
      state: {
        product: {
          id,
          sku,
          images: resolvedImages.length ? resolvedImages : [coverUrl],
          imageUrl: coverUrl,
          title,
          price,
          originalPrice,
          rating,
          ratingCount,
          couponText,
        },
        breadcrumbs: ['Home', 'Products', title || 'Product'],
      },
    })
  }

  const defaultToggleWishlist = () => {
    const titleSafe = title || 'Product'
    const cover = images?.[0] || imageUrl || ''

    const nextItem = {
      key: itemKey,
      id,
      sku,
      title: titleSafe,
      price: Number.isFinite(price) ? price : 0,
      originalPrice: Number.isFinite(originalPrice) ? originalPrice : undefined,
      images: Array.isArray(images) ? images.filter(Boolean) : cover ? [cover] : [],
      imageUrl: cover,
    }

    const items = readWishlistItems()
    const idx = items.findIndex((it) => String(it?.key || '') === String(itemKey))
    const next = idx >= 0 ? items.filter((it) => String(it?.key || '') !== String(itemKey)) : [...items, nextItem]
    writeWishlistItems(next)
    setLocalWishlisted(idx < 0)
  }

  const defaultAddToCart = () => {
    const key = decodeURIComponent(slug || '')
    const titleSafe = title || 'Product'
    const cover = images?.[0] || imageUrl || ''

    const nextItem = {
      key,
      id,
      sku,
      title: titleSafe,
      price: Number.isFinite(price) ? price : 0,
      originalPrice: Number.isFinite(originalPrice) ? originalPrice : undefined,
      images: Array.isArray(images) ? images.filter(Boolean) : cover ? [cover] : [],
      imageUrl: cover,
      qty: 1,
    }

    const items = readCartItems()
    const idx = items.findIndex((it) => String(it?.key || '') === String(key))
    if (idx >= 0) {
      const current = items[idx]
      const qty = Math.max(1, (Number.parseInt(current?.qty, 10) || 1) + 1)
      const updated = { ...current, ...nextItem, qty }
      const next = items.slice()
      next[idx] = updated
      writeCartItems(next)
    } else {
      writeCartItems([...(items || []), nextItem])
    }

    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <div
      className={`w-full max-w-[460px] ${className} cursor-pointer`}
      onClick={goToProfile}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          goToProfile()
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="overflow-hidden   bg-white">
        <div className="relative bg-white">
          <div
            className="group relative flex h-[380px] w-full items-center justify-center overflow-hidden bg-white"
          >
            <img
              src={coverUrl}
              alt={title || 'Product image'}
              className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.1] ${
                hoverUrl ? 'opacity-100 group-hover:opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
            />
            {hoverUrl ? (
              <img
                src={hoverUrl}
                alt={title || 'Product image'}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-300 group-hover:scale-[1.1] group-hover:opacity-100"
                loading="lazy"
              />
            ) : null}
          </div>

          {showBestseller ? (
            <div
              className="absolute left-0 top-4 px-5 py-2 text-sm font-semibold tracking-wide text-white"
              style={{
                backgroundColor: '#0f2e40',
                clipPath: 'polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)',
              }}
            >
              {bestsellerText}
            </div>
          ) : null}

          {showWishlist ? (
            <button
              type="button"
              aria-label="Wishlist"
              onClick={(e) => {
                e.stopPropagation()
                if (onToggleWishlist) onToggleWishlist(e)
                else defaultToggleWishlist()
              }}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-sm ring-1 ring-gray-200"
            >
              <Heart
                className={`h-5 w-5 ${effectiveWishlisted ? 'text-pink-500' : 'text-black'}`}
                strokeWidth={2}
                fill={effectiveWishlisted ? 'currentColor' : 'none'}
              />
            </button>
          ) : null}

          {showRating ? (
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-gray-100/95 px-3 py-2 text-sm font-semibold text-gray-800">
              <span className="flex items-center gap-1">
                {rating}
                <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{formatter.format(ratingCount)}</span>
            </div>
          ) : null}
        </div>

        <div className="space-y-3 px-4 pb-4 pt-4 text-left">
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-gray-900">₹{formatter.format(price || 0)}</div>
            {showOriginal ? (
              <div className="pb-1 text-lg font-semibold text-gray-500 line-through">
                ₹{formatter.format(originalPrice)}
              </div>
            ) : null}
          </div>

          <div className="text-lg font-medium leading-tight text-gray-500">{title}</div>

          {couponText ? (
            <div className="text-sm font-semibold text-[#0f2e40] underline">{couponText}</div>
          ) : null}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (onAddToCart) onAddToCart(e)
              else defaultAddToCart()
            }}
            className="w-full rounded-xl bg-gradient-to-r hover:scale-[1.1] from-[#0f2e40] to-[#1e4a5f] py-2 text-center text-md font-medium text-white transition-all duration-300 hover:from-[#1e4a5f] hover:to-[#0f2e40] hover:shadow-lg cursor-pointer"
          >
            {justAdded ? 'Added' : ctaText}
          </button>
        </div>
      </div>
    </div>
  )
}

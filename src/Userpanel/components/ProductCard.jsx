import { Heart, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiBase } from '../../AdminPanel/services/apiClient.js'

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
  name,
  price,
  originalPrice,
  discountPercent,
  silverWeightGrams,
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
  cardHeightClassName,
  imageHeightClassName,
  className = '',
}) {
  const formatter = useMemo(() => new Intl.NumberFormat('en-IN'), [])
  const navigate = useNavigate()
  const [justAdded, setJustAdded] = useState(false)
  const apiBase = useMemo(() => getApiBase(), [])

  const displayTitle = useMemo(() => String(title || name || '').trim(), [name, title])
  const slugify = useMemo(
    () => (v) =>
      String(v || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    []
  )

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
  const effectiveDiscount = useMemo(() => {
    const n = Number(discountPercent)
    if (Number.isFinite(n) && n > 0) return Math.min(100, Math.max(0, n))
    if (showOriginal && Number(originalPrice) > 0) {
      const pct = ((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100
      return Number.isFinite(pct) && pct > 0 ? Math.round(pct) : 0
    }
    return 0
  }, [discountPercent, price, originalPrice, showOriginal])

  const resolvedImages = useMemo(
    () => (Array.isArray(images) ? images : []).map((u) => toPublicUrl(u)).filter(Boolean),
    [images, toPublicUrl]
  )

  const coverUrl = resolvedImages[0] || toPublicUrl(imageUrl) || ''
  const hoverUrl = resolvedImages[2] || resolvedImages[0] || ''
  const [loadedCoverUrl, setLoadedCoverUrl] = useState('')
  const displayGrams = useMemo(() => {
    const n = Number(silverWeightGrams)
    return Number.isFinite(n) && n > 0 ? n : 0
  }, [silverWeightGrams])
  const coverLoaded = Boolean(coverUrl) && loadedCoverUrl === coverUrl

  const slug = useMemo(() => {
    const idPart = String(id || sku || '').trim()
    const base = slugify(displayTitle || 'product')
    const raw = base && idPart ? `${base}-${idPart}` : idPart || base || 'product'
    return encodeURIComponent(raw)
  }, [displayTitle, id, sku, slugify])

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
          title: displayTitle,
          price,
          originalPrice,
          silverWeightGrams: displayGrams || undefined,
          rating,
          ratingCount,
          couponText,
        },
        breadcrumbs: ['Home', 'Products', displayTitle || 'Product'],
      },
    })
  }

  const defaultToggleWishlist = () => {
    const titleSafe = displayTitle || 'Product'
    const cover = resolvedImages?.[0] || coverUrl || ''

    const nextItem = {
      key: itemKey,
      id,
      sku,
      title: titleSafe,
      price: Number.isFinite(price) ? price : 0,
      originalPrice: Number.isFinite(originalPrice) ? originalPrice : undefined,
      silverWeightGrams: displayGrams || undefined,
      images: Array.isArray(resolvedImages) && resolvedImages.length ? resolvedImages : cover ? [cover] : [],
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
    const titleSafe = displayTitle || 'Product'
    const cover = resolvedImages?.[0] || coverUrl || ''

    const nextItem = {
      key,
      id,
      sku,
      title: titleSafe,
      price: Number.isFinite(price) ? price : 0,
      originalPrice: Number.isFinite(originalPrice) ? originalPrice : undefined,
      silverWeightGrams: displayGrams || undefined,
      images: Array.isArray(resolvedImages) && resolvedImages.length ? resolvedImages : cover ? [cover] : [],
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
      className={`w-full ${cardHeightClassName || ''} ${className} cursor-pointer overflow-hidden  border border-gray-200 bg-white sm:rounded-2xl`}
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
      <div className="bg-white">
        <div className="relative bg-white">
          <div
            className={`group relative flex w-full  items-center justify-center overflow-hidden bg-white ${imageHeightClassName || 'h-[120px] sm:h-[240px] md:h-[320px]'}`}
          >
            {!coverLoaded ? <div className="absolute inset-0 bg-gray-200 animate-pulse" /> : null}
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={displayTitle || 'Product image'}
                className={`h-full w-full object-cover transition-all duration-300 md:group-hover:scale-[1.1] ${
                  hoverUrl ? 'opacity-100 group-hover:opacity-0' : 'opacity-100'
                }`}
                loading="lazy"
                onLoad={() => setLoadedCoverUrl(coverUrl)}
                onError={() => setLoadedCoverUrl(coverUrl)}
              />
            ) : null}
            {hoverUrl ? (
              <img
                src={hoverUrl}
                alt={displayTitle || 'Product image'}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-300 md:group-hover:scale-[1.1] group-hover:opacity-100"
                loading="lazy"
              />
            ) : null}
          </div>

          {showBestseller ? (
            <div
              className="absolute left-0 top-2 px-3 py-1 text-[11px] font-semibold tracking-wide text-white sm:top-4 sm:px-5 sm:py-2 sm:text-sm"
              style={{
                backgroundColor: '#0f2e40',
                clipPath: 'polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)',
              }}
            >
              {bestsellerText}
            </div>
          ) : null}

          {!showBestseller && effectiveDiscount ? (
            <div className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
              {effectiveDiscount}% OFF
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
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/95 shadow-sm ring-1 ring-gray-200 sm:right-4 sm:top-4 sm:h-10 sm:w-10"
            >
              <Heart
                className={`h-4 w-4 sm:h-5 sm:w-5 ${effectiveWishlisted ? 'text-pink-500' : 'text-black'}`}
                strokeWidth={2}
                fill={effectiveWishlisted ? 'currentColor' : 'none'}
              />
            </button>
          ) : null}

          {showRating ? (
            <div className="absolute bottom-3 left-3 hidden items-center gap-2 rounded-lg bg-gray-100/95 px-3 py-2 text-sm font-semibold text-gray-800 sm:flex">
              <span className="flex items-center gap-1">
                {rating}
                <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{formatter.format(ratingCount)}</span>
            </div>
          ) : null}
        </div>

        <div className="space-y-1.5 px-3 pb-3 pt-3 text-left sm:space-y-3 sm:px-4 sm:pb-4 sm:pt-4">
          <div className="flex flex-wrap items-end gap-x-2 gap-y-1 sm:gap-3">
            <div className="text-base font-bold text-gray-900 sm:text-xl lg:text-2xl">₹{formatter.format(price || 0)}</div>
            {showOriginal ? (
              <div className="pb-0.5 text-[11px] font-semibold text-gray-500 line-through sm:pb-1 sm:text-base">
                ₹{formatter.format(originalPrice)}
              </div>
            ) : null}
          </div>

          {displayTitle ? <div className="text-xs font-medium leading-snug text-gray-600 sm:text-base">{displayTitle}</div> : null}
          {displayGrams ? (
            <div className="text-[11px] font-semibold text-gray-500 sm:text-sm">{displayGrams} g</div>
          ) : null}

          {couponText ? (
            <div className="text-[11px] font-semibold text-[#0f2e40] underline sm:text-sm">{couponText}</div>
          ) : null}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (onAddToCart) onAddToCart(e)
              else defaultAddToCart()
            }}
            className="w-full rounded-sm bg-gradient-to-r from-[#0f2e40] to-[#1e4a5f] py-1.5 text-center text-xs font-semibold text-white transition-all duration-300 hover:from-[#1e4a5f] hover:to-[#0f2e40] hover:shadow-lg sm:rounded-xl sm:py-2 sm:text-sm md:text-base md:hover:scale-[1.03]"
          >
            {justAdded ? 'Added' : ctaText}
          </button>
        </div>
      </div>
    </div>
  )
}

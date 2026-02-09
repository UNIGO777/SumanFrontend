import { Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiBase } from '../../AdminPanel/services/apiClient.js'
import productFallback from '../../assets/876 × 1628-1.png'
import { computeProductPricing, getSilver925RatePerGram, getSilverWeightGrams } from '../UserServices/pricingService.js'

const WISHLIST_KEY = 'sj_wishlist_v1'

const normalizeId = (id) => (id === undefined || id === null ? '' : String(id)).trim()
const isMongoId = (id) => /^[a-f\d]{24}$/i.test(normalizeId(id))

const readWishlist = () => {
  if (typeof window === 'undefined') return { items: [] }
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY)
    if (!raw) return { items: [] }
    const parsed = JSON.parse(raw)
    const items = Array.isArray(parsed?.items) ? parsed.items : []
    return { items }
  } catch {
    return { items: [] }
  }
}

const writeWishlist = (items) => {
  if (typeof window === 'undefined') return
  try {
    const clean = (Array.isArray(items) ? items : [])
      .filter((it) => it && typeof it === 'object')
      .map((it) => ({
        key: String(it.key || '').trim(),
        id: it.id,
        sku: it.sku,
        title: it.title || '',
        price: Number.isFinite(it.price) ? it.price : 0,
        originalPrice: Number.isFinite(it.originalPrice) ? it.originalPrice : undefined,
        silverWeightGrams: Number.isFinite(Number(it.silverWeightGrams)) ? Number(it.silverWeightGrams) : undefined,
        images: Array.isArray(it.images) ? it.images.filter(Boolean) : [],
        imageUrl: it.imageUrl || '',
      }))
      .filter((it) => it.key && it.title)

    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify({ items: clean, updatedAt: Date.now() }))
    window.dispatchEvent(new Event('sj_wishlist_updated'))
  } catch {
    return
  }
}

export default function Wishlist() {
  const formatter = useMemo(() => new Intl.NumberFormat('en-IN'), [])
  const navigate = useNavigate()
  const apiBase = useMemo(() => getApiBase(), [])
  const [items, setItems] = useState(() => readWishlist().items)
  const [status, setStatus] = useState('')

  const toPublicUrl = useMemo(() => {
    return (p) => {
      if (!p) return ''
      if (/^https?:\/\//i.test(p)) return p
      if (!apiBase) return p
      if (String(p).startsWith('/')) return `${apiBase}${p}`
      return `${apiBase}/${p}`
    }
  }, [apiBase])

  const sync = useCallback(() => {
    setItems(readWishlist().items)
  }, [])

  useEffect(() => {
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
  }, [sync])

  useEffect(() => {
    let active = true
    const run = async () => {
      const withId = items.filter((it) => isMongoId(it?.id))
      if (!apiBase || withId.length === 0) return

      try {
        const [rate, productsRes] = await Promise.all([
          getSilver925RatePerGram({ maxAgeMs: 0 }),
          fetch(`${apiBase}/api/products?page=1&limit=500`),
        ])
        const data = await productsRes.json().catch(() => null)
        const rows = Array.isArray(data?.data) ? data.data : []
        const byId = new Map(rows.map((p) => [String(p?._id || ''), p]).filter(([id]) => id))

        let removed = false
        let updatedPrices = false

        const next = items
          .filter((it) => {
            if (!isMongoId(it?.id)) return true
            const ok = byId.has(normalizeId(it.id))
            if (!ok) removed = true
            return ok
          })
          .map((it) => {
            if (!isMongoId(it?.id)) return it
            const p = byId.get(normalizeId(it.id))
            const pricing = computeProductPricing(p, rate)
            const priceNum = Number.isFinite(pricing?.price) ? pricing.price : 0
            const originalNum = Number.isFinite(pricing?.originalPrice) ? pricing.originalPrice : undefined
            const gramsNum = getSilverWeightGrams(p)
            if (Math.abs((Number(it.price) || 0) - priceNum) > 0.0001) updatedPrices = true
            if (Math.abs((Number(it.originalPrice) || 0) - (Number(originalNum) || 0)) > 0.0001) updatedPrices = true
            if (Math.abs((Number(it.silverWeightGrams) || 0) - (Number(gramsNum) || 0)) > 0.0001) updatedPrices = true
            return { ...it, price: priceNum, originalPrice: originalNum, silverWeightGrams: gramsNum || undefined }
          })

        if (!active) return
        if (removed || updatedPrices) {
          writeWishlist(next)
          setItems(next)
          if (removed && updatedPrices) setStatus('Wishlist updated with latest prices, and unavailable items were removed.')
          else if (removed) setStatus('Some items were removed because they are no longer available.')
          else setStatus('Wishlist prices updated with latest 92.5 silver rate.')
        }
      } catch {
        return
      }
    }

    run()
    return () => {
      active = false
    }
  }, [apiBase, items])

  const removeItem = (key) => {
    const next = items.filter((it) => it.key !== key)
    setItems(next)
    writeWishlist(next)
  }

  const clearWishlist = () => {
    setItems([])
    writeWishlist([])
  }

  return (
    <div className="bg-white flex flex-col">
      <div className="flex-1">
        <div className="mx-auto  px-10  py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold text-gray-900">Your Wishlist</div>
            <div className="mt-1 text-sm text-gray-600">{items.length ? `${items.length} items` : 'No items added yet'}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
            {items.length ? (
              <button
                type="button"
                onClick={clearWishlist}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {status ? (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {status}
          </div>
        ) : null}

        {!items.length ? (
          <div className="rounded-2xl bg-gray-50 px-6 py-10 text-center ring-1 ring-gray-200">
            <div className="text-lg font-semibold text-gray-900">Your wishlist is empty</div>
            <div className="mt-2 text-sm text-gray-600">Tap the heart icon on products to save them here.</div>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-xl bg-[#0f2e40] px-6 py-3 text-sm font-semibold text-white hover:bg-[#13384d]"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((it) => {
              const cover = toPublicUrl(it.images?.[0]) || toPublicUrl(it.imageUrl) || productFallback
              return (
                <div key={it.key} className="rounded-2xl bg-white p-4 ring-1 ring-gray-200">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        const slug = encodeURIComponent(String(it.key || 'product'))
                        navigate(`/product/${slug}`, {
                          state: {
                            product: {
                              id: it.id,
                              sku: it.sku,
                              images: it.images,
                              imageUrl: it.imageUrl,
                              title: it.title,
                              price: it.price,
                              originalPrice: it.originalPrice,
                              silverWeightGrams: it.silverWeightGrams,
                            },
                            breadcrumbs: ['Home', 'Wishlist', it.title || 'Product'],
                          },
                        })
                      }}
                      className="flex min-w-0 flex-1 items-center gap-4 text-left"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-200">
                        <img src={cover} alt={it.title} className="h-full w-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold text-gray-900">{it.title}</div>
                        {Number(it.silverWeightGrams) > 0 ? (
                          <div className="mt-1 text-xs font-semibold text-gray-500">{Number(it.silverWeightGrams)} g</div>
                        ) : null}
                        <div className="mt-1 flex items-end gap-2">
                          <div className="text-lg font-bold text-gray-900">₹{formatter.format(it.price || 0)}</div>
                          {Number.isFinite(it.originalPrice) && it.originalPrice > it.price ? (
                            <div className="pb-0.5 text-sm font-semibold text-gray-500 line-through">
                              ₹{formatter.format(it.originalPrice)}
                            </div>
                          ) : null}
                        </div>
                        {Number.isFinite(it.originalPrice) && it.originalPrice > it.price ? (
                          <div className="mt-1 text-xs font-semibold text-emerald-700">
                            {Math.round(((it.originalPrice - it.price) / it.originalPrice) * 100)}% OFF
                          </div>
                        ) : null}
                      </div>
                    </button>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => removeItem(it.key)}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

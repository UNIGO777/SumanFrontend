import { Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiBase } from '../../AdminPanel/services/apiClient.js'

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
  const [items, setItems] = useState(() => readWishlist().items)
  const [status, setStatus] = useState('')

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
    const apiBase = getApiBase()

    const run = async () => {
      const withId = items.filter((it) => isMongoId(it?.id))
      if (!apiBase || withId.length === 0) return

      try {
        const res = await fetch(`${apiBase}/api/products?page=1&limit=500`)
        const data = await res.json().catch(() => null)
        const rows = Array.isArray(data?.data) ? data.data : []
        const ids = new Set(rows.map((p) => String(p?._id || '')).filter(Boolean))

        const filtered = items.filter((it) => {
          if (!isMongoId(it?.id)) return true
          return ids.has(normalizeId(it.id))
        })

        if (!active) return
        if (filtered.length !== items.length) {
          writeWishlist(filtered)
          setStatus('Some items were removed because they are no longer available.')
        }
      } catch {
        return
      }
    }

    run()
    return () => {
      active = false
    }
  }, [items])

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
              const cover = it.images?.[0] || it.imageUrl || 'https://via.placeholder.com/600x600?text=Product'
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
                        <div className="mt-1 flex items-end gap-2">
                          <div className="text-lg font-bold text-gray-900">₹{formatter.format(it.price || 0)}</div>
                          {Number.isFinite(it.originalPrice) && it.originalPrice > it.price ? (
                            <div className="pb-0.5 text-sm font-semibold text-gray-500 line-through">
                              ₹{formatter.format(it.originalPrice)}
                            </div>
                          ) : null}
                        </div>
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

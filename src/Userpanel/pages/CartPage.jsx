import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiBase } from '../../AdminPanel/services/apiClient.js'

const CART_KEY = 'sj_cart_v1'

const normalizeId = (id) => (id === undefined || id === null ? '' : String(id)).trim()
const isMongoId = (id) => /^[a-f\d]{24}$/i.test(normalizeId(id))

const readCart = () => {
  if (typeof window === 'undefined') return { items: [] }
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    if (!raw) return { items: [] }
    const parsed = JSON.parse(raw)
    const items = Array.isArray(parsed?.items) ? parsed.items : []
    return { items }
  } catch {
    return { items: [] }
  }
}

const writeCart = (items) => {
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
        qty: Math.max(1, Number.parseInt(it.qty, 10) || 1),
      }))
      .filter((it) => it.key && it.title)

    window.localStorage.setItem(CART_KEY, JSON.stringify({ items: clean, updatedAt: Date.now() }))
    window.dispatchEvent(new Event('sj_cart_updated'))
  } catch {
    return
  }
}

export default function CartPage() {
  const formatter = useMemo(() => new Intl.NumberFormat('en-IN'), [])
  const [items, setItems] = useState(() => readCart().items)
  const [status, setStatus] = useState('')

  const sync = useCallback(() => {
    setItems(readCart().items)
  }, [])

  useEffect(() => {
    const onStorage = (e) => {
      if (e?.key && e.key !== CART_KEY) return
      sync()
    }
    const onCustom = () => sync()
    window.addEventListener('storage', onStorage)
    window.addEventListener('sj_cart_updated', onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('sj_cart_updated', onCustom)
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
          writeCart(filtered)
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

  const subtotal = useMemo(() => {
    return (items || []).reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1), 0)
  }, [items])

  const updateQty = (key, nextQty) => {
    const qty = Math.max(1, Number.parseInt(nextQty, 10) || 1)
    const next = items.map((it) => (it.key === key ? { ...it, qty } : it))
    setItems(next)
    writeCart(next)
  }

  const removeItem = (key) => {
    const next = items.filter((it) => it.key !== key)
    setItems(next)
    writeCart(next)
  }

  const clearCart = () => {
    setItems([])
    writeCart([])
  }

  return (
    <div className="bg-white flex flex-col">
      <div className="flex-1">
        <div className="mx-auto  px-10 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold text-gray-900">Your Cart</div>
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
                onClick={clearCart}
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
            <div className="text-lg font-semibold text-gray-900">Your cart is empty</div>
            <div className="mt-2 text-sm text-gray-600">Add items from product pages to see them here.</div>
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((it) => {
                  const cover = it.images?.[0] || it.imageUrl || 'https://via.placeholder.com/600x600?text=Product'
                  return (
                    <div key={it.key} className="rounded-2xl bg-white p-4 ring-1 ring-gray-200">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-4">
                          <div className="h-24 w-24 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-200">
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
                            <div className="mt-2 text-xs font-semibold text-gray-500">Item Total: ₹{formatter.format((it.price || 0) * (it.qty || 1))}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                          <div className="inline-flex items-center overflow-hidden rounded-xl ring-1 ring-gray-200">
                            <button
                              type="button"
                              onClick={() => updateQty(it.key, (it.qty || 1) - 1)}
                              className="grid h-10 w-11 place-items-center bg-white text-gray-800 hover:bg-gray-50"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <div className="grid h-10 w-12 place-items-center bg-white text-sm font-semibold text-gray-900">
                              {it.qty || 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => updateQty(it.key, (it.qty || 1) + 1)}
                              className="grid h-10 w-11 place-items-center bg-white text-gray-800 hover:bg-gray-50"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

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
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-2xl bg-white p-5 ring-1 ring-gray-200">
                <div className="text-lg font-semibold text-gray-900">Order Summary</div>
                <div className="mt-4 space-y-3 text-sm font-semibold">
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{formatter.format(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="text-emerald-700">FREE</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between text-gray-900">
                      <span>Total</span>
                      <span>₹{formatter.format(subtotal)}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#0f2e40] px-4 py-3 text-sm font-semibold text-white hover:bg-[#13384d]"
                >
                  Checkout
                </Link>
                <div className="mt-3 text-center text-xs font-semibold text-gray-500">Dummy checkout for now</div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

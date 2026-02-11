import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import productFallback from '../../assets/876 × 1628-1.png'
import { getApiBase } from '../../AdminPanel/services/apiClient.js'
import { computeProductPricing, getSilver925RatePerGram, getSilverWeightGrams } from '../UserServices/pricingService.js'

const CART_KEY = 'sj_cart_v1'
const CHECKOUT_KEY = 'sj_checkout_v1'

const normalizeId = (id) => (id === undefined || id === null ? '' : String(id)).trim()
const isMongoId = (id) => /^[a-f\d]{24}$/i.test(normalizeId(id))

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

const readCheckoutDraft = () => {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(CHECKOUT_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const writeCheckoutDraft = (draft) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CHECKOUT_KEY, JSON.stringify({ ...(draft || {}), updatedAt: Date.now() }))
  } catch {
    return
  }
}

export default function Checkout() {
  const formatter = useMemo(() => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }), [])
  const navigate = useNavigate()
  const location = useLocation()
  const apiBase = useMemo(() => getApiBase(), [])

  const [items, setItems] = useState(() => readCartItems())
  const [status, setStatus] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)
  const [placing, setPlacing] = useState(false)
  const [silverRatePerGram, setSilverRatePerGram] = useState(0)
  const [celebrating, setCelebrating] = useState(false)

  const paymentFlag = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return String(params.get('payment') || '').toLowerCase()
  }, [location.search])

  const paymentSuccess = paymentFlag === 'success'

  const placedOrderId = useMemo(() => {
    return String(placedOrder?._id || placedOrder?.id || '').trim()
  }, [placedOrder?._id, placedOrder?.id])

  const trackingHref = useMemo(() => {
    if (!placedOrderId) return '/track-order'
    return `/track-order?orderId=${encodeURIComponent(placedOrderId)}`
  }, [placedOrderId])

  const celebrationPieces = useMemo(() => {
    const orderSeed = String(placedOrder?._id || placedOrder?.id || '').trim()
    if (!orderSeed || !paymentSuccess) return []

    let h = 2166136261
    for (let i = 0; i < orderSeed.length; i += 1) {
      h ^= orderSeed.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    let s = h >>> 0
    const rand = () => {
      s ^= s << 13
      s ^= s >>> 17
      s ^= s << 5
      return (s >>> 0) / 4294967296
    }

    const colors = ['#0f2e40', '#16a34a', '#f59e0b', '#2563eb', '#a855f7', '#ef4444']
    const pieces = []
    for (let i = 0; i < 44; i += 1) {
      const size = 6 + Math.floor(rand() * 7)
      const left = rand() * 100
      const delayMs = Math.floor(rand() * 650)
      const durMs = 2200 + Math.floor(rand() * 1500)
      const driftVw = (rand() * 18 - 9).toFixed(2)
      const rotateDeg = Math.floor(rand() * 360)
      const shape = rand() > 0.5 ? '2px' : '999px'
      pieces.push({
        key: `p_${i}_${orderSeed}`,
        left,
        size,
        delayMs,
        durMs,
        driftVw,
        rotateDeg,
        color: colors[i % colors.length],
        radius: shape,
      })
    }
    return pieces
  }, [paymentSuccess, placedOrder?._id, placedOrder?.id])

  const toPublicUrl = useMemo(() => {
    return (p) => {
      if (!p) return ''
      if (/^https?:\/\//i.test(p)) return p
      if (!apiBase) return p
      if (String(p).startsWith('/')) return `${apiBase}${p}`
      return `${apiBase}/${p}`
    }
  }, [apiBase])

  const draft = useMemo(() => readCheckoutDraft(), [])

  const [contact, setContact] = useState(() => ({
    fullName: draft?.contact?.fullName || '',
    email: draft?.contact?.email || '',
    phone: draft?.contact?.phone || '',
  }))

  const [shipping, setShipping] = useState(() => ({
    address1: draft?.shipping?.address1 || '',
    address2: draft?.shipping?.address2 || '',
    city: draft?.shipping?.city || '',
    state: draft?.shipping?.state || '',
    pincode: draft?.shipping?.pincode || '',
    country: draft?.shipping?.country || 'India',
  }))

  const [delivery, setDelivery] = useState(() => ({
    notes: draft?.delivery?.notes || '',
    giftWrap: Boolean(draft?.delivery?.giftWrap),
  }))

  const [payment] = useState(() => ({
    method: 'online',
  }))

  useEffect(() => {
    const onCustom = () => setItems(readCartItems())
    const onStorage = (e) => {
      if (e?.key && e.key !== CART_KEY) return
      setItems(readCartItems())
    }
    window.addEventListener('sj_cart_updated', onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('sj_cart_updated', onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  useEffect(() => {
    let active = true
    const withId = (items || []).filter((it) => isMongoId(it?.id))
    if (!apiBase || withId.length === 0) return () => {}

    const run = async () => {
      try {
        const [rate, productsRes] = await Promise.all([
          getSilver925RatePerGram({ maxAgeMs: 0 }),
          fetch(`${apiBase}/api/products?page=1&limit=500`),
        ])
        const productsJson = await productsRes.json().catch(() => null)
        const rows = Array.isArray(productsJson?.data) ? productsJson.data : []
        const byId = new Map(rows.map((p) => [String(p?._id || ''), p]).filter(([id]) => id))

        let changed = false
        const next = (items || [])
          .filter((it) => !isMongoId(it?.id) || byId.has(normalizeId(it.id)))
          .map((it) => {
            if (!isMongoId(it?.id)) return it
            const p = byId.get(normalizeId(it.id))
            const pricing = computeProductPricing(p, rate)
            const priceNum = Number.isFinite(pricing?.price) ? pricing.price : 0
            const originalNum = Number.isFinite(pricing?.originalPrice) ? pricing.originalPrice : undefined
            const gramsNum = getSilverWeightGrams(p)
            if (Math.abs((Number(it.price) || 0) - priceNum) > 0.0001) changed = true
            if (Math.abs((Number(it.originalPrice) || 0) - (Number(originalNum) || 0)) > 0.0001) changed = true
            if (Math.abs((Number(it.silverWeightGrams) || 0) - (Number(gramsNum) || 0)) > 0.0001) changed = true
            return { ...it, price: priceNum, originalPrice: originalNum, silverWeightGrams: gramsNum || undefined }
          })

        if (!active) return
        setSilverRatePerGram(Number.isFinite(Number(rate)) ? Number(rate) : 0)
        if (next.length !== items.length || changed) {
          writeCartItems(next)
          setItems(next)
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

  useEffect(() => {
    writeCheckoutDraft({ contact, shipping, delivery, payment })
  }, [contact, delivery, payment, shipping])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const orderId = params.get('orderId') || ''
    if (!apiBase || !isMongoId(orderId)) return

    let active = true
    setStatus('')

    fetch(`${apiBase}/api/orders/${orderId}`)
      .then((r) => r.json().catch(() => null))
      .then((json) => {
        if (!active) return
        if (!json?.ok) {
          setStatus(json?.message || 'Failed to load order')
          return
        }
        setPlacedOrder(json?.data || null)
        const paymentFlag = String(params.get('payment') || '').toLowerCase()
        if (paymentFlag === 'success') {
          writeCartItems([])
          setItems([])
        }
      })
      .catch(() => {
        if (!active) return
        setStatus('Failed to load order')
      })

    return () => {
      active = false
    }
  }, [apiBase, location.search])

  useEffect(() => {
    if (!placedOrder || !paymentSuccess) return
    setCelebrating(true)
    const t = window.setTimeout(() => setCelebrating(false), 3500)
    return () => window.clearTimeout(t)
  }, [paymentSuccess, placedOrder])

  const subtotal = useMemo(() => {
    return (items || []).reduce((sum, it) => sum + (Number(it?.price) || 0) * (Number(it?.qty) || 1), 0)
  }, [items])

  const shippingFee = useMemo(() => {
    if (!items?.length) return 0
    return subtotal >= 999 ? 0 : 49
  }, [items?.length, subtotal])

  const gst = useMemo(() => subtotal * 0.18, [subtotal])
  const total = useMemo(() => subtotal + gst + shippingFee, [gst, shippingFee, subtotal])

  const validate = () => {
    if (!items?.length) return 'Your cart is empty.'
    if (!contact.fullName.trim()) return 'Full name is required.'
    if (!contact.phone.trim()) return 'Phone number is required.'
    if (!shipping.address1.trim()) return 'Address line 1 is required.'
    if (!shipping.city.trim()) return 'City is required.'
    if (!shipping.state.trim()) return 'State is required.'
    if (!shipping.pincode.trim()) return 'Pincode is required.'

    return ''
  }

  const placeOrder = async () => {
    const err = validate()
    if (err) {
      setStatus(err)
      return
    }

    if (!apiBase) {
      setStatus('Backend API is not configured.')
      return
    }

    const payloadItems = (items || []).map((it) => ({
      productId: it?.id,
      quantity: Math.max(1, Number.parseInt(it?.qty, 10) || 1),
    }))
    const invalid = payloadItems.some((it) => !isMongoId(it.productId))
    if (invalid) {
      setStatus('Some items in your cart are invalid. Please refresh your cart.')
      return
    }

    try {
      setPlacing(true)
      setStatus('')
      const res = await fetch(`${apiBase}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems, contact, shipping, delivery }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) {
        setStatus(json?.message || 'Failed to create order')
        return
      }
      const redirectUrl = String(json?.data?.redirectUrl || '').trim()
      if (!redirectUrl) {
        setStatus('Payment redirect URL is missing')
        return
      }
      window.location.href = redirectUrl
    } catch (e) {
      setStatus(e?.message || 'Failed to create order')
    } finally {
      setPlacing(false)
    }
  }

  if (placedOrder) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <style>{`
          .sj-checkout-celebrate {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 60;
            overflow: hidden;
          }

          .sj-checkout-confetti {
            position: absolute;
            top: -12vh;
            left: 0;
            transform: translate3d(0, 0, 0);
            animation: sj-checkout-confetti-fall var(--sj-dur, 2600ms) cubic-bezier(0.2, 0.8, 0.2, 1) var(--sj-delay, 0ms) forwards;
          }

          .sj-checkout-confetti-inner {
            display: block;
            width: var(--sj-size, 10px);
            height: var(--sj-size, 10px);
            border-radius: var(--sj-radius, 2px);
            background: var(--sj-color, #0f2e40);
            transform: rotate(var(--sj-rot, 0deg));
            animation: sj-checkout-confetti-spin 900ms linear var(--sj-delay, 0ms) infinite;
          }

          @keyframes sj-checkout-confetti-fall {
            0% {
              opacity: 0;
              transform: translate3d(0, -4vh, 0);
            }
            8% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: translate3d(calc(var(--sj-drift, 0) * 1vw), 112vh, 0);
            }
          }

          @keyframes sj-checkout-confetti-spin {
            0% { transform: rotate(var(--sj-rot, 0deg)); }
            100% { transform: rotate(calc(var(--sj-rot, 0deg) + 720deg)); }
          }

          .sj-checkout-pop {
            animation: sj-checkout-pop 700ms cubic-bezier(0.16, 1, 0.3, 1) 0ms both;
          }

          @keyframes sj-checkout-pop {
            0% { transform: scale(0.6); opacity: 0; }
            55% { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }

          .sj-checkout-glow {
            animation: sj-checkout-glow 1400ms ease-in-out 0ms 2 both;
          }

          @keyframes sj-checkout-glow {
            0% { box-shadow: 0 0 0 rgba(34, 197, 94, 0); }
            45% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0.18); }
            100% { box-shadow: 0 0 0 rgba(34, 197, 94, 0); }
          }
        `}</style>

        {celebrating ? (
          <div className="sj-checkout-celebrate" aria-hidden="true">
            {celebrationPieces.map((p) => (
              <span
                key={p.key}
                className="sj-checkout-confetti"
                style={{
                  left: `${p.left}%`,
                  '--sj-delay': `${p.delayMs}ms`,
                  '--sj-dur': `${p.durMs}ms`,
                  '--sj-drift': p.driftVw,
                }}
              >
                <i
                  className="sj-checkout-confetti-inner"
                  style={{
                    '--sj-size': `${p.size}px`,
                    '--sj-color': p.color,
                    '--sj-rot': `${p.rotateDeg}deg`,
                    '--sj-radius': p.radius,
                  }}
                />
              </span>
            ))}
          </div>
        ) : null}

        <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={[
                'flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-200',
                celebrating ? 'sj-checkout-pop sj-checkout-glow' : '',
              ].join(' ')}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600">
                <path
                  fill="currentColor"
                  d="M9.55 16.2L5.8 12.45l1.4-1.4 2.35 2.35 7.1-7.1 1.4 1.4-8.5 8.5z"
                />
              </svg>
            </div>
            <div className="text-2xl font-semibold text-gray-900">Order placed successfully</div>
          </div>
          <div className="mt-2 text-sm font-semibold text-gray-600">
            Order ID: <span className="text-gray-900">{placedOrder._id || placedOrder.id}</span>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-1">
            <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
              <div className="text-sm font-semibold text-gray-900">Payment</div>
              <div className="mt-2 text-sm text-gray-700">
                <div className="font-semibold text-gray-900">Online Payment (PhonePe)</div>
                <div className="mt-1 text-xs font-semibold text-gray-500">
                  Status: {placedOrder.paymentStatus || 'pending'}
                </div>

                {placedOrder.shipping ? (
                  <div className="mt-4 rounded-xl bg-white p-3 ring-1 ring-gray-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                      <span>Tracking</span>
                      <span className="text-gray-800">{placedOrder.shipping?.status || 'pending'}</span>
                    </div>
                    {placedOrder.shipping?.courierName || placedOrder.shipping?.awbCode ? (
                      <div className="mt-2 text-xs font-semibold text-gray-700">
                        {placedOrder.shipping?.courierName ? (
                          <div className="truncate">Courier: {placedOrder.shipping.courierName}</div>
                        ) : null}
                        {placedOrder.shipping?.awbCode ? <div className="truncate">AWB: {placedOrder.shipping.awbCode}</div> : null}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs font-semibold text-gray-700">Tracking will be available after dispatch</div>
                    )}

                    <a
                      href={trackingHref}
                      className="mt-3 inline-flex items-center justify-center rounded-lg bg-[#0f2e40] px-3 py-2 text-xs font-semibold text-white hover:bg-[#13384d]"
                    >
                      Track order
                    </a>

                    {placedOrder.shipping?.lastErrorMessage ? (
                      <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                        Shipping note: {placedOrder.shipping.lastErrorMessage}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
            <div className="text-sm font-semibold text-gray-900">Order summary</div>
            <div className="mt-3 space-y-3">
              {(placedOrder.items || []).map((it, idx) => (
                <div key={String(it?.product || it?._id || idx)} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">{it.name || it.title}</div>
                    <div className="text-xs font-semibold text-gray-500">Qty: {it.quantity || it.qty}</div>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    ₹{formatter.format((Number(it?.price) || 0) * (Number(it?.quantity) || Number(it?.qty) || 1))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-800">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>₹{formatter.format(Number(placedOrder.subtotal || placedOrder.totals?.subtotal || 0))}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>92.5 Silver Rate</span>
                <span>
                  {placedOrder.silverRatePerGram ? `₹${formatter.format(placedOrder.silverRatePerGram)}/g` : '—'}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>GST (18%)</span>
                <span>₹{formatter.format(Number(placedOrder.gst || placedOrder.totals?.gst || 0))}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Shipping</span>
                <span>
                  {Number(placedOrder.shippingFee || placedOrder.totals?.shippingFee || 0)
                    ? `₹${formatter.format(Number(placedOrder.shippingFee || placedOrder.totals?.shippingFee || 0))}`
                    : 'Free'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{formatter.format(Number(placedOrder.total || placedOrder.totals?.total || 0))}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="rounded-xl bg-[#0f2e40] px-6 py-3 text-sm font-semibold text-white hover:bg-[#13384d]"
            >
              Continue shopping
            </button>
            <button
              type="button"
              onClick={() => {
                setPlacedOrder(null)
                navigate('/wishlist')
              }}
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50"
            >
              Go to wishlist
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          <div className="text-xl font-semibold text-gray-900">Checkout</div>
          <div className="mt-2 text-sm text-gray-600">Your cart is empty.</div>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-[#0f2e40] px-6 py-3 text-sm font-semibold text-white hover:bg-[#13384d]"
            >
              Browse products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold text-gray-900">Checkout</div>
          <div className="mt-1 text-sm text-gray-600">Enter your details and confirm your order.</div>
        </div>
        <Link to="/cart" className="text-sm font-semibold text-[#0f2e40] hover:underline">
          Back to cart
        </Link>
      </div>

      {status ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {status}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <div className="text-lg font-semibold text-gray-900">Contact details</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="text-sm font-semibold text-gray-700">Full name</div>
                <input
                  value={contact.fullName}
                  onChange={(e) => setContact((p) => ({ ...p, fullName: e.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                  placeholder="Enter full name"
                />
              </label>

              <label className="block">
                <div className="text-sm font-semibold text-gray-700">Phone</div>
                <input
                  value={contact.phone}
                  onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                  placeholder="10-digit number"
                />
              </label>

              <label className="block sm:col-span-2">
                <div className="text-sm font-semibold text-gray-700">Email (optional)</div>
                <input
                  value={contact.email}
                  onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                  placeholder="you@example.com"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <div className="text-lg font-semibold text-gray-900">Shipping address</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <div className="text-sm font-semibold text-gray-700">Address line 1</div>
                <input
                  value={shipping.address1}
                  onChange={(e) => setShipping((p) => ({ ...p, address1: e.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                  placeholder="House no, street, area"
                />
              </label>

              <label className="block sm:col-span-2">
                <div className="text-sm font-semibold text-gray-700">Address line 2 (optional)</div>
                <input
                  value={shipping.address2}
                  onChange={(e) => setShipping((p) => ({ ...p, address2: e.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                  placeholder="Landmark, apartment, etc."
                />
              </label>

              <label className="block">
                <div className="text-sm font-semibold text-gray-700">City</div>
                <input
                  value={shipping.city}
                  onChange={(e) => setShipping((p) => ({ ...p, city: e.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                  placeholder="City"
                />
              </label>

              <label className="block">
                <div className="text-sm font-semibold text-gray-700">State</div>
                <input
                  value={shipping.state}
                  onChange={(e) => setShipping((p) => ({ ...p, state: e.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                  placeholder="State"
                />
              </label>

              <label className="block">
                <div className="text-sm font-semibold text-gray-700">Pincode</div>
                <input
                  value={shipping.pincode}
                  onChange={(e) => setShipping((p) => ({ ...p, pincode: e.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                  placeholder="Pincode"
                />
              </label>

              <label className="block">
                <div className="text-sm font-semibold text-gray-700">Country</div>
                <input
                  value={shipping.country}
                  onChange={(e) => setShipping((p) => ({ ...p, country: e.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                  placeholder="Country"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <div className="text-lg font-semibold text-gray-900">Delivery preferences</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                <input
                  type="checkbox"
                  checked={delivery.giftWrap}
                  onChange={(e) => setDelivery((p) => ({ ...p, giftWrap: e.target.checked }))}
                  className="h-4 w-4"
                />
                <div className="text-sm font-semibold text-gray-800">Gift wrap this order</div>
              </label>

              <label className="block sm:col-span-2">
                <div className="text-sm font-semibold text-gray-700">Order notes (optional)</div>
                <textarea
                  value={delivery.notes}
                  onChange={(e) => setDelivery((p) => ({ ...p, notes: e.target.value }))}
                  className="mt-2 min-h-28 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400"
                  placeholder="Delivery instructions, gift message, etc."
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <div className="text-lg font-semibold text-gray-900">Payment method</div>
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
              Online payment only (PhonePe)
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <div className="text-lg font-semibold text-gray-900">Order summary</div>
            <div className="mt-4 space-y-4">
              {items.map((it) => {
                const qty = Math.max(1, Number.parseInt(it?.qty, 10) || 1)
                const cover = toPublicUrl(it?.images?.[0]) || toPublicUrl(it?.imageUrl) || productFallback
                const showOriginal =
                  Number.isFinite(Number(it?.originalPrice)) && Number.isFinite(Number(it?.price)) && Number(it.originalPrice) > Number(it.price)
                return (
                  <div key={it.key} className="flex items-start gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-200">
                      <img src={cover} alt={it.title} className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-gray-900">{it.title}</div>
                      <div className="mt-1 text-xs font-semibold text-gray-500">Qty: {qty}</div>
                      {Number(it.silverWeightGrams) > 0 ? (
                        <div className="mt-1 text-xs font-semibold text-gray-500">{Number(it.silverWeightGrams)} g</div>
                      ) : null}
                      <div className="mt-1 flex items-end gap-2">
                        <div className="text-sm font-bold text-gray-900">₹{formatter.format(Number(it?.price) || 0)}</div>
                        {showOriginal ? (
                          <div className="pb-0.5 text-xs font-semibold text-gray-500 line-through">
                            ₹{formatter.format(Number(it?.originalPrice) || 0)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      ₹{formatter.format((Number(it?.price) || 0) * qty)}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 border-t border-gray-200 pt-4 text-sm text-gray-800">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>₹{formatter.format(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>92.5 Silver Rate</span>
                <span>{silverRatePerGram ? `₹${formatter.format(silverRatePerGram)}/g` : '—'}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>GST (18%)</span>
                <span>₹{formatter.format(gst)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Shipping</span>
                <span>{shippingFee ? `₹${formatter.format(shippingFee)}` : 'Free'}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{formatter.format(total)}</span>
              </div>
              <div className="mt-2 text-xs font-semibold text-gray-500">
                Free shipping on orders ₹999+
              </div>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              disabled={placing}
              className="mt-5 w-full rounded-xl bg-[#0f2e40] px-4 py-3 text-sm font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
            >
              {placing ? 'Redirecting...' : 'Pay now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

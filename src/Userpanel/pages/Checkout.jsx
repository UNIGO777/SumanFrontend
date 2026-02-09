import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import productFallback from '../../assets/876 × 1628-1.png'
import { getApiBase } from '../../AdminPanel/services/apiClient.js'
import { computeProductPricing, getSilver925RatePerGram, getSilverWeightGrams } from '../UserServices/pricingService.js'

const CART_KEY = 'sj_cart_v1'
const CHECKOUT_KEY = 'sj_checkout_v1'
const ORDERS_KEY = 'sj_orders_v1'

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

const readOrders = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeOrders = (orders) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(Array.isArray(orders) ? orders : []))
  } catch {
    return
  }
}

const emptyCard = { number: '', name: '', expiry: '', cvv: '' }

export default function Checkout() {
  const formatter = useMemo(() => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }), [])
  const navigate = useNavigate()
  const apiBase = useMemo(() => getApiBase(), [])

  const [items, setItems] = useState(() => readCartItems())
  const [status, setStatus] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)
  const [silverRatePerGram, setSilverRatePerGram] = useState(0)

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

  const [payment, setPayment] = useState(() => ({
    method: draft?.payment?.method || 'cod',
    upiId: draft?.payment?.upiId || '',
    card: { ...emptyCard, ...(draft?.payment?.card || {}) },
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

    if (payment.method === 'upi' && !payment.upiId.trim()) return 'UPI ID is required.'
    if (payment.method === 'card') {
      if (!payment.card.number.trim()) return 'Card number is required.'
      if (!payment.card.name.trim()) return 'Name on card is required.'
      if (!payment.card.expiry.trim()) return 'Expiry is required.'
      if (!payment.card.cvv.trim()) return 'CVV is required.'
    }

    return ''
  }

  const placeOrder = () => {
    const err = validate()
    if (err) {
      setStatus(err)
      return
    }

    const order = {
      id: `SJ-${Date.now()}`,
      placedAt: Date.now(),
      contact,
      shipping,
      delivery,
      payment: {
        method: payment.method,
        upiId: payment.method === 'upi' ? payment.upiId : '',
      },
      items: (items || []).map((it) => ({
        key: String(it?.key || '').trim(),
        id: it?.id,
        sku: it?.sku,
        title: it?.title || '',
        price: Number(it?.price) || 0,
        originalPrice: Number.isFinite(Number(it?.originalPrice)) ? Number(it.originalPrice) : undefined,
        silverWeightGrams: Number.isFinite(Number(it?.silverWeightGrams)) ? Number(it.silverWeightGrams) : undefined,
        qty: Math.max(1, Number.parseInt(it?.qty, 10) || 1),
        images: Array.isArray(it?.images) ? it.images.filter(Boolean) : [],
        imageUrl: it?.imageUrl || '',
      })),
      silverRatePerGram,
      totals: { subtotal, gst, shippingFee, total },
    }

    const orders = readOrders()
    writeOrders([order, ...(orders || [])])
    writeCartItems([])
    setPlacedOrder(order)
    setStatus('')
  }

  if (placedOrder) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          <div className="text-2xl font-semibold text-gray-900">Order placed successfully</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">
            Order ID: <span className="text-gray-900">{placedOrder.id}</span>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
              <div className="text-sm font-semibold text-gray-900">Delivery details</div>
              <div className="mt-2 text-sm text-gray-700">
                <div className="font-semibold text-gray-900">{placedOrder.contact.fullName}</div>
                <div>{placedOrder.contact.phone}</div>
                {placedOrder.contact.email ? <div>{placedOrder.contact.email}</div> : null}
                <div className="mt-2">
                  {placedOrder.shipping.address1}
                  {placedOrder.shipping.address2 ? <span>, {placedOrder.shipping.address2}</span> : null}
                  <div>
                    {placedOrder.shipping.city}, {placedOrder.shipping.state} - {placedOrder.shipping.pincode}
                  </div>
                  <div>{placedOrder.shipping.country}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
              <div className="text-sm font-semibold text-gray-900">Payment</div>
              <div className="mt-2 text-sm text-gray-700">
                <div className="font-semibold text-gray-900">
                  {placedOrder.payment.method === 'cod'
                    ? 'Cash on Delivery'
                    : placedOrder.payment.method === 'upi'
                      ? 'UPI'
                      : 'Card'}
                </div>
                {placedOrder.payment.method === 'upi' && placedOrder.payment.upiId ? (
                  <div>UPI ID: {placedOrder.payment.upiId}</div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
            <div className="text-sm font-semibold text-gray-900">Order summary</div>
            <div className="mt-3 space-y-3">
              {placedOrder.items.map((it) => (
                <div key={it.key} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">{it.title}</div>
                    {Number(it.silverWeightGrams) > 0 ? (
                      <div className="text-xs font-semibold text-gray-500">{Number(it.silverWeightGrams)} g</div>
                    ) : null}
                    <div className="text-xs font-semibold text-gray-500">Qty: {it.qty}</div>
                  </div>
                  <div className="text-sm font-bold text-gray-900">₹{formatter.format(it.price * it.qty)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-800">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>₹{formatter.format(placedOrder.totals.subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>92.5 Silver Rate</span>
                <span>{placedOrder.silverRatePerGram ? `₹${formatter.format(placedOrder.silverRatePerGram)}/g` : '—'}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>GST (18%)</span>
                <span>₹{formatter.format(placedOrder.totals.gst || 0)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Shipping</span>
                <span>{placedOrder.totals.shippingFee ? `₹${formatter.format(placedOrder.totals.shippingFee)}` : 'Free'}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{formatter.format(placedOrder.totals.total)}</span>
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
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { key: 'cod', label: 'Cash on Delivery' },
                { key: 'upi', label: 'UPI' },
                { key: 'card', label: 'Card' },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setPayment((p) => ({ ...p, method: m.key }))}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-semibold ring-1 ${
                    payment.method === m.key
                      ? 'bg-[#0f2e40] text-white ring-[#0f2e40]'
                      : 'bg-white text-gray-900 ring-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {payment.method === 'upi' ? (
              <div className="mt-4">
                <label className="block">
                  <div className="text-sm font-semibold text-gray-700">UPI ID</div>
                  <input
                    value={payment.upiId}
                    onChange={(e) => setPayment((p) => ({ ...p, upiId: e.target.value }))}
                    className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                    placeholder="name@bank"
                  />
                </label>
              </div>
            ) : null}

            {payment.method === 'card' ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <div className="text-sm font-semibold text-gray-700">Card number</div>
                  <input
                    value={payment.card.number}
                    onChange={(e) => setPayment((p) => ({ ...p, card: { ...p.card, number: e.target.value } }))}
                    className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                    placeholder="1234 5678 9012 3456"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <div className="text-sm font-semibold text-gray-700">Name on card</div>
                  <input
                    value={payment.card.name}
                    onChange={(e) => setPayment((p) => ({ ...p, card: { ...p.card, name: e.target.value } }))}
                    className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                    placeholder="Name"
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-semibold text-gray-700">Expiry</div>
                  <input
                    value={payment.card.expiry}
                    onChange={(e) => setPayment((p) => ({ ...p, card: { ...p.card, expiry: e.target.value } }))}
                    className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                    placeholder="MM/YY"
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-semibold text-gray-700">CVV</div>
                  <input
                    value={payment.card.cvv}
                    onChange={(e) => setPayment((p) => ({ ...p, card: { ...p.card, cvv: e.target.value } }))}
                    className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
                    placeholder="***"
                  />
                </label>
              </div>
            ) : null}
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
              className="mt-5 w-full rounded-xl bg-[#0f2e40] px-4 py-3 text-sm font-semibold text-white hover:bg-[#13384d]"
            >
              Place order
            </button>
            <div className="mt-3 text-center text-xs font-semibold text-gray-500">
              This is a demo checkout. Order is saved in your browser.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

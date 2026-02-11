import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  listAdminOrders,
  shiprocketCreateForOrder,
  shiprocketGenerateLabel,
  shiprocketGenerateManifest,
  shiprocketGeneratePickup,
  shiprocketPrintInvoice,
  shiprocketTrackAwb,
  showAdminOrder,
  updateAdminOrderStatus,
} from '../services/orders.js'

const fmtInr = (n) => {
  const num = Number(n) || 0
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num)
}

const fmtDateTime = (value) => {
  const d = value ? new Date(value) : null
  if (!d || Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

export default function AdminOrders() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const limit = 20

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_desc')

  const totalPages = useMemo(() => Math.max(1, Math.ceil((Number(total) || 0) / limit)), [total, limit])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await listAdminOrders({ page, limit })
      setRows(res?.data || [])
      setTotal(res?.total || 0)
    } catch (e) {
      setError(e?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    load()
  }, [load])

  const normalize = useCallback((v) => String(v || '').trim().toLowerCase(), [])

  const statusOptions = useMemo(() => {
    const set = new Set()
    ;(rows || []).forEach((r) => {
      const value = String(r?.status || '').trim()
      if (value) set.add(value)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [rows])

  const paymentOptions = useMemo(() => {
    const set = new Set()
    ;(rows || []).forEach((r) => {
      const value = String(r?.paymentStatus || '').trim()
      if (value) set.add(value)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [rows])

  const filteredRows = useMemo(() => {
    const query = normalize(q)
    const wantStatus = String(statusFilter || '').trim()
    const wantPayment = String(paymentFilter || '').trim()

    const next = (rows || []).filter((o) => {
      if (wantStatus && String(o?.status || '').trim() !== wantStatus) return false
      if (wantPayment && String(o?.paymentStatus || '').trim() !== wantPayment) return false
      if (!query) return true

      const haystack = [
        o?._id,
        o?.customerPhone,
        o?.customerEmail,
        o?.status,
        o?.paymentStatus,
        o?.currency,
        o?.total,
      ]
        .map((v) => normalize(v))
        .filter(Boolean)
        .join(' ')

      return haystack.includes(query)
    })

    const sorter = (a, b) => {
      if (sortBy === 'created_asc') return new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime()
      if (sortBy === 'created_desc') return new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime()
      if (sortBy === 'total_asc') return (Number(a?.total) || 0) - (Number(b?.total) || 0)
      if (sortBy === 'total_desc') return (Number(b?.total) || 0) - (Number(a?.total) || 0)
      return 0
    }

    return next.slice().sort(sorter)
  }, [normalize, paymentFilter, q, rows, sortBy, statusFilter])

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-gray-900">Orders</div>
          <div className="mt-1 text-xs font-semibold text-gray-500">Latest orders with payment status</div>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error ? <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="text-xs font-semibold text-gray-600">Search</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Order ID / phone / email / status..."
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 outline-none focus:border-gray-300"
          />
        </div>

        <div className="lg:col-span-3">
          <div className="text-xs font-semibold text-gray-600">Order status</div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-gray-300"
          >
            <option value="">All</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-3">
          <div className="text-xs font-semibold text-gray-600">Payment</div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-gray-300"
          >
            <option value="">All</option>
            {paymentOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-1">
          <div className="text-xs font-semibold text-gray-600">Sort</div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-gray-300"
          >
            <option value="created_desc">New</option>
            <option value="created_asc">Old</option>
            <option value="total_desc">Total ↓</option>
            <option value="total_asc">Total ↑</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold text-gray-500">
          Showing {filteredRows.length} of {rows.length} on this page
        </div>
        {q || statusFilter || paymentFilter || sortBy !== 'created_desc' ? (
          <button
            type="button"
            onClick={() => {
              setQ('')
              setStatusFilter('')
              setPaymentFilter('')
              setSortBy('created_desc')
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[860px] table-auto border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Order Status</th>
              <th className="px-3 py-2">Payment</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-sm font-semibold text-gray-600">
                  Loading...
                </td>
              </tr>
            ) : filteredRows.length ? (
              filteredRows.map((o) => (
                <tr
                  key={o._id}
                  className="rounded-xl bg-gray-50 text-sm font-semibold text-gray-800 ring-1 ring-gray-200 hover:bg-gray-100"
                >
                  <td className="px-3 py-3">{o._id}</td>
                  <td className="px-3 py-3">
                    <div className="text-gray-900">{o.customerPhone || '—'}</div>
                    <div className="mt-1 text-xs font-semibold text-gray-500">{o.customerEmail || '—'}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-gray-900">₹{fmtInr(o.total)}</span>
                    <span className="ml-2 text-xs font-semibold text-gray-500">{o.currency || 'INR'}</span>
                  </td>
                  <td className="px-3 py-3">{o.status || '—'}</td>
                  <td className="px-3 py-3">{o.paymentStatus || '—'}</td>
                  <td className="px-3 py-3">{fmtDateTime(o.createdAt) || '—'}</td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/orders/${o._id}`)}
                      className="rounded-lg bg-[#0f2e40] px-3 py-2 text-xs font-semibold text-white hover:bg-[#13384d]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : rows.length ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-sm font-semibold text-gray-600">
                  No orders match the current filters
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-sm font-semibold text-gray-600">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold text-gray-500">
          Page {page} of {totalPages} • Total {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminOrderDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shipLoading, setShipLoading] = useState('')
  const [shipError, setShipError] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError('')
      const res = await showAdminOrder(id)
      setData(res?.data || null)
    } catch (e) {
      setError(e?.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const payment = data?.payment && typeof data.payment === 'object' ? data.payment : null
  const address = data?.shippingAddress && typeof data.shippingAddress === 'object' ? data.shippingAddress : null
  const shiprocket = data?.shiprocket && typeof data.shiprocket === 'object' ? data.shiprocket : null
  const statusValue = String(data?.status || '').trim() || 'pending'

  const statusOptions = useMemo(
    () => [
      { value: 'pending', label: 'Pending' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'shipped', label: 'Dispatched' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
    []
  )

  const runShipAction = useCallback(
    async ({ key, action }) => {
      if (!id) return
      try {
        setShipLoading(String(key || ''))
        setShipError('')
        const res = await action()
        setData(res?.data || null)
      } catch (e) {
        setShipError(e?.message || 'Shiprocket action failed')
      } finally {
        setShipLoading('')
      }
    },
    [id]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-gray-900">Order Details</div>
          <div className="mt-1 text-xs font-semibold text-gray-500">{id}</div>
        </div>
        <Link
          to="/admin/orders"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Back
        </Link>
      </div>

      {error ? <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
      {loading ? <div className="rounded-xl bg-white p-6 shadow-sm">Loading...</div> : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="text-sm font-semibold text-gray-900">Items</div>
            <div className="mt-4 space-y-3">
              {(data.items || []).map((it, idx) => (
                <div key={String(it?._id || it?.product || idx)} className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3 ring-1 ring-gray-200">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">{it?.name || '—'}</div>
                    <div className="mt-1 text-xs font-semibold text-gray-500">Qty: {it?.quantity || 1}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">₹{fmtInr((Number(it?.price) || 0) * (Number(it?.quantity) || 1))}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-gray-200 pt-4 text-sm font-semibold text-gray-800">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>₹{fmtInr(data.subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>GST</span>
                <span>₹{fmtInr(data.gst)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Shipping</span>
                <span>₹{fmtInr(data.shippingFee)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base text-gray-900">
                <span>Total</span>
                <span>₹{fmtInr(data.total)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Status</div>
              {statusError ? (
                <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{statusError}</div>
              ) : null}
              <div className="mt-3 space-y-2 text-sm font-semibold text-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order</span>
                  <span className="flex items-center gap-2">
                    <select
                      value={statusValue}
                      disabled={statusLoading}
                      onChange={async (e) => {
                        const next = String(e.target.value || '').trim()
                        if (!id || !next || next === statusValue) return
                        try {
                          setStatusLoading(true)
                          setStatusError('')
                          const res = await updateAdminOrderStatus(id, next)
                          setData(res?.data || null)
                        } catch (err) {
                          setStatusError(err?.message || 'Failed to update status')
                        } finally {
                          setStatusLoading(false)
                        }
                      }}
                      className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-gray-300 disabled:opacity-60"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {statusLoading ? <span className="text-xs font-semibold text-gray-500">Saving...</span> : null}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment</span>
                  <span>{payment?.status || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Provider</span>
                  <span>{payment?.provider || '—'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-gray-900">Shipping (Shiprocket)</div>
                <button
                  type="button"
                  onClick={load}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>

              {shipError ? (
                <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{shipError}</div>
              ) : null}

              <div className="mt-4 space-y-2 text-sm font-semibold text-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipment</span>
                  <span className="truncate pl-4">{shiprocket?.shipmentId || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">AWB</span>
                  <span className="truncate pl-4">{shiprocket?.awbCode || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Courier</span>
                  <span className="truncate pl-4">{shiprocket?.courierName || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="truncate pl-4">{shiprocket?.status || '—'}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={shipLoading === 'create'}
                  onClick={() =>
                    runShipAction({
                      key: 'create',
                      action: () => shiprocketCreateForOrder(id),
                    })
                  }
                  className="rounded-lg bg-[#0f2e40] px-3 py-2 text-xs font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
                >
                  {shiprocket?.shipmentId ? 'Recheck' : shipLoading === 'create' ? 'Creating...' : 'Create shipment'}
                </button>

                <button
                  type="button"
                  disabled={!shiprocket?.shipmentId || shipLoading === 'pickup'}
                  onClick={() =>
                    runShipAction({
                      key: 'pickup',
                      action: () => shiprocketGeneratePickup(id),
                    })
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                  {shipLoading === 'pickup' ? 'Generating...' : 'Pickup'}
                </button>

                <button
                  type="button"
                  disabled={!shiprocket?.shipmentId || shipLoading === 'label'}
                  onClick={() =>
                    runShipAction({
                      key: 'label',
                      action: () => shiprocketGenerateLabel(id),
                    })
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                  {shipLoading === 'label' ? 'Generating...' : 'Label'}
                </button>

                <button
                  type="button"
                  disabled={!shiprocket?.shipmentId || shipLoading === 'manifest'}
                  onClick={() =>
                    runShipAction({
                      key: 'manifest',
                      action: () => shiprocketGenerateManifest(id),
                    })
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                  {shipLoading === 'manifest' ? 'Generating...' : 'Manifest'}
                </button>

                <button
                  type="button"
                  disabled={!shiprocket?.orderId || shipLoading === 'invoice'}
                  onClick={() =>
                    runShipAction({
                      key: 'invoice',
                      action: () => shiprocketPrintInvoice(id),
                    })
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                  {shipLoading === 'invoice' ? 'Generating...' : 'Invoice'}
                </button>

                <button
                  type="button"
                  disabled={!shiprocket?.awbCode || shipLoading === 'track'}
                  onClick={() =>
                    runShipAction({
                      key: 'track',
                      action: () => shiprocketTrackAwb(id),
                    })
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                  {shipLoading === 'track' ? 'Loading...' : 'Track'}
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {shiprocket?.labelUrl ? (
                  <a
                    href={shiprocket.labelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0f2e40] ring-1 ring-gray-200 hover:bg-gray-100"
                  >
                    Open Label PDF
                  </a>
                ) : null}
                {shiprocket?.manifestUrl ? (
                  <a
                    href={shiprocket.manifestUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0f2e40] ring-1 ring-gray-200 hover:bg-gray-100"
                  >
                    Open Manifest PDF
                  </a>
                ) : null}
                {shiprocket?.invoiceUrl ? (
                  <a
                    href={shiprocket.invoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0f2e40] ring-1 ring-gray-200 hover:bg-gray-100"
                  >
                    Open Invoice PDF
                  </a>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Customer</div>
              <div className="mt-3 space-y-1 text-sm font-semibold text-gray-800">
                <div>{data.customerPhone || '—'}</div>
                <div className="text-xs text-gray-500">{data.customerEmail || '—'}</div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Shipping</div>
              <div className="mt-3 space-y-1 text-sm font-semibold text-gray-800">
                <div>{address?.name || '—'}</div>
                <div>{address?.phone || '—'}</div>
                <div className="text-xs font-semibold text-gray-600">
                  {address?.line1 || ''} {address?.line2 || ''}
                </div>
                <div className="text-xs font-semibold text-gray-600">
                  {address?.city || ''} {address?.state || ''} {address?.postalCode || ''}
                </div>
                <div className="text-xs font-semibold text-gray-600">{address?.country || ''}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

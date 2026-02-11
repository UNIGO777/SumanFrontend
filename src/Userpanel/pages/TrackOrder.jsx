import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getJson } from '../../AdminPanel/services/apiClient.js'

const normalizeId = (v) => String(v || '').trim()

const isMongoId = (v) => /^[a-f0-9]{24}$/i.test(normalizeId(v))

export default function TrackOrder() {
  const location = useLocation()
  const navigate = useNavigate()

  const orderIdFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return normalizeId(params.get('orderId'))
  }, [location.search])

  const [orderId, setOrderId] = useState(orderIdFromQuery)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [info, setInfo] = useState(null)

  const run = useCallback(
    async (id) => {
      const clean = normalizeId(id)
      setInfo(null)
      setMessage('')
      if (!isMongoId(clean)) {
        setMessage('Please enter a valid Order ID.')
        return
      }

      try {
        setLoading(true)
        const res = await getJson(`/api/orders/${clean}/tracking`, undefined, { noCache: true })
        if (res?.ok && res?.data?.trackingUrl) {
          window.location.assign(String(res.data.trackingUrl))
          return
        }
        setInfo(res?.data || null)
        setMessage(String(res?.message || 'Tracking is not available yet.'))
      } catch (e) {
        setMessage(e?.message || 'Tracking failed.')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!orderIdFromQuery) return
    setOrderId(orderIdFromQuery)
    run(orderIdFromQuery)
  }, [orderIdFromQuery, run])

  return (
    <div className="bg-white">
      <div className="w-full bg-gray-100">
        <div className="w-full px-8 py-10 text-center sm:px-12 md:px-8 lg:px-14">
          <div className="text-4xl font-semibold text-gray-900">Track Order</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">Enter your Order ID to track delivery status.</div>
        </div>
      </div>

      <div className="w-full px-8 py-10 sm:px-12 md:px-8 lg:px-14">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <div className="text-sm font-semibold text-gray-800">Order ID</div>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. 65f0c9e4b..."
                className="h-11 w-full flex-1 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 outline-none focus:border-gray-400"
              />
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  const clean = normalizeId(orderId)
                  navigate(clean ? `/track-order?orderId=${encodeURIComponent(clean)}` : '/track-order', { replace: true })
                  run(clean)
                }}
                className="h-11 rounded-xl bg-[#0f2e40] px-6 text-sm font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
              >
                {loading ? 'Tracking...' : 'Track'}
              </button>
            </div>

            {info?.awbCode || info?.courierName ? (
              <div className="mt-4 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-gray-600">
                  <span>Shipment</span>
                  <span className="text-gray-900">{info?.status || 'processing'}</span>
                </div>
                <div className="mt-2 text-xs font-semibold text-gray-700">
                  {info?.courierName ? <div className="truncate">Courier: {info.courierName}</div> : null}
                  {info?.awbCode ? <div className="truncate">AWB: {info.awbCode}</div> : null}
                </div>
              </div>
            ) : null}

            {message ? (
              <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
                {message}
              </div>
            ) : null}

            <div className="mt-4 text-xs font-semibold text-gray-500">
              After dispatch, you will be redirected to the courier tracking page.
            </div>
          </div>

          <div className="mt-6 text-center text-sm font-semibold text-gray-700">
            <Link to="/" className="text-[#0f2e40] underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


import { useEffect, useMemo, useState } from 'react'
import { getJson, putJson } from '../services/apiClient.js'

export default function AdminSilverPrice() {
  const formatter = useMemo(() => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }), [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const [pricePerGram, setPricePerGram] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [updatedAt, setUpdatedAt] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    setStatus('')
    try {
      const res = await getJson('/api/admin/prices/silver-925')
      const data = res?.data || {}
      setPricePerGram(data?.pricePerGram === undefined || data?.pricePerGram === null ? '' : String(data.pricePerGram))
      setCurrency(String(data?.currency || 'INR').toUpperCase())
      setUpdatedAt(data?.updatedAt ? String(data.updatedAt) : '')
    } catch (e) {
      setError(e?.message || 'Failed to load silver price')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onSave = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')

    const n = Number(pricePerGram)
    if (!Number.isFinite(n) || n < 0) {
      setError('Price per gram must be a valid number')
      return
    }

    setLoading(true)
    try {
      const res = await putJson('/api/admin/prices/silver-925', { pricePerGram: n, currency })
      const data = res?.data || {}
      setUpdatedAt(data?.updatedAt ? String(data.updatedAt) : '')
      setStatus('Saved')
    } catch (e2) {
      setError(e2?.message || 'Failed to save silver price')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-semibold text-gray-900">92.5 Silver Price</div>
        <div className="mt-1 text-sm text-gray-600">Manage the current 92.5 silver rate used in frontend pricing.</div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {status ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</div>
      ) : null}

      <form onSubmit={onSave} className="rounded-xl bg-white p-5 shadow-md">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-gray-700">Price per gram</div>
            <input
              value={pricePerGram}
              onChange={(e) => setPricePerGram(e.target.value)}
              inputMode="decimal"
              placeholder="Eg. 75"
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
              disabled={loading}
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-700">Currency</div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
              disabled={loading}
            >
              <option value="INR">INR</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-600">
            Current: {currency === 'INR' ? '₹' : ''}{' '}
            {(() => {
              const n = Number(pricePerGram)
              return Number.isFinite(n) ? formatter.format(n) : '—'
            })()}
            /g
            {updatedAt ? <span className="ml-2 text-gray-400">Updated: {new Date(updatedAt).toLocaleString()}</span> : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60"
            >
              Refresh
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#0f2e40] px-5 py-2 text-sm font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { getOccasion, upsertOccasion } from '../services/occasions.js'
import HomeSpecialOccasionSection from '../../Userpanel/pages/home/sections/HomeSpecialOccasionSection.jsx'

const KEY = 'special-occasion'

export default function AdminSpecialOccasionCms() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setStatus('')
      const doc = await getOccasion(KEY)
      setTitle(doc?.title || '')
      setDescription(doc?.description || '')
      setSortOrder(doc?.sortOrder === undefined || doc?.sortOrder === null ? '0' : String(doc.sortOrder))
      setIsActive(doc?.isActive !== false)
    } catch (e) {
      setError(e?.message || 'Failed to load CMS')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const canSave = useMemo(() => Boolean(String(title || '').trim()), [title])

  const onSave = async () => {
    setError('')
    setStatus('')
    const titleTrim = String(title || '').trim()
    if (!titleTrim) {
      setError('Title is required')
      return
    }
    const sortNum = String(sortOrder || '').trim() ? Number(sortOrder) : 0
    if (!Number.isFinite(sortNum)) {
      setError('Sort order must be a valid number')
      return
    }

    try {
      setLoading(true)
      await upsertOccasion(KEY, {
        key: KEY,
        title: titleTrim,
        description: String(description || '').trim(),
        sortOrder: sortNum,
        isActive,
      })
      setStatus('Saved')
    } catch (e) {
      setError(e?.message || 'Failed to save CMS')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Special Occasion CMS</div>
          <div className="mt-1 text-sm text-gray-600">Control section title and description</div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 disabled:opacity-60 md:w-auto"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={loading || !canSave}
            className="primary-bg h-10 w-full rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60 md:w-auto"
          >
            Save
          </button>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {status ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</div>
      ) : null}

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-gray-600">Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Special Occasion"
              className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
              disabled={loading}
            />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-gray-600">Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional"
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
              disabled={loading}
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-600">Sort Order</div>
            <input
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              inputMode="numeric"
              placeholder="0"
              className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
              disabled={loading}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-800 disabled:opacity-60"
            >
              <span
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isActive ? 'primary-bg' : 'bg-gray-200'}`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-4' : 'translate-x-1'}`}
                />
              </span>
              {isActive ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-gray-900">Preview</div>
        <HomeSpecialOccasionSection />
      </div>
    </div>
  )
}

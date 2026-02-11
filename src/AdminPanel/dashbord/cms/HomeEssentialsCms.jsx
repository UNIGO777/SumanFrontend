import { useCallback, useEffect, useMemo, useState } from 'react'
import HomeEssentialsSection from '../../../Userpanel/pages/home/sections/HomeEssentialsSection.jsx'
import { getApiBase, getJson, putJson } from '../../services/apiClient.js'
import { uploadImage } from '../../services/files.js'

const KEY = 'home-essentials'

const normalizeItems = (items) => {
  const safe = Array.isArray(items) ? items : []
  return safe
    .map((it, idx) => ({
      label: String(it?.label || '').trim(),
      imageUrl: String(it?.imageUrl || '').trim(),
      href: String(it?.href || '').trim(),
      sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
    }))
    .filter((it) => Boolean(it.label && it.imageUrl))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 3)
}

export default function HomeEssentialsCms() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [uploadingIdx, setUploadingIdx] = useState(-1)
  const [localPreviews, setLocalPreviews] = useState(['', '', ''])
  const [isDragActive, setIsDragActive] = useState([false, false, false])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [items, setItems] = useState([
    { label: '', imageUrl: '', href: '', sortOrder: 0 },
    { label: '', imageUrl: '', href: '', sortOrder: 1 },
    { label: '', imageUrl: '', href: '', sortOrder: 2 },
  ])

  const apiBase = useMemo(() => getApiBase(), [])

  const toPublicUrl = useCallback(
    (p) => {
      if (!p) return ''
      if (/^https?:\/\//i.test(p)) return p
      if (!apiBase) return p
      if (p.startsWith('/')) return `${apiBase}${p}`
      return `${apiBase}/${p}`
    },
    [apiBase]
  )

  const safeRevokeUrl = (u) => {
    try {
      if (u) URL.revokeObjectURL(u)
    } catch {
      return
    }
  }

  const setItemField = (idx, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)))
  }

  const setDragActiveIdx = (idx, value) => {
    setIsDragActive((prev) => prev.map((v, i) => (i === idx ? Boolean(value) : v)))
  }

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setStatus('')
      const res = await getJson(`/api/admin/cms/${KEY}`, undefined, { noCache: true })
      setTitle(String(res?.data?.title || '').trim())
      setDescription(String(res?.data?.description || '').trim())

      const serverItems = normalizeItems(res?.data?.items)
      const filled = [...serverItems]
      while (filled.length < 3) filled.push({ label: '', imageUrl: '', href: '', sortOrder: filled.length })
      setItems(filled.slice(0, 3).map((it, idx) => ({ ...it, sortOrder: idx })))
    } catch (e) {
      setError(e?.message || 'Failed to load CMS')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const maxUploadBytes = 5 * 1024 * 1024

  const onSelectImage = async (idx, file) => {
    if (!file) return
    setError('')
    setStatus('')
    if ((file?.size || 0) > maxUploadBytes) {
      setError(`"${file.name}" is larger than 5 MB`)
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setLocalPreviews((prev) => {
      const next = [...prev]
      safeRevokeUrl(next[idx])
      next[idx] = previewUrl
      return next
    })

    try {
      setUploadingIdx(idx)
      const res = await uploadImage(file)
      const path = String(res?.path || '').trim()
      if (!path) throw new Error('Upload failed')
      setItemField(idx, 'imageUrl', toPublicUrl(path))
    } catch (e) {
      setError(e?.message || 'Failed to upload image')
    } finally {
      setUploadingIdx(-1)
      setLocalPreviews((prev) => {
        const next = [...prev]
        safeRevokeUrl(next[idx])
        next[idx] = ''
        return next
      })
    }
  }

  const canSave = useMemo(() => uploadingIdx === -1 && normalizeItems(items).length > 0, [items, uploadingIdx])

  const onSave = async () => {
    setError('')
    setStatus('')

    const normalized = normalizeItems(items).map((it, idx) => ({ ...it, sortOrder: idx }))
    if (!normalized.length) {
      setError('Please add at least 1 card with title and image')
      return
    }

    try {
      setLoading(true)
      await putJson(`/api/admin/cms/${KEY}`, {
        title: String(title || '').trim(),
        description: String(description || '').trim(),
        items: normalized,
      })
      setStatus('Saved')
      await load()
    } catch (e) {
      setError(e?.message || 'Failed to save CMS')
    } finally {
      setLoading(false)
    }
  }

  const previewCms = useMemo(() => {
    return {
      title: String(title || '').trim(),
      description: String(description || '').trim(),
      items: items.map((it, idx) => ({
        label: String(it?.label || '').trim(),
        imageUrl: String(localPreviews[idx] || it?.imageUrl || '').trim(),
        href: String(it?.href || '').trim(),
        sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
      })),
    }
  }, [description, items, localPreviews, title])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Home Essentials CMS</div>
          <div className="mt-1 text-sm text-gray-600">Manage section title, description, and 3 cards</div>
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
            <div className="text-xs font-semibold text-gray-600">Section title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="2026 Jewellery Essentials"
              className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
              disabled={loading || uploadingIdx !== -1}
            />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-gray-600">Section description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Everyday staples designed to match your mood, your outfit, and your moment."
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
              disabled={loading || uploadingIdx !== -1}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-6">
          {items.map((it, idx) => (
            <div key={idx} className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-gray-600">Card {idx + 1} title</div>
                <input
                  value={it.label}
                  onChange={(e) => setItemField(idx, 'label', e.target.value)}
                  placeholder={idx === 0 ? 'Timeless Pearls' : idx === 1 ? 'Stackable Collection' : 'Emerging Trends'}
                  className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                  disabled={loading || uploadingIdx !== -1}
                />

                <div className="mt-4">
                  <div className="text-xs font-semibold text-gray-600">Link (on click)</div>
                  <input
                    value={it.href}
                    onChange={(e) => setItemField(idx, 'href', e.target.value)}
                    placeholder="/search or https://..."
                    className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                    disabled={loading || uploadingIdx !== -1}
                  />
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600">Card {idx + 1} image</div>
                <div
                  className={`mt-2 rounded-xl border-2 border-dashed p-4 transition-colors ${
                    isDragActive[idx] ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'
                  }`}
                  onDragEnter={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (loading || uploadingIdx !== -1) return
                    setDragActiveIdx(idx, true)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (loading || uploadingIdx !== -1) return
                    setDragActiveIdx(idx, true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (e.currentTarget !== e.target) return
                    setDragActiveIdx(idx, false)
                  }}
                  onDrop={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDragActiveIdx(idx, false)
                    if (loading || uploadingIdx !== -1) return
                    const f = e.dataTransfer?.files?.[0]
                    await onSelectImage(idx, f)
                  }}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Drag & drop image here</div>
                      <div className="mt-1 text-xs font-medium text-gray-500">PNG, JPG, WEBP, HEIC. Max 5 MB.</div>
                    </div>
                    <label
                      htmlFor={`home-essentials-image-${idx}`}
                      className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 ${
                        loading || uploadingIdx !== -1 ? 'pointer-events-none opacity-60' : ''
                      }`}
                    >
                      {uploadingIdx === idx ? 'Uploading...' : 'Choose file'}
                    </label>
                  </div>

                  {localPreviews[idx] || it.imageUrl ? (
                    <div className="mt-4 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                      <img
                        src={localPreviews[idx] || it.imageUrl}
                        alt="preview"
                        className="h-40 w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                <input
                  id={`home-essentials-image-${idx}`}
                  type="file"
                  accept="image/*,.heic,.heif,.jfif"
                  className="hidden"
                  disabled={loading || uploadingIdx !== -1}
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    e.target.value = ''
                    await onSelectImage(idx, f)
                  }}
                />

                <div className="mt-4">
                  <div className="text-xs font-semibold text-gray-600">Image URL</div>
                  <input
                    value={it.imageUrl}
                    onChange={(e) => setItemField(idx, 'imageUrl', e.target.value)}
                    placeholder="https://..."
                    className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                    disabled={loading || uploadingIdx !== -1}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-gray-900">Preview</div>
        <HomeEssentialsSection cmsData={previewCms} />
      </div>
    </div>
  )
}

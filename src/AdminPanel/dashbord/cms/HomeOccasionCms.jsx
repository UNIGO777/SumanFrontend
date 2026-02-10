import { useCallback, useEffect, useMemo, useState } from 'react'
import HomeOccasionSection from '../../../Userpanel/pages/home/sections/HomeOccasionSection.jsx'
import { getApiBase, getJson, putJson } from '../../services/apiClient.js'
import { uploadImage } from '../../services/files.js'

const KEY = 'home-occasion'

const normalizeItems = (items) => {
  const safe = Array.isArray(items) ? items : []
  return safe
    .map((it, idx) => ({
      label: String(it?.label || it?.title || '').trim(),
      imageUrl: String(it?.imageUrl || it?.img || '').trim(),
      href: String(it?.href || '').trim(),
      sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
    }))
    .filter((it) => Boolean(it.label && it.imageUrl))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 20)
}

export default function HomeOccasionCms() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [previewNonce, setPreviewNonce] = useState(0)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState([{ label: '', imageUrl: '', href: '', sortOrder: 0 }])

  const [uploadingIdx, setUploadingIdx] = useState(-1)
  const [localPreviews, setLocalPreviews] = useState({})
  const [isDragActive, setIsDragActive] = useState({})

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

  const removeCard = (idx) => {
    setItems((prev) => {
      if (prev.length <= 1) return [{ label: '', imageUrl: '', href: '', sortOrder: 0 }]
      return prev.filter((_, i) => i !== idx)
    })
    setLocalPreviews((prev) => {
      const next = {}
      Object.entries(prev || {}).forEach(([k, v]) => {
        const i = Number(k)
        if (!Number.isFinite(i)) return
        if (i === idx) {
          safeRevokeUrl(v)
          return
        }
        next[i > idx ? i - 1 : i] = v
      })
      return next
    })
    setIsDragActive((prev) => {
      const next = {}
      Object.entries(prev || {}).forEach(([k, v]) => {
        const i = Number(k)
        if (!Number.isFinite(i)) return
        if (i === idx) return
        next[i > idx ? i - 1 : i] = v
      })
      return next
    })
  }

  const addCard = () => {
    setItems((prev) => {
      if (prev.length >= 20) return prev
      return [...prev, { label: '', imageUrl: '', href: '', sortOrder: prev.length }]
    })
  }

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setStatus('')
      const res = await getJson(`/api/admin/cms/${KEY}`)
      setTitle(String(res?.data?.title || '').trim())
      setDescription(String(res?.data?.description || '').trim())
      const serverItems = normalizeItems(res?.data?.items)
      setItems(serverItems.length ? serverItems : [{ label: '', imageUrl: '', href: '', sortOrder: 0 }])
      setPreviewNonce((v) => v + 1)
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
      const next = { ...prev }
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
        const next = { ...prev }
        safeRevokeUrl(next[idx])
        delete next[idx]
        return next
      })
    }
  }

  const canSave = useMemo(() => uploadingIdx === -1 && normalizeItems(items).length > 0, [items, uploadingIdx])

  const onSave = async () => {
    setError('')
    setStatus('')

    const normalized = normalizeItems(items)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Home Occasion CMS</div>
          <div className="mt-1 text-sm text-gray-600">Manage section title, description, cards, and links</div>
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
              placeholder="Shop by Occasion"
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
              placeholder="Optional"
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
              disabled={loading || uploadingIdx !== -1}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">Cards</div>
            <div className="mt-1 text-xs font-medium text-gray-500">Add up to 20 cards</div>
          </div>
          <button
            type="button"
            onClick={addCard}
            disabled={loading || uploadingIdx !== -1 || items.length >= 20}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 disabled:opacity-60 md:w-auto"
          >
            Add card
          </button>
        </div>

        <div className="mt-5 grid gap-6">
          {items.map((it, idx) => (
            <div key={idx} className="rounded-xl border border-gray-100 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm font-semibold text-gray-900">Card {idx + 1}</div>
                <button
                  type="button"
                  onClick={() => removeCard(idx)}
                  disabled={loading || uploadingIdx !== -1}
                  className="h-9 w-full rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 disabled:opacity-60 md:w-auto"
                >
                  Remove
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-gray-600">Card title</div>
                  <input
                    value={it.label}
                    onChange={(e) => setItemField(idx, 'label', e.target.value)}
                    placeholder="Valentine's Day"
                    className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                    disabled={loading || uploadingIdx !== -1}
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-600">Link (on click)</div>
                  <input
                    value={it.href}
                    onChange={(e) => setItemField(idx, 'href', e.target.value)}
                    placeholder="/search or https://..."
                    className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                    disabled={loading || uploadingIdx !== -1}
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-600">Card image</div>
                  <div
                    className={`mt-2 rounded-xl border-2 border-dashed p-4 transition-colors ${
                      isDragActive[idx] ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'
                    }`}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (loading || uploadingIdx !== -1) return
                      setIsDragActive((prev) => ({ ...prev, [idx]: true }))
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (loading || uploadingIdx !== -1) return
                      setIsDragActive((prev) => ({ ...prev, [idx]: true }))
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (e.currentTarget !== e.target) return
                      setIsDragActive((prev) => ({ ...prev, [idx]: false }))
                    }}
                    onDrop={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDragActive((prev) => ({ ...prev, [idx]: false }))
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
                        htmlFor={`home-occasion-image-${idx}`}
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
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    ) : null}
                  </div>

                  <input
                    id={`home-occasion-image-${idx}`}
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

                <div>
                  <div className="text-xs font-semibold text-gray-600">Sort order</div>
                  <input
                    value={String(it.sortOrder ?? '')}
                    onChange={(e) => setItemField(idx, 'sortOrder', e.target.value)}
                    inputMode="numeric"
                    placeholder={String(idx)}
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
        <HomeOccasionSection key={previewNonce} />
      </div>
    </div>
  )
}

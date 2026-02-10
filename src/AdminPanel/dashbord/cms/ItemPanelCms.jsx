import { useCallback, useEffect, useMemo, useState } from 'react'
import ItemPanel from '../../../Userpanel/components/ItemPanel.jsx'
import { getApiBase, getJson, putJson } from '../../services/apiClient.js'
import { uploadImage } from '../../services/files.js'

const KEY = 'home-item-panel'

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const normalizeItems = (items) => {
  const safe = Array.isArray(items) ? items : []
  return safe
    .map((it, idx) => ({
      label: String(it?.label || '').trim(),
      imageUrl: String(it?.imageUrl || '').trim(),
      href: String(it?.href || '').trim(),
      badgeText: String(it?.badgeText || '').trim(),
      sortOrder: idx,
    }))
    .filter((it) => Boolean(it.imageUrl) && Boolean(it.label))
    .slice(0, 20)
}

export default function ItemPanelCms() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [uploadingId, setUploadingId] = useState('')
  const [localPreviews, setLocalPreviews] = useState({})
  const [isDragActive, setIsDragActive] = useState({})

  const [items, setItems] = useState([{ id: makeId(), label: '', imageUrl: '', href: '', badgeText: '' }])

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

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setStatus('')
      const res = await getJson(`/api/admin/cms/${KEY}`)
      const rows = Array.isArray(res?.data?.items) ? res.data.items : []
      const next = rows
        .map((it) => ({
          id: makeId(),
          label: String(it?.label || '').trim(),
          imageUrl: String(it?.imageUrl || '').trim(),
          href: String(it?.href || '').trim(),
          badgeText: String(it?.badgeText || '').trim(),
        }))
        .filter((it) => Boolean(it.imageUrl))
        .slice(0, 20)
      setItems(next.length ? next : [{ id: makeId(), label: '', imageUrl: '', href: '', badgeText: '' }])
    } catch (e) {
      setError(e?.message || 'Failed to load CMS')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const canSave = useMemo(() => uploadingId === '' && normalizeItems(items).length > 0, [items, uploadingId])

  const setItemField = (id, field, value) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)))
  }

  const setDragActiveById = (id, value) => {
    setIsDragActive((prev) => ({ ...prev, [id]: Boolean(value) }))
  }

  const maxUploadBytes = 5 * 1024 * 1024

  const onSelectImage = async (id, file) => {
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
      safeRevokeUrl(next[id])
      next[id] = previewUrl
      return next
    })

    try {
      setUploadingId(id)
      const res = await uploadImage(file)
      const path = String(res?.path || '').trim()
      if (!path) throw new Error('Upload failed')
      setItemField(id, 'imageUrl', toPublicUrl(path))
    } catch (e) {
      setError(e?.message || 'Failed to upload image')
    } finally {
      setUploadingId('')
      setLocalPreviews((prev) => {
        const next = { ...prev }
        safeRevokeUrl(next[id])
        delete next[id]
        return next
      })
    }
  }

  const onAdd = () => {
    setItems((prev) => [...prev, { id: makeId(), label: '', imageUrl: '', href: '', badgeText: '' }].slice(0, 20))
  }

  const onRemove = (id) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id)
      return next.length ? next : [{ id: makeId(), label: '', imageUrl: '', href: '', badgeText: '' }]
    })
    setLocalPreviews((prev) => {
      const next = { ...prev }
      safeRevokeUrl(next[id])
      delete next[id]
      return next
    })
    setIsDragActive((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const moveItem = (idx, dir) => {
    setItems((prev) => {
      const to = idx + dir
      if (to < 0 || to >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[to]] = [next[to], next[idx]]
      return next
    })
  }

  const onSave = async () => {
    setError('')
    setStatus('')

    const normalized = normalizeItems(items)
    if (!normalized.length) {
      setError('Please add at least 1 item with image and label')
      return
    }

    try {
      setLoading(true)
      await putJson(`/api/admin/cms/${KEY}`, { items: normalized })
      setStatus('Saved')
      await load()
    } catch (e) {
      setError(e?.message || 'Failed to save CMS')
    } finally {
      setLoading(false)
    }
  }

  const previewItems = useMemo(() => normalizeItems(items), [items])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Item Panel CMS</div>
          <div className="mt-1 text-sm text-gray-600">Manage Item Panel cards (image, label, badge, link)</div>
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-gray-900">Items</div>
          <button
            type="button"
            onClick={onAdd}
            disabled={loading || uploadingId !== '' || items.length >= 20}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            Add item
          </button>
        </div>

        <div className="mt-5 grid gap-6">
          {items.map((it, idx) => (
            <div key={it.id} className="rounded-xl border border-gray-100 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold text-gray-900">Item {idx + 1}</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, -1)}
                    disabled={loading || uploadingId !== '' || idx === 0}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 1)}
                    disabled={loading || uploadingId !== '' || idx === items.length - 1}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(it.id)}
                    disabled={loading || uploadingId !== ''}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-gray-600">Label</div>
                  <input
                    value={it.label}
                    onChange={(e) => setItemField(it.id, 'label', e.target.value)}
                    placeholder="Rings"
                    className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                    disabled={loading || uploadingId !== ''}
                  />

                  <div className="mt-4 text-xs font-semibold text-gray-600">Badge text</div>
                  <input
                    value={it.badgeText}
                    onChange={(e) => setItemField(it.id, 'badgeText', e.target.value)}
                    placeholder="Min 60% OFF"
                    className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                    disabled={loading || uploadingId !== ''}
                  />

                  <div className="mt-4 text-xs font-semibold text-gray-600">Link (on click)</div>
                  <input
                    value={it.href}
                    onChange={(e) => setItemField(it.id, 'href', e.target.value)}
                    placeholder="/search or https://..."
                    className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                    disabled={loading || uploadingId !== ''}
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-600">Image</div>
                  <div
                    className={`mt-2 rounded-xl border-2 border-dashed p-4 transition-colors ${
                      isDragActive[it.id] ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'
                    }`}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (loading || uploadingId !== '') return
                      setDragActiveById(it.id, true)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (loading || uploadingId !== '') return
                      setDragActiveById(it.id, true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (e.currentTarget !== e.target) return
                      setDragActiveById(it.id, false)
                    }}
                    onDrop={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDragActiveById(it.id, false)
                      if (loading || uploadingId !== '') return
                      const f = e.dataTransfer?.files?.[0]
                      await onSelectImage(it.id, f)
                    }}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Drag & drop image here</div>
                        <div className="mt-1 text-xs font-medium text-gray-500">PNG, JPG, WEBP, HEIC. Max 5 MB.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (loading || uploadingId !== '') return
                          document.getElementById(`item-panel-image-${it.id}`)?.click()
                        }}
                        disabled={loading || uploadingId !== ''}
                        className="rounded-lg bg-[#0f2e40] px-4 py-2 text-xs font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
                      >
                        {uploadingId === it.id ? 'Uploading...' : 'Browse file'}
                      </button>
                    </div>

                    {localPreviews[it.id] || it.imageUrl ? (
                      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <img
                              src={localPreviews[it.id] || it.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="text-xs font-semibold text-gray-700">Image selected</div>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                          disabled={loading || uploadingId !== ''}
                          onClick={() => setItemField(it.id, 'imageUrl', '')}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-gray-500">No image uploaded</div>
                    )}
                  </div>

                  <input
                    id={`item-panel-image-${it.id}`}
                    type="file"
                    accept="image/*,.heic,.heif,.jfif"
                    className="hidden"
                    disabled={loading || uploadingId !== ''}
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      e.target.value = ''
                      await onSelectImage(it.id, f)
                    }}
                  />

                  <div className="mt-4">
                    <div className="text-xs font-semibold text-gray-600">Image URL</div>
                    <input
                      value={it.imageUrl}
                      onChange={(e) => setItemField(it.id, 'imageUrl', e.target.value)}
                      placeholder="https://..."
                      className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                      disabled={loading || uploadingId !== ''}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-gray-900">Preview</div>
        <ItemPanel autoScroll={false} items={previewItems} />
      </div>
    </div>
  )
}

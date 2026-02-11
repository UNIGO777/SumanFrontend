import { useCallback, useEffect, useMemo, useState } from 'react'
import HomeLatestCollectionsSection from '../../../Userpanel/pages/home/sections/HomeLatestCollectionsSection.jsx'
import { getApiBase, getJson, putJson } from '../../services/apiClient.js'
import { uploadImage } from '../../services/files.js'

const KEY = 'home-latest-collections'

const normalizeThumbs = (thumbImageUrls) => {
  const raw = Array.isArray(thumbImageUrls) ? thumbImageUrls : []
  const normalized = raw
    .map((u) => String(u || '').trim())
    .filter(Boolean)
    .slice(0, 3)
  while (normalized.length < 3) normalized.push('')
  return normalized
}

const normalizeItems = (items) => {
  const safe = Array.isArray(items) ? items : []
  return safe
    .map((it, idx) => ({
      title: String(it?.title || '').trim(),
      subtitle: String(it?.subtitle || '').trim(),
      tag: String(it?.tag || '').trim(),
      imageUrl: String(it?.imageUrl || '').trim(),
      href: String(it?.href || '').trim(),
      sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
      thumbImageUrls: normalizeThumbs(it?.thumbImageUrls),
    }))
    .filter((it) => Boolean(it.imageUrl))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 3)
}

export default function HomeLatestCollectionsCms() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [uploadingKey, setUploadingKey] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [items, setItems] = useState([
    { title: '', subtitle: '', tag: '', imageUrl: '', href: '', sortOrder: 0, thumbImageUrls: ['', '', ''] },
    { title: '', subtitle: '', tag: '', imageUrl: '', href: '', sortOrder: 1, thumbImageUrls: ['', '', ''] },
    { title: '', subtitle: '', tag: '', imageUrl: '', href: '', sortOrder: 2, thumbImageUrls: ['', '', ''] },
  ])

  const [mainPreviews, setMainPreviews] = useState(['', '', ''])
  const [thumbPreviews, setThumbPreviews] = useState([
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
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

  const setThumbField = (cardIdx, thumbIdx, value) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== cardIdx) return it
        const nextThumbs = normalizeThumbs(it?.thumbImageUrls)
        nextThumbs[thumbIdx] = value
        return { ...it, thumbImageUrls: nextThumbs }
      })
    )
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
      while (filled.length < 3) {
        filled.push({
          title: '',
          subtitle: '',
          tag: '',
          imageUrl: '',
          href: '',
          sortOrder: filled.length,
          thumbImageUrls: ['', '', ''],
        })
      }
      setItems(
        filled.slice(0, 3).map((it, idx) => ({
          title: String(it?.title || '').trim(),
          subtitle: String(it?.subtitle || '').trim(),
          tag: String(it?.tag || '').trim(),
          imageUrl: String(it?.imageUrl || '').trim(),
          href: String(it?.href || '').trim(),
          sortOrder: idx,
          thumbImageUrls: normalizeThumbs(it?.thumbImageUrls),
        }))
      )
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

  const onSelectMainImage = async (idx, file) => {
    if (!file) return
    setError('')
    setStatus('')
    if ((file?.size || 0) > maxUploadBytes) {
      setError(`"${file.name}" is larger than 5 MB`)
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setMainPreviews((prev) => {
      const next = [...prev]
      safeRevokeUrl(next[idx])
      next[idx] = previewUrl
      return next
    })

    const key = `main-${idx}`
    try {
      setUploadingKey(key)
      const res = await uploadImage(file)
      const path = String(res?.path || '').trim()
      if (!path) throw new Error('Upload failed')
      setItemField(idx, 'imageUrl', toPublicUrl(path))
    } catch (e) {
      setError(e?.message || 'Failed to upload image')
    } finally {
      setUploadingKey('')
      setMainPreviews((prev) => {
        const next = [...prev]
        safeRevokeUrl(next[idx])
        next[idx] = ''
        return next
      })
    }
  }

  const onSelectThumbImage = async (cardIdx, thumbIdx, file) => {
    if (!file) return
    setError('')
    setStatus('')
    if ((file?.size || 0) > maxUploadBytes) {
      setError(`"${file.name}" is larger than 5 MB`)
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setThumbPreviews((prev) => {
      const next = prev.map((row) => [...row])
      safeRevokeUrl(next[cardIdx]?.[thumbIdx])
      next[cardIdx][thumbIdx] = previewUrl
      return next
    })

    const key = `thumb-${cardIdx}-${thumbIdx}`
    try {
      setUploadingKey(key)
      const res = await uploadImage(file)
      const path = String(res?.path || '').trim()
      if (!path) throw new Error('Upload failed')
      setThumbField(cardIdx, thumbIdx, toPublicUrl(path))
    } catch (e) {
      setError(e?.message || 'Failed to upload image')
    } finally {
      setUploadingKey('')
      setThumbPreviews((prev) => {
        const next = prev.map((row) => [...row])
        safeRevokeUrl(next[cardIdx]?.[thumbIdx])
        next[cardIdx][thumbIdx] = ''
        return next
      })
    }
  }

  const canSave = useMemo(() => uploadingKey === '' && normalizeItems(items).length > 0, [items, uploadingKey])

  const onSave = async () => {
    setError('')
    setStatus('')
    const normalized = normalizeItems(items)
    if (!normalized.length) {
      setError('Please add at least 1 card with main image')
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
        title: String(it?.title || '').trim(),
        subtitle: String(it?.subtitle || '').trim(),
        tag: String(it?.tag || '').trim(),
        imageUrl: String(mainPreviews[idx] || it?.imageUrl || '').trim(),
        href: String(it?.href || '').trim(),
        sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
        thumbImageUrls: normalizeThumbs(it?.thumbImageUrls).map((u, j) => String(thumbPreviews[idx]?.[j] || u || '').trim()),
      })),
    }
  }, [description, items, mainPreviews, thumbPreviews, title])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Home Latest Collections CMS</div>
          <div className="mt-1 text-sm text-gray-600">Manage section title, description, and 3 collection cards</div>
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
              placeholder="Latest Collections"
              className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
              disabled={loading || uploadingKey !== ''}
            />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-gray-600">Section description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Fresh designs, new stories, and styles you’ll want to wear on repeat."
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
              disabled={loading || uploadingKey !== ''}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-8">
          {items.map((it, idx) => (
            <div key={idx} className="rounded-xl border border-gray-100 p-4">
              <div className="mb-3 text-sm font-semibold text-gray-900">Card {idx + 1}</div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-gray-600">Main image</div>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (loading || uploadingKey !== '') return
                        document.getElementById(`home-latest-collections-main-${idx}`)?.click()
                      }}
                      disabled={loading || uploadingKey !== ''}
                      className="rounded-lg bg-[#0f2e40] px-4 py-2 text-xs font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
                    >
                      {uploadingKey === `main-${idx}` ? 'Uploading...' : 'Browse file'}
                    </button>
                    {it.imageUrl ? <div className="text-xs font-semibold text-gray-700">Image selected</div> : <div className="text-xs text-gray-500">No image</div>}
                  </div>

                  {it.imageUrl || mainPreviews[idx] ? (
                    <div className="mt-3 h-28 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <img src={mainPreviews[idx] || it.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  ) : null}

                  <input
                    id={`home-latest-collections-main-${idx}`}
                    type="file"
                    accept="image/*,.heic,.heif,.jfif"
                    className="hidden"
                    disabled={loading || uploadingKey !== ''}
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      e.target.value = ''
                      await onSelectMainImage(idx, f)
                    }}
                  />

                  <div className="mt-4">
                    <div className="text-xs font-semibold text-gray-600">Main image URL</div>
                    <input
                      value={it.imageUrl}
                      onChange={(e) => setItemField(idx, 'imageUrl', e.target.value)}
                      placeholder="https://..."
                      className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                      disabled={loading || uploadingKey !== ''}
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-600">Heading</div>
                    <input
                      value={it.title}
                      onChange={(e) => setItemField(idx, 'title', e.target.value)}
                      placeholder="FRESH DROP!"
                      className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                      disabled={loading || uploadingKey !== ''}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600">Sub heading</div>
                    <input
                      value={it.subtitle}
                      onChange={(e) => setItemField(idx, 'subtitle', e.target.value)}
                      placeholder="Shiny & New Arrivals"
                      className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                      disabled={loading || uploadingKey !== ''}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600">Tag</div>
                    <input
                      value={it.tag}
                      onChange={(e) => setItemField(idx, 'tag', e.target.value)}
                      placeholder="Only at GIVA"
                      className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                      disabled={loading || uploadingKey !== ''}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600">Link (on click)</div>
                    <input
                      value={it.href}
                      onChange={(e) => setItemField(idx, 'href', e.target.value)}
                      placeholder="/search or https://..."
                      className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                      disabled={loading || uploadingKey !== ''}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-xs font-semibold text-gray-600">Bottom 3 thumbnails</div>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  {normalizeThumbs(it.thumbImageUrls).map((thumbUrl, tIdx) => (
                    <div key={tIdx} className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-gray-700">Thumb {tIdx + 1}</div>
                        <button
                          type="button"
                          onClick={() => {
                            if (loading || uploadingKey !== '') return
                            document.getElementById(`home-latest-collections-thumb-${idx}-${tIdx}`)?.click()
                          }}
                          disabled={loading || uploadingKey !== ''}
                          className="rounded-lg bg-[#0f2e40] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
                        >
                          {uploadingKey === `thumb-${idx}-${tIdx}` ? 'Uploading...' : 'Browse'}
                        </button>
                      </div>

                      {thumbUrl || thumbPreviews[idx]?.[tIdx] ? (
                        <div className="mt-3 h-24 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                          <img
                            src={thumbPreviews[idx]?.[tIdx] || thumbUrl}
                            alt=""
                            className="h-full w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="mt-3 text-xs text-gray-500">No image</div>
                      )}

                      <input
                        id={`home-latest-collections-thumb-${idx}-${tIdx}`}
                        type="file"
                        accept="image/*,.heic,.heif,.jfif"
                        className="hidden"
                        disabled={loading || uploadingKey !== ''}
                        onChange={async (e) => {
                          const f = e.target.files?.[0]
                          e.target.value = ''
                          await onSelectThumbImage(idx, tIdx, f)
                        }}
                      />

                      <div className="mt-3">
                        <div className="text-[11px] font-semibold text-gray-600">Thumb URL</div>
                        <input
                          value={thumbUrl}
                          onChange={(e) => setThumbField(idx, tIdx, e.target.value)}
                          placeholder="https://..."
                          className="mt-2 h-9 w-full rounded-lg border border-gray-200 px-3 text-xs outline-none focus:border-gray-300"
                          disabled={loading || uploadingKey !== ''}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-gray-900">Preview</div>
        <HomeLatestCollectionsSection cmsData={previewCms} />
      </div>
    </div>
  )
}


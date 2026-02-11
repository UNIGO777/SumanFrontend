import { useCallback, useEffect, useMemo, useState } from 'react'
import HomeInternationalShippingBanner from '../../../Userpanel/pages/home/sections/HomeInternationalShippingBanner.jsx'
import { getApiBase, getJson, putJson } from '../../services/apiClient.js'
import { uploadImage } from '../../services/files.js'

const KEY = 'home-international-shipping'

const normalizeItem = (items) => {
  const safe = Array.isArray(items) ? items : []
  const first = safe
    .map((it) => ({
      imageUrl: String(it?.imageUrl || '').trim(),
      href: String(it?.href || '').trim(),
      sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : 0,
    }))
    .filter((it) => Boolean(it.imageUrl))
    .sort((a, b) => a.sortOrder - b.sortOrder)[0]
  return first || { imageUrl: '', href: '', sortOrder: 0 }
}

export default function HomeInternationalShippingCms() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [item, setItem] = useState({ imageUrl: '', href: '', sortOrder: 0 })

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
      const res = await getJson(`/api/admin/cms/${KEY}`, undefined, { noCache: true })
      setTitle(String(res?.data?.title || '').trim())
      setDescription(String(res?.data?.description || '').trim())
      setItem(normalizeItem(res?.data?.items))
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

  const onSelectImage = async (file) => {
    if (!file) return
    setError('')
    setStatus('')
    if ((file?.size || 0) > maxUploadBytes) {
      setError(`"${file.name}" is larger than 5 MB`)
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setLocalPreview((prev) => {
      safeRevokeUrl(prev)
      return previewUrl
    })

    try {
      setUploading(true)
      const res = await uploadImage(file)
      const path = String(res?.path || '').trim()
      if (!path) throw new Error('Upload failed')
      setItem((prev) => ({ ...prev, imageUrl: toPublicUrl(path) }))
    } catch (e) {
      setError(e?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
      setLocalPreview((prev) => {
        safeRevokeUrl(prev)
        return ''
      })
    }
  }

  const canSave = useMemo(() => !loading && !uploading && Boolean(String(item?.imageUrl || '').trim()), [item?.imageUrl, loading, uploading])

  const onSave = async () => {
    setError('')
    setStatus('')
    const imageUrl = String(item?.imageUrl || '').trim()
    if (!imageUrl) {
      setError('Please upload an image')
      return
    }

    try {
      setLoading(true)
      await putJson(`/api/admin/cms/${KEY}`, {
        title: String(title || '').trim(),
        description: String(description || '').trim(),
        items: [{ imageUrl, href: String(item?.href || '').trim(), sortOrder: 0 }],
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
      items: [
        {
          imageUrl: String(localPreview || item?.imageUrl || '').trim(),
          href: String(item?.href || '').trim(),
          sortOrder: 0,
        },
      ],
    }
  }, [description, item?.href, item?.imageUrl, localPreview, title])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Home International Shipping CMS</div>
          <div className="mt-1 text-sm text-gray-600">Manage title, description and banner image</div>
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
            disabled={!canSave}
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
              placeholder="International Shipping"
              className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
              disabled={loading || uploading}
            />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-gray-600">Section description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Send love across borders with secure packaging and reliable delivery."
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
              disabled={loading || uploading}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-gray-600">Banner image</div>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (loading || uploading) return
                  document.getElementById('home-international-shipping-image')?.click()
                }}
                disabled={loading || uploading}
                className="rounded-lg bg-[#0f2e40] px-4 py-2 text-xs font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
              >
                {uploading ? 'Uploading...' : 'Browse file'}
              </button>
              {item.imageUrl ? <div className="text-xs font-semibold text-gray-700">Image selected</div> : <div className="text-xs text-gray-500">No image</div>}
            </div>

            {localPreview || item.imageUrl ? (
              <div className="mt-3 h-32 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img src={localPreview || item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ) : null}

            <input
              id="home-international-shipping-image"
              type="file"
              accept="image/*,.heic,.heif,.jfif"
              className="hidden"
              disabled={loading || uploading}
              onChange={async (e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                await onSelectImage(f)
              }}
            />

            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-600">Image URL</div>
              <input
                value={item.imageUrl}
                onChange={(e) => setItem((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                disabled={loading || uploading}
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">Link (on click)</div>
            <input
              value={item.href}
              onChange={(e) => setItem((prev) => ({ ...prev, href: e.target.value }))}
              placeholder="/search or https://..."
              className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
              disabled={loading || uploading}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-gray-900">Preview</div>
        <HomeInternationalShippingBanner cmsData={previewCms} fullBleed={false} />
      </div>
    </div>
  )
}

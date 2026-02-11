import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../../AdminPanel/services/apiClient.js'

export default function RecipientPanel({
  title: titleProp = '',
  description: descriptionProp = '',
  items: itemsProp,
}) {
  const [cms, setCms] = useState(null)
  const hasOverride = Array.isArray(itemsProp) && itemsProp.length > 0
  const hasTitleOverride = String(titleProp || '').trim().length > 0
  const hasDescriptionOverride = String(descriptionProp || '').trim().length > 0
  const [loading, setLoading] = useState(!(hasOverride && hasTitleOverride && hasDescriptionOverride))
  const [loaded, setLoaded] = useState(hasOverride && hasTitleOverride && hasDescriptionOverride)

  useEffect(() => {
    if (hasOverride && hasTitleOverride && hasDescriptionOverride) return

    let active = true
    getJson('/api/cms/home-recipient-panel')
      .then((res) => {
        if (!active) return
        setCms(res?.data || null)
      })
      .catch(() => {
        if (!active) return
        setCms(null)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
        setLoaded(true)
      })

    return () => {
      active = false
    }
  }, [hasDescriptionOverride, hasOverride, hasTitleOverride, itemsProp, titleProp, descriptionProp])

  const title = useMemo(() => {
    const fromCms = String(cms?.title || '').trim()
    const fromProp = String(titleProp || '').trim()
    return fromCms || fromProp
  }, [cms, titleProp])

  const description = useMemo(() => {
    const fromCms = String(cms?.description || '').trim()
    const fromProp = String(descriptionProp || '').trim()
    return fromCms || fromProp
  }, [cms, descriptionProp])

  const items = useMemo(() => {
    const override = Array.isArray(itemsProp) ? itemsProp : []
    const cmsItems = Array.isArray(cms?.items) ? cms.items : []
    const source = override.length ? override : cmsItems

    const normalized = source
      .map((it, idx) => ({
        label: String(it?.label || '').trim(),
        imageUrl: String(it?.imageUrl || it?.img || '').trim(),
        href: String(it?.href || '').trim(),
        sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
      }))
      .filter((it) => Boolean(it.imageUrl) && Boolean(it.label))
      .sort((a, b) => a.sortOrder - b.sortOrder)

    return normalized.slice(0, 2)
  }, [cms, itemsProp])

  if (loading && !loaded) {
    return (
      <section className="w-full animate-pulse">
        <div className="mb-3 flex justify-center">
          <div className="h-10 w-64 rounded bg-gray-200 sm:h-12 md:h-14" />
        </div>
        <div className="mb-6 flex justify-center">
          <div className="h-5 w-96 rounded bg-gray-200" />
        </div>
        <div className="mx-auto grid max-w-[94vw] grid-cols-1 gap-8 sm:max-w-[80vw] sm:grid-cols-2 sm:gap-10">
          {[0, 1].map((k) => (
            <div key={k} className="relative overflow-hidden rounded-[44px] bg-gray-100 ring-1 ring-gray-200">
              <div className="h-[240px] w-full bg-gray-200 sm:h-[320px]" />
              <div className="px-4 pb-6">
                <div className="mx-auto mt-5 h-7 w-40 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (!items.length) return null
  if (!title) return null

  return (
    <section className="w-full">
      <div className="mb-3 text-center text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">{title}</div>
      {description ? <div className="mb-6 text-center text-xs font-medium text-gray-600 sm:text-sm md:text-base">{description}</div> : null}
      <div className="mx-auto grid max-w-[94vw] grid-cols-1 gap-8 sm:max-w-[80vw] sm:grid-cols-2 sm:gap-10">
        {items.map((it) => (
          <Link
            key={it.label}
            to={it.href}
            className="relative block overflow-hidden rounded-[44px]"
          >
            <div className="flex items-end justify-center px-4 pt-4 sm:px-6 sm:pt-6">
              <img src={it.imageUrl} alt={it.label} className="h-full w-full object-contain" loading="lazy" />
            </div>
            <div>
              <h2 className="mt-5 text-center text-lg font-semibold text-black sm:text-xl md:text-2xl">{it.label}</h2>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

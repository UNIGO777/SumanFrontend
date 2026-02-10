import { useEffect, useMemo, useState } from 'react'
import recipientLeft from '../../assets/ShopByRecipient Left.png'
import recipientRight from '../../assets/Shop By Recipient Right.png'
import { Link } from 'react-router-dom'
import { getJson } from '../../AdminPanel/services/apiClient.js'

export default function RecipientPanel({
  title: titleProp = 'Shop By Recipient',
  description: descriptionProp = "Find the perfect gift for your loved one, whether it's a special occasion or a regular gift.",
  items: itemsProp,
}) {
  const [cms, setCms] = useState(null)

  useEffect(() => {
    const hasOverride = Array.isArray(itemsProp) && itemsProp.length > 0
    const hasTitleOverride = String(titleProp || '').trim().length > 0
    const hasDescriptionOverride = String(descriptionProp || '').trim().length > 0
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

    return () => {
      active = false
    }
  }, [descriptionProp, itemsProp, titleProp])

  const fallbackItems = useMemo(
    () => [
      {
        label: 'Gifts for Him',
        imageUrl: recipientLeft,
        href: '/search/gifts-for-him',
      },
      {
        label: 'Gifts for Her',
        imageUrl: recipientRight,
        href: '/search/gifts-for-her',
      },
    ],
    []
  )

  const title = useMemo(() => {
    const fromCms = String(cms?.title || '').trim()
    return fromCms || titleProp
  }, [cms, titleProp])

  const description = useMemo(() => {
    const fromCms = String(cms?.description || '').trim()
    return fromCms || descriptionProp
  }, [cms, descriptionProp])

  const items = useMemo(() => {
    const override = Array.isArray(itemsProp) ? itemsProp : []
    const cmsItems = Array.isArray(cms?.items) ? cms.items : []
    const source = override.length ? override : cmsItems.length ? cmsItems : fallbackItems

    const normalized = source
      .map((it, idx) => ({
        label: String(it?.label || '').trim(),
        imageUrl: String(it?.imageUrl || it?.img || '').trim(),
        href: String(it?.href || '').trim(),
        sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
      }))
      .filter((it) => Boolean(it.imageUrl) && Boolean(it.label))
      .sort((a, b) => a.sortOrder - b.sortOrder)

    if (normalized.length >= 2) return normalized.slice(0, 2)
    if (normalized.length) return [...normalized, ...fallbackItems.slice(normalized.length)]
    return fallbackItems
  }, [cms, fallbackItems, itemsProp])

  return (
    <section className="w-full">
      <div className="mb-3 text-center text-4xl font-bold text-gray-900">{title}</div>
      {description ? <div className="mb-6 text-center text-sm font-medium text-gray-600">{description}</div> : null}
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
              <h2 className="mt-5 text-center text-2xl font-semibold text-black">{it.label}</h2>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

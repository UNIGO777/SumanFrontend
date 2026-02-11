import heroBanner from '../../../../assets/2048 × 626.jpg'
import promoBanner1 from '../../../../assets/1312 × 668.jpg'
import promoBanner2 from '../../../../assets/1312 × 668-2.jpg'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'

export default function HomeHeroPromos({ cmsData }) {
  const [cms, setCms] = useState(null)
  const cmsEffective = cmsData || cms

  useEffect(() => {
    if (cmsData) return
    let active = true
    getJson('/api/cms/home-hero-promos')
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
  }, [cmsData])

  const items = useMemo(() => {
    const fallback = [
      { imageUrl: heroBanner, href: '' },
      { imageUrl: promoBanner1, href: '', badgeText: 'Upto 80% OFF' },
      { imageUrl: promoBanner2, href: '', badgeText: 'BOGO - Buy 1 Get 1' },
    ]
    const rows = Array.isArray(cmsEffective?.items) ? cmsEffective.items : []
    const normalized = rows
      .map((it) => ({
        imageUrl: String(it?.imageUrl || '').trim(),
        href: String(it?.href || '').trim(),
        badgeText: String(it?.badgeText || '').trim(),
        sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : 0,
      }))
      .filter((it) => Boolean(it.imageUrl))
      .sort((a, b) => a.sortOrder - b.sortOrder)

    if (normalized.length >= 3) return normalized.slice(0, 3)
    if (normalized.length) return [...normalized, ...fallback.slice(normalized.length)]
    return fallback
  }, [cmsEffective])

  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-[50px] bg-gray-100">
        {items[0]?.href ? (
          <Link to={items[0].href} className="block">
            <img src={items[0].imageUrl} alt="Promo banner" className="h-full w-full object-contain " loading="lazy" />
          </Link>
        ) : (
          <img src={items[0]?.imageUrl || heroBanner} alt="Promo banner" className="h-full w-full object-contain " loading="lazy" />
        )}
        <div className="pointer-events-none absolute inset-0" />
        <div className="absolute left-5 top-1/2 w-[90%] -translate-y-1/2 sm:left-8 sm:w-[70%]"></div>
      </div>

      <div className="grid grid-cols-1 gap-5 mx-auto max-w-[100vw] sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-[50px] bg-gray-100">
          {items[1]?.href ? (
            <Link to={items[1].href} className="block">
              <img
                src={items[1].imageUrl}
                alt="Promo card 2"
                className="h-[350px] w-full object-fill"
                loading="lazy"
              />
            </Link>
          ) : (
            <img
              src={items[1]?.imageUrl || promoBanner1}
              alt="Promo card 2"
              className="h-[350px] w-full object-fill"
              loading="lazy"
            />
          )}
          <div className="pointer-events-none absolute inset-0 " />
          {items[1]?.badgeText ? (
            <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-gray-900">
              {items[1].badgeText}
            </div>
          ) : null}
        </div>

        <div className="relative overflow-hidden rounded-[50px] bg-gray-100">
          {items[2]?.href ? (
            <Link to={items[2].href} className="block">
              <img src={items[2].imageUrl} alt="Promo card 1" className="h-[350px] w-full object-fill" loading="lazy" />
            </Link>
          ) : (
            <img
              src={items[2]?.imageUrl || promoBanner2}
              alt="Promo card 1"
              className="h-[350px] w-full object-fill"
              loading="lazy"
            />
          )}
          <div className="pointer-events-none absolute inset-0 " />
          {items[2]?.badgeText ? (
            <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-gray-900">
              {items[2].badgeText}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

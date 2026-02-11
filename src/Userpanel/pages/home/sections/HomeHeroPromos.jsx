import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'

export default function HomeHeroPromos({ cmsData }) {
  const [cms, setCms] = useState(null)
  const cmsEffective = cmsData || cms
  const [loading, setLoading] = useState(!cmsData)
  const [loaded, setLoaded] = useState(Boolean(cmsData))
  const scrolledToTopRef = useRef(false)
  const location = useLocation()

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
      .finally(() => {
        if (!active) return
        setLoading(false)
        setLoaded(true)
      })
    return () => {
      active = false
    }
  }, [cmsData])

  useEffect(() => {
    if (scrolledToTopRef.current) return
    if (cmsData) return
    if (String(location?.pathname || '').startsWith('/admin')) return
    if (typeof window === 'undefined') return
    scrolledToTopRef.current = true
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }, [cmsData, location?.pathname])

  const items = useMemo(() => {
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

    return normalized.slice(0, 3)
  }, [cmsEffective])

  if (loading && !loaded) {
    return (
      <section className="space-y-4 animate-pulse">
        <div className="relative aspect-[2048/626] w-full overflow-hidden rounded-[50px] bg-gray-100">
          <div className="absolute inset-0 bg-gray-200" />
        </div>

        <div className="mx-auto grid max-w-[100vw] grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="relative h-[350px] overflow-hidden rounded-[50px] bg-gray-100">
            <div className="absolute inset-0 bg-gray-200" />
            <div className="absolute bottom-4 left-4 h-7 w-32 rounded-full bg-gray-100" />
          </div>
          <div className="relative h-[350px] overflow-hidden rounded-[50px] bg-gray-100">
            <div className="absolute inset-0 bg-gray-200" />
            <div className="absolute bottom-4 left-4 h-7 w-32 rounded-full bg-gray-100" />
          </div>
        </div>
      </section>
    )
  }

  if (!items.length) return null

  return (
    <section className="space-y-4">
      <div className="relative aspect-[2048/626] w-full overflow-hidden rounded-[50px] bg-gray-100">
        {items[0]?.href ? (
          <Link to={items[0].href} className="block">
            <img src={items[0].imageUrl} alt="Promo banner" className="h-full w-full object-contain" loading="eager" />
          </Link>
        ) : (
          <img src={items[0]?.imageUrl} alt="Promo banner" className="h-full w-full object-contain" loading="eager" />
        )}
        <div className="pointer-events-none absolute inset-0" />
        <div className="absolute left-5 top-1/2 w-[90%] -translate-y-1/2 sm:left-8 sm:w-[70%]"></div>
      </div>

      {items.length > 1 ? (
        <div className="mx-auto grid max-w-[100vw] grid-cols-1 gap-5 sm:grid-cols-2">
          {items[1] ? (
            <div className="relative overflow-hidden rounded-[50px] bg-gray-100">
              {items[1]?.href ? (
                <Link to={items[1].href} className="block">
                  <img src={items[1].imageUrl} alt="Promo card 2" className="h-[350px] w-full object-fill" loading="lazy" />
                </Link>
              ) : (
                <img src={items[1].imageUrl} alt="Promo card 2" className="h-[350px] w-full object-fill" loading="lazy" />
              )}
              <div className="pointer-events-none absolute inset-0 " />
              {items[1]?.badgeText ? (
                <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-2 text-[10px] font-bold text-gray-900 sm:text-xs md:text-sm">
                  {items[1].badgeText}
                </div>
              ) : null}
            </div>
          ) : null}

          {items[2] ? (
            <div className="relative overflow-hidden rounded-[50px] bg-gray-100">
              {items[2]?.href ? (
                <Link to={items[2].href} className="block">
                  <img src={items[2].imageUrl} alt="Promo card 1" className="h-[350px] w-full object-fill" loading="lazy" />
                </Link>
              ) : (
                <img src={items[2].imageUrl} alt="Promo card 1" className="h-[350px] w-full object-fill" loading="lazy" />
              )}
              <div className="pointer-events-none absolute inset-0 " />
              {items[2]?.badgeText ? (
                <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-2 text-[10px] font-bold text-gray-900 sm:text-xs md:text-sm">
                  {items[2].badgeText}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

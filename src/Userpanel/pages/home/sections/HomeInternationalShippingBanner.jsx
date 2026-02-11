import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'

export default function HomeInternationalShippingBanner({ cmsData, fullBleed = true }) {
  const [cms, setCms] = useState(null)
  const cmsEffective = cmsData || cms
  const [loading, setLoading] = useState(!cmsData)
  const [loaded, setLoaded] = useState(Boolean(cmsData))

  useEffect(() => {
    if (cmsData) return
    let active = true
    getJson('/api/cms/home-international-shipping')
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

  const banner = useMemo(() => {
    const rows = Array.isArray(cmsEffective?.items) ? cmsEffective.items : []
    const first = rows
      .map((it) => ({
        imageUrl: String(it?.imageUrl || '').trim(),
        href: String(it?.href || '').trim(),
        sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : 0,
      }))
      .filter((it) => Boolean(it.imageUrl))
      .sort((a, b) => a.sortOrder - b.sortOrder)[0]
    return first || null
  }, [cmsEffective])

  const sectionTitle = String(cmsEffective?.title || '').trim()
  const sectionDescription = String(cmsEffective?.description || '').trim()

  if (loading && !loaded) {
    return (
      <div className="mt-10 animate-pulse">
        <section className="w-full">
          <div className="mx-auto mb-6 max-w-[92vw] text-center">
            <div className="mx-auto h-9 w-64 rounded bg-gray-200 sm:h-10 md:h-12" />
            <div className="mx-auto mt-2 h-4 w-96 rounded bg-gray-200 sm:h-5" />
          </div>

          <div className={fullBleed ? 'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden' : 'overflow-hidden'}>
            <div className={fullBleed ? 'mx-auto w-full max-w-[92vw] md:max-w-none' : 'w-full'}>
              <div className="h-[220px] w-full bg-gray-200 sm:h-[280px] md:h-[440px]" />
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!banner?.imageUrl) return null

  return (
    <div className="mt-10">
      <section className="w-full">
        <div className="mx-auto mb-6 max-w-[92vw] text-center">
          {sectionTitle ? <div className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">{sectionTitle}</div> : null}
          {sectionDescription ? (
            <div className="mt-2 text-xs font-semibold text-gray-600 sm:text-sm md:text-base">{sectionDescription}</div>
          ) : null}
        </div>

        <div className={fullBleed ? 'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden' : 'overflow-hidden'}>
          <div className={fullBleed ? 'mx-auto w-full max-w-[92vw] md:max-w-none' : 'w-full'}>
            <div className="relative overflow-hidden bg-gray-100 ring-1 ring-gray-200 ">
              {banner.href ? (
                <Link to={banner.href} className="block">
                  <img
                    src={banner.imageUrl}
                    alt="International shipping"
                    className="h-[220px] w-full object-fill cursor-pointer sm:h-[280px] md:h-[440px]"
                    loading="lazy"
                  />
                </Link>
              ) : (
                <img
                  src={banner.imageUrl}
                  alt="International shipping"
                  className="h-[220px] w-full object-fill cursor-pointer sm:h-[280px] md:h-[440px]"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

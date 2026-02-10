import shippingBanner from '../../../../assets/2048 × 626-2.jpg'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'

export default function HomeInternationalShippingBanner() {
  const [cms, setCms] = useState(null)

  useEffect(() => {
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
    return () => {
      active = false
    }
  }, [])

  const banner = useMemo(() => {
    const rows = Array.isArray(cms?.items) ? cms.items : []
    const first = rows
      .map((it) => ({
        imageUrl: String(it?.imageUrl || '').trim(),
        href: String(it?.href || '').trim(),
        sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : 0,
      }))
      .filter((it) => Boolean(it.imageUrl))
      .sort((a, b) => a.sortOrder - b.sortOrder)[0]
    return first || { imageUrl: shippingBanner, href: '' }
  }, [cms])

  const sectionTitle = (cms?.title || '').trim() || 'International Shipping'
  const sectionDescription =
    (cms?.description || '').trim() || 'Send love across borders with secure packaging and reliable delivery.'

  return (
    <div className="mt-10">
      <section className="w-full">
        <div className="mx-auto mb-6 max-w-[92vw] text-center">
          <div className="text-3xl font-bold text-gray-900">{sectionTitle}</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">{sectionDescription}</div>
        </div>

        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
          <div className="mx-auto w-full max-w-[92vw] md:max-w-none">
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

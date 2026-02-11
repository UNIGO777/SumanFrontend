import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'

export default function HomeLatestCollectionsSection({ cmsData }) {
  const [cms, setCms] = useState(null)
  const cmsEffective = cmsData || cms
  const [loading, setLoading] = useState(!cmsData)
  const [loaded, setLoaded] = useState(Boolean(cmsData))

  useEffect(() => {
    if (cmsData) return
    let active = true
    getJson('/api/cms/home-latest-collections')
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

  const latestCollections = useMemo(() => {
    const rows = Array.isArray(cmsEffective?.items) ? cmsEffective.items : []
    const normalized = rows
      .map((it, idx) => {
        const thumbs = Array.isArray(it?.thumbImageUrls) ? it.thumbImageUrls : []
        const sortOrder = Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx
        return {
          id: `cms-lc-${idx}`,
          title: String(it?.title || '').trim(),
          subtitle: String(it?.subtitle || '').trim(),
          tag: String(it?.tag || '').trim(),
          img: String(it?.imageUrl || '').trim(),
          href: String(it?.href || '').trim(),
          sortOrder,
          items: thumbs
            .filter(Boolean)
            .slice(0, 3)
            .map((url, i) => ({ img: String(url), id: `${idx}-${i}` })),
        }
      })
      .filter((it) => Boolean(it.img))
      .sort((a, b) => a.sortOrder - b.sortOrder)

    return normalized.slice(0, 3)
  }, [cmsEffective])

  const sectionTitle = String(cmsEffective?.title || '').trim()
  const sectionDescription = String(cmsEffective?.description || '').trim()

  if (loading && !loaded) {
    return (
      <div className="mt-10 sm:mt-12 md:mt-14 animate-pulse">
        <section className="relative w-full">
          <div className="mb-6 px-2 text-center sm:px-0">
            <div className="mx-auto h-9 w-64 rounded bg-gray-200 sm:h-10 md:h-12" />
            <div className="mx-auto mt-2 h-4 w-96 rounded bg-gray-200 sm:h-5" />
          </div>

          <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 py-2 sm:gap-6 sm:px-4 md:gap-8 md:px-10">
            {[0, 1, 2].map((k) => (
              <div key={k} className="shrink-0 snap-center">
                <div className="relative w-[86vw] max-w-[700px] pb-24 sm:w-[72vw] sm:pb-24 md:w-[620px] md:pb-20 lg:w-[700px]">
                  <div className="relative h-[200px] overflow-hidden rounded-[32px] bg-gray-200 sm:h-[240px] sm:rounded-[44px] md:h-[300px]" />
                  <div className="absolute bottom-2 left-1/2 flex -translate-y-9 -translate-x-1/2 items-center gap-2 sm:-translate-y-12 sm:gap-4 md:-translate-y-14 md:gap-5">
                    {[0, 1, 2].map((t) => (
                      <div
                        key={t}
                        className="h-[82px] w-[82px] overflow-hidden rounded-2xl bg-gray-200 ring-1 ring-gray-200 sm:h-[96px] sm:w-[96px] sm:rounded-3xl md:h-[120px] md:w-[120px]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (!latestCollections.length) return null

  return (
    <div className="mt-10 sm:mt-12 md:mt-14">
      <section className="relative w-full">
        <div className="mb-6 px-2 text-center sm:px-0">
          {sectionTitle ? <div className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">{sectionTitle}</div> : null}
          {sectionDescription ? (
            <div className="mt-2 text-xs font-semibold text-gray-600 sm:text-sm md:text-base">{sectionDescription}</div>
          ) : null}
        </div>

        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 py-2 sm:gap-6 sm:px-4 md:gap-8 md:px-10">
          {latestCollections.map((c) => (
            <div key={c.id} className="shrink-0 snap-center">
              <div className={`relative w-[86vw] max-w-[700px] ${c.items.length ? 'pb-24 sm:pb-24 md:pb-20' : 'pb-4'} sm:w-[72vw] md:w-[620px] lg:w-[700px]`}>
                <div className="relative h-[200px] overflow-hidden rounded-[32px] bg-gray-100 ring-1 ring-gray-200 sm:h-[240px] sm:rounded-[44px] md:h-[300px]">
                  {c.href ? (
                    <Link to={c.href} className="block h-full w-full">
                      <img src={c.img} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />
                      <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-left text-white sm:left-8 md:left-10">
                        <div className="text-2xl font-bold tracking-wide sm:text-3xl md:text-4xl">{c.title}</div>
                        <div className="mt-2 text-xs font-medium text-white/90 sm:text-sm">{c.subtitle}</div>
                        <div className="mt-1 text-xs font-bold italic text-white/85 sm:text-sm">{c.tag}</div>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <img src={c.img} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />

                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-left text-white sm:left-8 md:left-10">
                        <div className="text-2xl font-bold tracking-wide sm:text-3xl md:text-4xl">{c.title}</div>
                        <div className="mt-2 text-xs font-medium text-white/90 sm:text-sm">{c.subtitle}</div>
                        <div className="mt-1 text-xs font-bold italic text-white/85 sm:text-sm">{c.tag}</div>
                      </div>
                    </>
                  )}
                </div>

                {c.items.length ? (
                  <div className="absolute bottom-2 left-1/2 flex -translate-y-9 -translate-x-1/2 items-center gap-2 sm:-translate-y-12 sm:gap-4 md:-translate-y-14 md:gap-5">
                    {c.items.map((it, idx) => (
                      <div
                        key={it.id || `${c.id}-${idx}`}
                        className="grid h-[82px] w-[82px] place-items-center overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-200 sm:h-[96px] sm:w-[96px] sm:rounded-3xl md:h-[120px] md:w-[120px]"
                      >
                        <img src={it.img} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

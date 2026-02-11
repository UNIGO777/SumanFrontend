import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'

export default function HomeEssentialsSection({ cmsData }) {
  const [cms, setCms] = useState(null)
  const cmsEffective = cmsData || cms
  const [loading, setLoading] = useState(!cmsData)
  const [loaded, setLoaded] = useState(Boolean(cmsData))

  useEffect(() => {
    if (cmsData) return
    let active = true
    getJson('/api/cms/home-essentials')
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

  const sectionTitle = String(cmsEffective?.title || '').trim()
  const sectionDescription = String(cmsEffective?.description || '').trim()

  const cards = useMemo(() => {
    const rows = Array.isArray(cmsEffective?.items) ? cmsEffective.items : []
    const normalized = rows
      .map((it, idx) => ({
        label: String(it?.label || '').trim(),
        img: String(it?.imageUrl || '').trim(),
        href: String(it?.href || '').trim(),
        sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
      }))
      .filter((it) => Boolean(it.label && it.img))
      .sort((a, b) => a.sortOrder - b.sortOrder)

    return normalized.slice(0, 3)
  }, [cmsEffective])

  if (loading && !loaded) {
    return (
      <div className="mt-12 animate-pulse">
        <section className="w-full">
          <div className="mb-6 text-center">
            <div className="mx-auto h-9 w-72 rounded bg-gray-200 sm:h-10 md:h-12" />
            <div className="mx-auto mt-2 h-4 w-96 rounded bg-gray-200 sm:h-5" />
          </div>

          <div className="mx-auto flex max-w-[95vw] flex-col gap-8 md:flex-row">
            {[0, 1, 2].map((k) => (
              <div key={k} className={k === 2 ? 'md:flex-1' : 'md:w-[330px]'}>
                <div className="relative h-[260px] overflow-hidden rounded-[40px] bg-gray-200" />
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (!cards.length) return null

  return (
    <div className="mt-12">
      <section className="w-full">
        <div className="mb-6 text-center">
          {sectionTitle ? <div className="text-2xl font-bold text-[#0f2e40] sm:text-3xl md:text-4xl">{sectionTitle}</div> : null}
          {sectionDescription ? (
            <div className="mt-2 text-xs font-semibold text-gray-600 sm:text-sm md:text-base">{sectionDescription}</div>
          ) : null}
        </div>

        <div className="mx-auto flex max-w-[95vw] flex-col gap-8 md:flex-row">
          {cards.map((it, idx) => {
            const className = idx === 2 ? 'md:flex-1' : 'md:w-[330px]'
            const inner = (
              <div className="relative h-[260px] overflow-hidden rounded-[40px] bg-gray-100 shadow-lg ring-1 ring-[#0f2e40]/15">
                <img src={it.img} alt={it.label} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0f2e40]/70 to-transparent" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-bold text-white sm:text-base">
                  {it.label}
                </div>
              </div>
            )

            return (
              <div key={`${it.label}-${idx}`} className={className}>
                {it.href ? (
                  <Link to={it.href} className="block">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

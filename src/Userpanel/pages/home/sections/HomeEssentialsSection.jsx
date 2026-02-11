import essentialImg1 from '../../../../assets/1312 × 668-6.jpg'
import essentialImg2 from '../../../../assets/1312 × 668-7.jpg'
import essentialImg3 from '../../../../assets/1312 × 668-8.jpg'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'

export default function HomeEssentialsSection({ cmsData }) {
  const [cms, setCms] = useState(null)
  const cmsEffective = cmsData || cms

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
    return () => {
      active = false
    }
  }, [cmsData])

  const sectionTitle = (cmsEffective?.title || '').trim() || '2026 Jewellery Essentials'
  const sectionDescription =
    (cmsEffective?.description || '').trim() || 'Everyday staples designed to match your mood, your outfit, and your moment.'

  const cards = useMemo(() => {
    const fallback = [
      { label: 'Timeless Pearls', img: essentialImg1, href: '', sortOrder: 0 },
      { label: 'Stackable Collection', img: essentialImg2, href: '', sortOrder: 1 },
      { label: 'Emerging Trends', img: essentialImg3, href: '', sortOrder: 2 },
    ]

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

    if (normalized.length >= 3) return normalized.slice(0, 3)
    if (normalized.length) return [...normalized, ...fallback.slice(normalized.length)]
    return fallback
  }, [cmsEffective])

  return (
    <div className="mt-12">
      <section className="w-full">
        <div className="mb-6 text-center">
          <div className="text-3xl font-bold text-[#0f2e40]">{sectionTitle}</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">{sectionDescription}</div>
        </div>

        <div className="mx-auto flex max-w-[95vw] flex-col gap-8 md:flex-row">
          {cards.map((it, idx) => {
            const className = idx === 2 ? 'md:flex-1' : 'md:w-[330px]'
            const inner = (
              <div className="relative h-[260px] overflow-hidden rounded-[40px] bg-gray-100 shadow-lg ring-1 ring-[#0f2e40]/15">
                <img src={it.img} alt={it.label} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0f2e40]/70 to-transparent" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-base font-bold text-white">
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

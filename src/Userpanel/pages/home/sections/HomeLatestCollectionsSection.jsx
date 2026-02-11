import collectionImg1 from '../../../../assets/1312 × 668-3.jpg'
import collectionImg2 from '../../../../assets/1312 × 668-4.jpg'
import collectionImg3 from '../../../../assets/1312 × 668-5.jpg'
import productImg1 from '../../../../assets/876 × 1628-1.png'
import productImg2 from '../../../../assets/876 × 1628-2.png'
import productImg3 from '../../../../assets/876 × 1628-3.png'
import productImg4 from '../../../../assets/876 × 1628-4.png'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'

export default function HomeLatestCollectionsSection({ cmsData }) {
  const [cms, setCms] = useState(null)
  const cmsEffective = cmsData || cms

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
    return () => {
      active = false
    }
  }, [cmsData])

  const latestCollections = useMemo(() => {
    const fallback = [
      {
        id: 'lc-1',
        title: 'FRESH DROP!',
        subtitle: 'Shiny & New Arrivals',
        tag: 'Only at GIVA',
        img: collectionImg1,
        href: '',
        items: [
          { img: productImg1 },
          { img: productImg2 },
          { img: productImg3 },
        ],
      },
      {
        id: 'lc-2',
        title: 'Shakti',
        subtitle: 'COLLECTION',
        tag: 'Wear your power beautifully',
        img: collectionImg2,
        href: '',
        items: [
          { img: productImg4 },
          { img: productImg2 },
          { img: productImg1 },
        ],
      },
      {
        id: 'lc-3',
        title: 'Pierced',
        subtitle: 'COLLECTION',
        tag: 'Mix, match, and stack',
        img: collectionImg3,
        href: '',
        items: [
          { img: productImg3 },
          { img: productImg4 },
          { img: productImg1 },
        ],
      },
    ]

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

    if (normalized.length) {
      const ensured = normalized.slice(0, 3).map((c, i) => {
        const fb = fallback[i]
        if (c.items.length) return c
        return { ...c, items: fb.items }
      })
      if (ensured.length >= 3) return ensured
      return [...ensured, ...fallback.slice(ensured.length)]
    }

    return fallback
  }, [cmsEffective])

  const sectionTitle = (cmsEffective?.title || '').trim() || 'Latest Collections'
  const sectionDescription =
    (cmsEffective?.description || '').trim() || 'Fresh designs, new stories, and styles you’ll want to wear on repeat.'

  return (
    <div className="mt-14">
      <section className="relative w-full">
        <div className="mb-6 text-center">
          <div className="text-3xl font-bold text-gray-900">{sectionTitle}</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">{sectionDescription}</div>
        </div>

        <div className="no-scrollbar flex snap-x snap-mandatory gap-8 overflow-x-auto px-1 py-2 md:px-10">
          {latestCollections.map((c) => (
            <div key={c.id} className="shrink-0 snap-center">
              <div className="relative w-[30vw] max-w-[700px] pb-16 md:w-[700px]">
                <div className="relative h-[240px] overflow-hidden rounded-[44px] bg-gray-100 ring-1 ring-gray-200 md:h-[300px]">
                  {c.href ? (
                    <Link to={c.href} className="block h-full w-full">
                      <img src={c.img} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />
                      <div className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-left text-white">
                        <div className="text-4xl font-bold tracking-wide">{c.title}</div>
                        <div className="mt-2 text-sm font-medium text-white/90">{c.subtitle}</div>
                        <div className="mt-1 text-sm font-bold italic text-white/85">{c.tag}</div>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <img src={c.img} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />

                      <div className="absolute left-10 top-1/2 -translate-y-1/2 text-left text-white">
                        <div className="text-4xl font-bold tracking-wide">{c.title}</div>
                        <div className="mt-2 text-sm font-medium text-white/90">{c.subtitle}</div>
                        <div className="mt-1 text-sm font-bold italic text-white/85">{c.tag}</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-5">
                  {c.items.map((it, idx) => (
                    <div
                      key={it.id || `${c.id}-${idx}`}
                      className="grid h-[120px] w-[120px] place-items-center overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-200"
                    >
                      <img src={it.img} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
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

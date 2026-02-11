import { useEffect, useMemo, useState } from 'react'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'

export default function HomeCustomerStoriesSection({ cmsData }) {
  const [cms, setCms] = useState(null)
  const cmsEffective = cmsData || cms
  const [loading, setLoading] = useState(!cmsData)
  const [loaded, setLoaded] = useState(Boolean(cmsData))

  useEffect(() => {
    if (cmsData) return
    let active = true
    getJson('/api/cms/home-customer-stories')
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

  const customerStories = useMemo(() => {
    const rows = Array.isArray(cmsEffective?.items) ? cmsEffective.items : []
    return rows
      .map((it, idx) => ({
        id: String(it?.id || it?._id || `cs-${idx}`),
        name: String(it?.name || it?.title || '').trim(),
        story: String(it?.story || it?.description || '').trim(),
        img: String(it?.imageUrl || it?.img || '').trim(),
        sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
      }))
      .filter((it) => Boolean(it.name && it.story && it.img))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, 3)
  }, [cmsEffective])

  if (loading && !loaded) {
    return (
      <div className="mt-16 animate-pulse">
        <section className="w-full">
          <div className="mb-10 text-center">
            <div className="mx-auto h-9 w-64 rounded bg-gray-200 sm:h-10 md:h-12" />
            <div className="mx-auto mt-2 h-4 w-96 rounded bg-gray-200 sm:h-5" />
          </div>

          <div className="mx-auto max-w-[92vw]">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[0, 1, 2].map((k) => (
                <div key={k} className="relative rounded-2xl bg-gray-200 px-8 pb-14 pt-8">
                  <div className="mx-auto h-6 w-28 rounded bg-gray-100" />
                  <div className="mx-auto mt-4 h-12 w-full rounded bg-gray-100" />
                  <div className="absolute -bottom-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-gray-100 ring-2 ring-white" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!customerStories.length) return null

  return (
    <div className="mt-16">
      <section className="w-full">
        <div className="mb-10 text-center">
          {sectionTitle ? <div className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">{sectionTitle}</div> : null}
          {sectionDescription ? (
            <div className="mt-2 text-xs font-semibold text-gray-600 sm:text-sm md:text-base">{sectionDescription}</div>
          ) : null}
        </div>

        <div className="mx-auto max-w-[92vw]">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {customerStories.map((s) => (
              <div key={s.id} className="relative rounded-2xl bg-gray-300 px-8 pb-14 pt-8">
                <div className="text-center text-lg font-bold text-gray-900 sm:text-xl">{s.name}</div>
                <div className="mt-4 text-center text-xs leading-6 text-gray-700 sm:text-sm">{s.story}</div>

                <div className="absolute -bottom-8 left-1/2 h-16 w-16 -translate-x-1/2 overflow-hidden rounded-full bg-white ring-2 ring-white">
                  <img src={s.img} alt={s.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

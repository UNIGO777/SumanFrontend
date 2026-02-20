import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'

export default function HomeOccasionSection({ cmsData }) {
  const CLONE_COUNT = 2
  const occasionRef = useRef(null)
  const initialScrollRef = useRef(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const activeIdxRef = useRef(0)
  const [cms, setCms] = useState(null)
  const cmsEffective = cmsData || cms
  const [loading, setLoading] = useState(!cmsData)
  const [loaded, setLoaded] = useState(Boolean(cmsData))

  useEffect(() => {
    if (cmsData) return
    let active = true
    getJson('/api/cms/home-occasion')
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

  const occasions = useMemo(() => {
    const rows = Array.isArray(cmsEffective?.items) ? cmsEffective.items : []
    const normalized = rows
      .map((it, idx) => ({
        label: String(it?.label || it?.title || '').trim(),
        img: String(it?.imageUrl || it?.img || '').trim(),
        href: String(it?.href || '').trim(),
        sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
      }))
      .filter((it) => Boolean(it.label && it.img))
      .sort((a, b) => a.sortOrder - b.sortOrder)

    return normalized
  }, [cmsEffective])

  const sectionTitle = String(cmsEffective?.title || '').trim()
  const sectionDescription = String(cmsEffective?.description || '').trim()

  const displayOccasions = useMemo(() => {
    if (occasions.length <= 1) return occasions
    const n = Math.min(CLONE_COUNT, occasions.length)
    return [...occasions.slice(-n), ...occasions, ...occasions.slice(0, n)]
  }, [CLONE_COUNT, occasions])

  useEffect(() => {
    activeIdxRef.current = activeIdx
  }, [activeIdx])

  useEffect(() => {
    if (initialScrollRef.current) return
    if (!displayOccasions.length) return
    const container = occasionRef.current
    if (!container) return
    const baseIdx = Math.min(2, occasions.length - 1)
    const idx = occasions.length > 1 ? baseIdx + Math.min(CLONE_COUNT, occasions.length) : baseIdx
    const el = container.children?.[idx]
    if (!el || typeof el.scrollIntoView !== 'function') return
    initialScrollRef.current = true
    requestAnimationFrame(() => {
      setActiveIdx(idx)
      el.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' })
    })
  }, [CLONE_COUNT, displayOccasions.length, occasions.length])

  useEffect(() => {
    const container = occasionRef.current
    if (!container) return

    let raf = 0

    const updateActive = () => {
      raf = 0

      const containerRect = container.getBoundingClientRect()
      const containerCenterX = containerRect.left + containerRect.width / 2

      let bestIndex = 0
      let bestDistance = Number.POSITIVE_INFINITY

      const children = Array.from(container.children)
      for (let i = 0; i < children.length; i += 1) {
        const childRect = children[i].getBoundingClientRect()
        const childCenterX = childRect.left + childRect.width / 2
        const d = Math.abs(containerCenterX - childCenterX)
        if (d < bestDistance) {
          bestDistance = d
          bestIndex = i
        }
      }

      setActiveIdx((prev) => (prev === bestIndex ? prev : bestIndex))

      if (occasions.length > 1) {
        const n = Math.min(CLONE_COUNT, occasions.length)
        const firstOriginal = n
        const trailingStart = n + occasions.length

        if (bestIndex < firstOriginal) {
          const originalIndex = occasions.length - n + bestIndex
          const targetIndex = firstOriginal + originalIndex
          const jumpEl = container.children?.[targetIndex]
          if (jumpEl && typeof jumpEl.scrollIntoView === 'function') {
            jumpEl.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' })
            setActiveIdx((prev) => (prev === targetIndex ? prev : targetIndex))
          }
        } else if (bestIndex >= trailingStart) {
          const originalIndex = bestIndex - trailingStart
          const targetIndex = firstOriginal + originalIndex
          const jumpEl = container.children?.[targetIndex]
          if (jumpEl && typeof jumpEl.scrollIntoView === 'function') {
            jumpEl.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' })
            setActiveIdx((prev) => (prev === targetIndex ? prev : targetIndex))
          }
        }
      }
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(updateActive)
    }

    updateActive()
    container.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      container.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [CLONE_COUNT, occasions.length])

  useEffect(() => {
    if (occasions.length <= 1) return
    const container = occasionRef.current
    if (!container) return

    const intervalId = window.setInterval(() => {
      const current = activeIdxRef.current
      const n = Math.min(CLONE_COUNT, occasions.length)
      const firstOriginal = n
      const trailingStart = n + occasions.length

      let normalized = current - firstOriginal
      normalized = ((normalized % occasions.length) + occasions.length) % occasions.length

      const nextDisplayIndex =
        normalized === occasions.length - 1 ? trailingStart : Math.min(current + 1, container.children.length - 1)

      const el = container.children?.[nextDisplayIndex]
      if (!el || typeof el.scrollIntoView !== 'function') return
      window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      })
    }, 2000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [CLONE_COUNT, occasions.length])

  if (loading && !loaded) {
    return (
      <div className="mt-12 animate-pulse">
        <section className="w-full rounded-3xl bg-[#f2f7f9] py-10">
          <div className="mb-6 text-center">
            <div className="mx-auto h-9 w-64 rounded bg-gray-200 sm:h-10 md:h-12" />
            <div className="mx-auto mt-2 h-4 w-96 rounded bg-gray-200 sm:h-5" />
          </div>

          <div className="relative mx-auto max-w-[96vw] sm:max-w-[92vw] ">
            <div className="no-scrollbar flex min-h-[420px] snap-x snap-mandatory items-end gap-6 overflow-x-auto px-4 py-8 sm:min-h-[480px] sm:gap-12 sm:px-8 sm:py-10 md:px-12 lg:px-20 scroll-px-4 sm:scroll-px-8 ">
              {[0, 1, 2, 3, 4].map((k) => (
                <div key={k} className="shrink-0 snap-center">
                  <div className="relative h-[420px] w-[200px] overflow-hidden bg-gray-200 shadow-lg sm:h-[360px] sm:w-[320px] md:h-[490px] md:w-[330px]" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!displayOccasions.length) return null

  return (
    <div className="mt-12">
      <section className="w-full rounded-3xl bg-[#f2f7f9] py-10">
        <div className="mb-6 text-center">
          {sectionTitle ? (
            <div className="inline-block rounded-md px-6 py-1 text-2xl font-bold text-[#0f2e40] sm:text-3xl md:text-4xl">{sectionTitle}</div>
          ) : null}
          {sectionDescription ? <div className="mt-2 text-xs font-semibold text-gray-600 sm:text-sm md:text-base">{sectionDescription}</div> : null}
        </div>

        <div className="relative mx-auto max-w-[96vw] sm:max-w-[92vw] ">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#f2f7f9] to-transparent sm:w-20 md:w-24 lg:w-28" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#f2f7f9] to-transparent sm:w-20 md:w-24 lg:w-28" />

          <div
            ref={occasionRef}
            className="no-scrollbar flex min-h-[420px] snap-x snap-mandatory items-end gap-6 overflow-x-auto px-4 py-8 sm:min-h-[480px] sm:gap-12 sm:px-8 sm:py-10 md:px-12 lg:px-20 scroll-px-4 sm:scroll-px-8 "
          >
            {displayOccasions.map((it, idx) => {
              const isActive = idx === activeIdx
              const cardClassName = isActive
                ? 'shadow-xl ring-2 ring-[#0f2e40]/40'
                : 'shadow-lg ring-1 ring-[#0f2e40]/10'

              return (
                <div key={`${it.label}-${idx}`} className="shrink-0 snap-center">
                  {it.href ? (
                    <Link
                      to={it.href}
                      className={`relative block h-[420px] w-[200px] overflow-hidden ${cardClassName} sm:h-[360px] sm:w-[320px] md:h-[490px] md:w-[330px]`}
                    >
                      <img
                        src={it.img}
                        alt={it.label}
                        className="absolute inset-0 h-full w-full scale-[1.22] object-cover object-[center_35%] sm:scale-[1.32]"
                        loading="lazy"
                      />
                      <div className="absolute bottom-3 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 bg-white/95 px-3 py-2 text-xs font-bold text-[#0f2e40] shadow-sm ring-1 ring-[#0f2e40]/20 sm:bottom-4 sm:w-[calc(100%-2.5rem)] sm:px-4 sm:text-sm">
                        <div className="truncate text-center whitespace-nowrap">{it.label}</div>
                      </div>
                    </Link>
                  ) : (
                    <div className={`relative h-[420px] w-[200px] overflow-hidden ${cardClassName} sm:h-[360px] sm:w-[320px] md:h-[490px] md:w-[330px]`}>
                      <img
                        src={it.img}
                        alt={it.label}
                        className="absolute inset-0 h-full w-full scale-[1.22] object-cover sm:scale-[1.32]"
                        loading="lazy"
                      />
                      <div className="absolute bottom-3 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 bg-white/95 px-3 py-2 text-xs font-bold text-[#0f2e40] shadow-sm ring-1 ring-[#0f2e40]/20 sm:bottom-4 sm:w-[calc(100%-2.5rem)] sm:px-4 sm:text-sm">
                        <div className="truncate text-center whitespace-nowrap">{it.label}</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

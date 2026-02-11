import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../../AdminPanel/services/apiClient.js'
import panelImg1 from '../../assets/1312 × 668-2.jpg'
import panelImg2 from '../../assets/1312 × 668-3.jpg'
import panelImg3 from '../../assets/1312 × 668-4.jpg'
import panelImg4 from '../../assets/1312 × 668-5.jpg'

export default function ItemPanel({ title = '', autoScroll = true, items: itemsProp }) {
  const ref = useRef(null)
  const loopWidthRef = useRef(0)
  const autoRafRef = useRef(0)
  const autoLastTsRef = useRef(0)
  const pausedRef = useRef(false)
  const pauseTimerRef = useRef(0)
  const scrollEventRafRef = useRef(0)
  const animRafRef = useRef(0)
  const isAnimatingRef = useRef(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [cms, setCms] = useState(null)

  useEffect(() => {
    const hasOverride = Array.isArray(itemsProp) && itemsProp.length > 0
    if (hasOverride) return

    let active = true
    getJson('/api/cms/home-item-panel')
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
  }, [itemsProp])

  const fallbackItems = useMemo(
    () => [
      { label: 'Rings', imageUrl: panelImg1, badgeText: 'Min 65% OFF', href: '' },
      { label: 'Bracelets', imageUrl: panelImg2, badgeText: 'Min 60% OFF', href: '' },
      { label: 'Anklets', imageUrl: panelImg3, badgeText: 'Min 60% OFF', href: '' },
      { label: 'Sets', imageUrl: panelImg4, badgeText: 'Min 60% OFF', href: '' },
      { label: 'Men in Silver', imageUrl: panelImg1, badgeText: 'Min 60% OFF', href: '' },
      { label: 'Mangalsutras', imageUrl: panelImg2, badgeText: 'Min 60% OFF', href: '' },
      { label: 'Silver Chains', imageUrl: panelImg3, badgeText: 'Min 60% OFF', href: '' },
      { label: 'Personalised', imageUrl: panelImg4, badgeText: 'Min 60% OFF', href: '' },
    ],
    []
  )

  const items = useMemo(() => {
    const override = Array.isArray(itemsProp) ? itemsProp : []
    const cmsItems = Array.isArray(cms?.items) ? cms.items : []
    const source = override.length ? override : cmsItems.length ? cmsItems : fallbackItems

    const normalized = source
      .map((it, idx) => ({
        label: String(it?.label || '').trim(),
        imageUrl: String(it?.imageUrl || it?.img || '').trim(),
        href: String(it?.href || '').trim(),
        badgeText: String(it?.badgeText || it?.badge || '').trim(),
        sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
      }))
      .filter((it) => Boolean(it.imageUrl) && Boolean(it.label))
      .sort((a, b) => a.sortOrder - b.sortOrder)

    return normalized.length ? normalized : fallbackItems
  }, [cms, fallbackItems, itemsProp])

  const loopItems = useMemo(() => [...items, ...items, ...items, ...items, ...items], [items])

  const computeLoopWidth = useCallback(() => {
    const container = ref.current
    if (!container) return 0
    const marker = container.children?.[items.length]
    const w = marker ? marker.offsetLeft : 0
    return Number.isFinite(w) ? w : 0
  }, [items.length])

  const updateButtons = useCallback(() => {
    const container = ref.current
    if (!container) return
    const hasOverflow = container.scrollWidth - container.clientWidth > 2
    setCanScrollLeft(hasOverflow)
    setCanScrollRight(hasOverflow)
  }, [])

  const wrapToMiddle = useCallback(() => {
    const container = ref.current
    if (!container) return
    const loopWidth = loopWidthRef.current
    if (!loopWidth) return

    const left = container.scrollLeft
    const lower = loopWidth * 1
    const upper = loopWidth * 3

    if (left < lower) container.scrollLeft = left + loopWidth
    else if (left > upper) container.scrollLeft = left - loopWidth
  }, [])

  const scrollByWithWrap = useCallback(
    (delta) => {
      const container = ref.current
      if (!container) return
      container.scrollLeft += delta
      wrapToMiddle()
    },
    [wrapToMiddle]
  )

  const scrollByStep = useCallback(
    (dir) => {
      const container = ref.current
      if (!container) return
      if (animRafRef.current) window.cancelAnimationFrame(animRafRef.current)

      pausedRef.current = true
      isAnimatingRef.current = true
      if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current)

      const firstChild = container.firstElementChild
      const cardWidth = firstChild ? firstChild.getBoundingClientRect().width : 0
      const styles = window.getComputedStyle(container)
      const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0
      const distance = (Math.max(240, Math.round((cardWidth + gap) * 3)) || 520) * dir

      const start = container.scrollLeft
      const durationMs = 340
      const startTs = performance.now()
      const ease = (t) => 1 - Math.pow(1 - t, 3)

      const tick = (ts) => {
        const p = Math.min(1, Math.max(0, (ts - startTs) / durationMs))
        container.scrollLeft = start + distance * ease(p)
        wrapToMiddle()
        if (p < 1) animRafRef.current = window.requestAnimationFrame(tick)
        else {
          animRafRef.current = 0
          isAnimatingRef.current = false
          pauseTimerRef.current = window.setTimeout(() => {
            pausedRef.current = false
            autoLastTsRef.current = 0
          }, 450)
        }
      }

      animRafRef.current = window.requestAnimationFrame(tick)
    },
    [wrapToMiddle]
  )

  useEffect(() => {
    updateButtons()
    const container = ref.current
    if (!container) return

    const onScroll = () => {
      if (scrollEventRafRef.current) return
      scrollEventRafRef.current = window.requestAnimationFrame(() => {
        scrollEventRafRef.current = 0
        wrapToMiddle()
      })
    }
    container.addEventListener('scroll', onScroll, { passive: true })

    let ro
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        loopWidthRef.current = computeLoopWidth()
        wrapToMiddle()
        updateButtons()
      })
      ro.observe(container)
    } else {
      window.addEventListener('resize', updateButtons)
    }

    window.setTimeout(() => {
      loopWidthRef.current = computeLoopWidth()
      if (loopWidthRef.current > 0) container.scrollLeft = loopWidthRef.current * 2
      wrapToMiddle()
      updateButtons()
    }, 0)

    return () => {
      container.removeEventListener('scroll', onScroll)
      if (ro) ro.disconnect()
      else window.removeEventListener('resize', updateButtons)
      if (scrollEventRafRef.current) window.cancelAnimationFrame(scrollEventRafRef.current)
      if (animRafRef.current) window.cancelAnimationFrame(animRafRef.current)
      if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current)
    }
  }, [computeLoopWidth, updateButtons, wrapToMiddle])

  useEffect(() => {
    const container = ref.current
    if (!container) return
    if (!autoScroll) return

    const speedPxPerSec = 28
    autoLastTsRef.current = 0

    const tick = (ts) => {
      if (!ref.current) return
      if (pausedRef.current || isAnimatingRef.current) {
        autoLastTsRef.current = ts
        autoRafRef.current = window.requestAnimationFrame(tick)
        return
      }

      if (autoLastTsRef.current) {
        const dt = Math.min(0.05, (ts - autoLastTsRef.current) / 1000)
        scrollByWithWrap(speedPxPerSec * dt)
      }
      autoLastTsRef.current = ts
      autoRafRef.current = window.requestAnimationFrame(tick)
    }

    autoRafRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (autoRafRef.current) window.cancelAnimationFrame(autoRafRef.current)
      autoRafRef.current = 0
      autoLastTsRef.current = 0
    }
  }, [autoScroll, scrollByWithWrap])

  return (
    <section className="relative">
      {title ? <div className="mb-3 text-sm font-semibold text-gray-900 sm:text-base md:text-lg">{title}</div> : null}

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-16" />

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollByStep(-1)}
        disabled={!canScrollLeft}
        className="absolute left-2 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-gray-900 shadow-lg ring-1 ring-gray-200 backdrop-blur disabled:cursor-not-allowed disabled:opacity-40 sm:left-4"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollByStep(1)}
        disabled={!canScrollRight}
        className="absolute right-2 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-gray-900 shadow-lg ring-1 ring-gray-200 backdrop-blur disabled:cursor-not-allowed disabled:opacity-40 sm:right-4"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={ref}
        onMouseEnter={() => {
          pausedRef.current = true
        }}
        onMouseLeave={() => {
          pausedRef.current = false
          autoLastTsRef.current = 0
        }}
        onTouchStart={() => {
          pausedRef.current = true
        }}
        onTouchEnd={() => {
          pausedRef.current = false
          autoLastTsRef.current = 0
        }}
        className="no-scrollbar flex gap-6 overflow-x-auto px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10"
      >
        {loopItems.map((it, idx) =>
          it.href ? (
            <Link
              key={`${it.label}-${idx}`}
              to={it.href}
              className="flex w-[120px] shrink-0 flex-col items-center transition-transform hover:cursor-pointer hover:scale-[1.1] sm:w-[150px]"
            >
              <div className="relative h-[120px] w-[120px] overflow-hidden rounded-3xl bg-gray-100 ring-1 ring-gray-200 sm:h-[150px] sm:w-[150px]">
                <img src={it.imageUrl} alt={it.label} className="h-full w-full object-fill" loading="lazy" />
                {it.badgeText ? (
                  <div className="absolute left-2 top-2 rounded-full bg-gray-800 px-1.5 py-0.5 text-[9px] font-bold text-white sm:px-2 sm:py-1 sm:text-[10px]">
                    {it.badgeText}
                  </div>
                ) : null}
              </div>
              <div className="mt-2 text-center text-[11px] font-bold text-gray-800 sm:mt-3 sm:text-xs">{it.label}</div>
            </Link>
          ) : (
            <div
              key={`${it.label}-${idx}`}
              className="flex w-[120px] shrink-0 flex-col items-center transition-transform hover:cursor-pointer hover:scale-[1.1] sm:w-[150px]"
            >
              <div className="relative h-[120px] w-[120px] overflow-hidden rounded-3xl bg-gray-100 ring-1 ring-gray-200 sm:h-[150px] sm:w-[150px]">
                <img src={it.imageUrl} alt={it.label} className="h-full w-full object-fill" loading="lazy" />
                {it.badgeText ? (
                  <div className="absolute left-2 top-2 rounded-full bg-gray-800 px-1.5 py-0.5 text-[9px] font-bold text-white sm:px-2 sm:py-1 sm:text-[10px]">
                    {it.badgeText}
                  </div>
                ) : null}
              </div>
              <div className="mt-2 text-center text-[11px] font-bold text-gray-800 sm:mt-3 sm:text-xs">{it.label}</div>
            </div>
          )
        )}
      </div>
    </section>
  )
}

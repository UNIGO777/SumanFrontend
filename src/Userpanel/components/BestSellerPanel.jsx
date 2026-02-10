import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ProductCard from './ProductCard.jsx'

export default function BestSellerPanel({
  title = 'Bestsellers',
  description = '',
  products = [],
  autoScroll = true,
  cardHeightClassName,
  imageHeightClassName,
}) {
  const ref = useRef(null)
  const loopWidthRef = useRef(0)
  const autoRafRef = useRef(0)
  const autoLastTsRef = useRef(0)
  const pausedRef = useRef(false)
  const pauseTimerRef = useRef(0)
  const scrollEventRafRef = useRef(0)
  const animRafRef = useRef(0)
  const isAnimatingRef = useRef(false)
  const [canScroll, setCanScroll] = useState(false)

  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products])
  const enableLoop = safeProducts.length > 5
  const loopProducts = useMemo(
    () => (enableLoop ? [...safeProducts, ...safeProducts, ...safeProducts] : safeProducts),
    [enableLoop, safeProducts]
  )

  const computeLoopWidth = useCallback(() => {
    const container = ref.current
    if (!container) return 0
    const marker = container.children?.[safeProducts.length]
    const w = marker ? marker.offsetLeft : 0
    return Number.isFinite(w) ? w : 0
  }, [safeProducts.length])

  const wrapToMiddle = useCallback(() => {
    if (!enableLoop) return
    const container = ref.current
    if (!container) return
    const loopWidth = loopWidthRef.current
    if (!loopWidth) return

    const left = container.scrollLeft
    const lower = loopWidth * 0.5
    const upper = loopWidth * 1.5

    if (left < lower) container.scrollLeft = left + loopWidth
    else if (left > upper) container.scrollLeft = left - loopWidth
  }, [enableLoop])

  const updateCanScroll = useCallback(() => {
    const container = ref.current
    if (!container) return
    setCanScroll(container.scrollWidth - container.clientWidth > 2)
  }, [])

  const scrollOneCard = useCallback(
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
      const distance = (cardWidth + gap) * dir

      const start = container.scrollLeft
      const durationMs = 320
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
    updateCanScroll()
    const container = ref.current
    if (!container) return

    const onScroll = () => {
      if (!enableLoop) return
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
        updateCanScroll()
        if (!enableLoop) return
        loopWidthRef.current = computeLoopWidth()
        wrapToMiddle()
      })
      ro.observe(container)
    } else {
      window.addEventListener('resize', updateCanScroll)
    }

    window.setTimeout(() => {
      updateCanScroll()
      if (!enableLoop) return
      loopWidthRef.current = computeLoopWidth()
      if (loopWidthRef.current > 0) container.scrollLeft = loopWidthRef.current
      wrapToMiddle()
    }, 0)

    return () => {
      container.removeEventListener('scroll', onScroll)
      if (ro) ro.disconnect()
      else window.removeEventListener('resize', updateCanScroll)
      if (scrollEventRafRef.current) window.cancelAnimationFrame(scrollEventRafRef.current)
      if (animRafRef.current) window.cancelAnimationFrame(animRafRef.current)
      if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current)
      if (autoRafRef.current) window.cancelAnimationFrame(autoRafRef.current)
    }
  }, [computeLoopWidth, enableLoop, updateCanScroll, wrapToMiddle])

  useEffect(() => {
    const container = ref.current
    if (!container) return
    if (!enableLoop) return
    if (!autoScroll) return

    const speedPxPerSec = 26
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
        container.scrollLeft += speedPxPerSec * dt
        wrapToMiddle()
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
  }, [autoScroll, enableLoop, wrapToMiddle])

  return (
    <section className="relative w-full">
      <div className="mb-6 text-center">
        <div className="text-4xl font-bold  text-gray-900">{title}</div>
        {description ? <div className="mt-2 text-sm font-semibold text-gray-600">{description}</div> : null}
      </div>

      {enableLoop && canScroll ? (
        <>
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollOneCard(-1)}
            className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-gray-800 shadow ring-1 ring-gray-200 hover:bg-gray-50 md:grid"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollOneCard(1)}
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-gray-800 shadow ring-1 ring-gray-200 hover:bg-gray-50 md:grid"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

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
        className="no-scrollbar flex gap-8 overflow-x-auto px-1 py-2 "
      >
        {loopProducts.map((p, idx) => (
          <div key={p.id || p.sku || p.title || idx} className="w-[420px] shrink-0">
            <ProductCard
              {...p}
              className="max-w-none"
              cardHeightClassName={cardHeightClassName}
              imageHeightClassName={imageHeightClassName}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

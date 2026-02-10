import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import launchBanner1 from '../../../../assets/1618 × 768-1.jpg'
import launchBanner2 from '../../../../assets/1618 × 768-2.jpg'
import launchBanner3 from '../../../../assets/1618 × 768-3.jpg'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'

export default function HomeLaunchBannerSection() {
  const bannerSwipeRef = useRef({ isDragging: false, startX: 0, pointerId: null })

  const [cms, setCms] = useState(null)

  useEffect(() => {
    let active = true
    getJson('/api/cms/home-launch-banners')
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

  const banners = useMemo(() => {
    const fallback = [
      { img: launchBanner1, href: '/search', sortOrder: 0 },
      { img: launchBanner2, href: '/search', sortOrder: 1 },
      { img: launchBanner3, href: '/search', sortOrder: 2 },
    ]

    const rows = Array.isArray(cms?.items) ? cms.items : []
    const normalized = rows
      .map((it, idx) => ({
        img: String(it?.imageUrl || '').trim(),
        href: String(it?.href || '').trim(),
        sortOrder: Number.isFinite(Number(it?.sortOrder)) ? Number(it.sortOrder) : idx,
      }))
      .filter((it) => Boolean(it.img))
      .sort((a, b) => a.sortOrder - b.sortOrder)

    if (normalized.length >= 3) return normalized.slice(0, 3)
    if (normalized.length) return [...normalized, ...fallback.slice(normalized.length)]
    return fallback
  }, [cms])

  const track = useMemo(() => {
    if (!banners.length) return []
    const first = banners[0]
    const last = banners[banners.length - 1]
    return [last, ...banners, first]
  }, [banners])

  const [trackIdx, setTrackIdx] = useState(1)
  const [isAnimating, setIsAnimating] = useState(true)

  const activeIdx = useMemo(() => {
    if (!banners.length) return 0
    const idx = trackIdx - 1
    return (idx + banners.length) % banners.length
  }, [banners.length, trackIdx])

  const goTo = useCallback(
    (idx) => {
      if (!banners.length) return
      setIsAnimating(true)
      setTrackIdx(idx + 1)
    },
    [banners.length]
  )

  const nextBanner = useCallback(() => {
    if (!banners.length) return
    setIsAnimating(true)
    setTrackIdx((i) => i + 1)
  }, [banners.length])

  const prevBanner = useCallback(() => {
    if (!banners.length) return
    setIsAnimating(true)
    setTrackIdx((i) => i - 1)
  }, [banners.length])

  const onBannerPointerDown = useCallback((e) => {
    if (!banners.length) return
    bannerSwipeRef.current = { isDragging: true, startX: e.clientX, pointerId: e.pointerId }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }, [banners.length])

  const onBannerPointerUp = useCallback(
    (e) => {
      const { isDragging, startX, pointerId } = bannerSwipeRef.current
      if (!isDragging) return

      if (pointerId != null) e.currentTarget.releasePointerCapture?.(pointerId)
      bannerSwipeRef.current = { isDragging: false, startX: 0, pointerId: null }

      const delta = e.clientX - startX
      if (Math.abs(delta) < 60) return
      if (delta < 0) nextBanner()
      else prevBanner()
    },
    [nextBanner, prevBanner]
  )

  const onBannerPointerCancel = useCallback(() => {
    bannerSwipeRef.current = { isDragging: false, startX: 0, pointerId: null }
  }, [])

  const onTrackTransitionEnd = useCallback(() => {
    if (!banners.length) return
    if (trackIdx === 0) {
      setIsAnimating(false)
      setTrackIdx(banners.length)
      return
    }
    if (trackIdx === banners.length + 1) {
      setIsAnimating(false)
      setTrackIdx(1)
    }
  }, [banners.length, trackIdx])

  useEffect(() => {
    if (!banners.length) return
    const id = window.setInterval(() => {
      if (bannerSwipeRef.current.isDragging) return
      nextBanner()
    }, 3000)
    return () => window.clearInterval(id)
  }, [banners.length, nextBanner])

  useEffect(() => {
    if (!isAnimating) {
      const id = window.setTimeout(() => setIsAnimating(true), 0)
      return () => window.clearTimeout(id)
    }
  }, [isAnimating])

  return (
    <div className="mt-10">
      <section className="w-full">
        <div className="mx-auto mb-6 max-w-[92vw] text-center">
          <div className="text-3xl font-bold text-gray-900">{(cms?.title || '').trim() || 'New Launches'}</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">
            {(cms?.description || '').trim() || 'Explore the latest campaigns, highlights, and just-dropped collections.'}
          </div>
        </div>

        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden ">
          <div
            className="relative md:h-[550px] w-full select-none"
            onPointerDown={onBannerPointerDown}
            onPointerUp={onBannerPointerUp}
            onPointerCancel={onBannerPointerCancel}
          >
            <div
              className={`flex h-full w-full ${isAnimating ? 'transition-transform duration-700 ease-in-out' : ''}`}
              style={{ transform: `translate3d(${-trackIdx * 100}%, 0, 0)` }}
              onTransitionEnd={onTrackTransitionEnd}
            >
              {track.map((b, idx) => {
                const img = (
                  <img
                    src={b.img}
                    alt={`Launch banner ${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )

                return (
                  <div key={`${b.img}-${idx}`} className="h-full w-full shrink-0">
                    {b.href ? (
                      <Link to={b.href} className="block h-full w-full">
                        {img}
                      </Link>
                    ) : (
                      img
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-3 bg-white py-4">
            <div className="h-1 w-12 rounded-full bg-gray-400/70" />
            <div className="flex items-center justify-center gap-3">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to banner ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-2 w-2 rounded-full ${i === activeIdx ? 'bg-gray-700' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

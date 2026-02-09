import { useCallback, useRef, useState } from 'react'
import launchBanner1 from '../../../../assets/1618 × 768-1.jpg'
import launchBanner2 from '../../../../assets/1618 × 768-2.jpg'
import launchBanner3 from '../../../../assets/1618 × 768-3.jpg'

export default function HomeLaunchBannerSection() {
  const bannerSwipeRef = useRef({ isDragging: false, startX: 0, pointerId: null })

  const banners = [
    {
      img: launchBanner1,
    },
    {
      img: launchBanner2,
    },
    {
      img: launchBanner3,
    },
  ]

  const [bannerIdx, setBannerIdx] = useState(0)
  const nextBanner = useCallback(() => setBannerIdx((i) => (i + 1) % banners.length), [banners.length])
  const prevBanner = useCallback(() => setBannerIdx((i) => (i - 1 + banners.length) % banners.length), [banners.length])

  const onBannerPointerDown = useCallback((e) => {
    bannerSwipeRef.current = { isDragging: true, startX: e.clientX, pointerId: e.pointerId }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }, [])

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

  return (
    <div className="mt-10">
      <section className="w-full">
        <div className="mx-auto mb-6 max-w-[92vw] text-center">
          <div className="text-3xl font-bold text-gray-900">New Launches</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">
            Explore the latest campaigns, highlights, and just-dropped collections.
          </div>
        </div>

        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden ">
          <div
            className="relative h-[340px] w-full select-none"
            onPointerDown={onBannerPointerDown}
            onPointerUp={onBannerPointerUp}
            onPointerCancel={onBannerPointerCancel}
          >
            <img
              src={banners[bannerIdx].img}
              alt={`Launch banner ${bannerIdx + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex w-full flex-col items-center gap-3 bg-white py-4">
            <div className="h-1 w-12 rounded-full bg-gray-400/70" />
            <div className="flex items-center justify-center gap-3">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to banner ${i + 1}`}
                  onClick={() => setBannerIdx(i)}
                  className={`h-2 w-2 rounded-full ${i === bannerIdx ? 'bg-gray-700' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

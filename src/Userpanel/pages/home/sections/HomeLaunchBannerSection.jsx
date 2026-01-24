import { useCallback, useRef, useState } from 'react'

export default function HomeLaunchBannerSection() {
  const bannerSwipeRef = useRef({ isDragging: false, startX: 0, pointerId: null })

  const banners = [
    {
      img: 'https://images.unsplash.com/photo-1511281053572-7c5bd8fcd5df?auto=format&fit=crop&w=2400&q=80',
      headlineTop: 'GIVA X Barkha Singh',
      headline: 'Glow in Motion',
      sub: 'COLLECTION',
      desc: 'First Time in India: CNC-Cut Silver Jewellery!',
      cta: 'SHOP NOW',
    },
    {
      img: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=2400&q=80',
      headlineTop: 'GIVA',
      headline: 'Shakti Collection',
      sub: 'COLLECTION',
      desc: 'Powerful designs crafted in silver.',
      cta: 'SHOP NOW',
    },
    {
      img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2400&q=80',
      headlineTop: 'GIVA',
      headline: 'Golden Glow',
      sub: 'COLLECTION',
      desc: 'Statement pieces for evening elegance.',
      cta: 'SHOP NOW',
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
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden ">
          <div
            className="relative h-[340px] w-full select-none"
            onPointerDown={onBannerPointerDown}
            onPointerUp={onBannerPointerUp}
            onPointerCancel={onBannerPointerCancel}
          >
            <img
              src={banners[bannerIdx].img}
              alt={banners[bannerIdx].headline}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
            <div className="absolute left-8 top-1/2 w-[80%] max-w-[520px] -translate-y-1/2 text-white sm:left-12">
              <div className="text-xs font-bold tracking-[0.25em] text-white/85 sm:text-sm">
                {banners[bannerIdx].headlineTop}
              </div>
              <div className="mt-2 text-4xl font-bold italic sm:text-5xl">{banners[bannerIdx].headline}</div>
              <div className="mt-3 text-[11px] tracking-[0.35em] text-white/80">{banners[bannerIdx].sub}</div>
              <div className="mt-6 text-sm font-medium text-white/90">{banners[bannerIdx].desc}</div>
              <button className="mt-6 rounded-full border border-white/70 bg-white/10 px-6 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/20">
                {banners[bannerIdx].cta}
              </button>
            </div>
            <div className="absolute right-6 top-5 rounded-sm border border-white/40 bg-black/20 px-4 py-2 text-xs font-bold tracking-widest text-white backdrop-blur">
              NEW LAUNCH
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

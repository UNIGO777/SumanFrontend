import { useEffect, useRef, useState } from 'react'

export default function HomeOccasionSection() {
  const occasionRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(2)

  const occasions = [
    {
      label: "Valentine's Day",
      img: 'https://www.giva.co/cdn/shop/files/V_Day_1200x.webp?v=1768473589',
    },
    {
      label: 'Temple Date',
      img: 'https://www.giva.co/cdn/shop/files/Mandir_1200x.webp?v=1768473589',
    },
    {
      label: 'Propose Day',
      img: 'https://www.giva.co/cdn/shop/files/Purpose_1200x.webp?v=1768473588',
    },
    {
      label: 'Date Night Ready',
      img: 'https://www.giva.co/cdn/shop/files/Raat_ka_1200x.webp?v=1768473589',
    },
    {
      label: "Galentine's",
      img: 'https://www.giva.co/cdn/shop/files/Gal_1200x.webp?v=1768473589',
    },
    {
      label: 'Birthday',
      img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Anniversary',
      img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Wedding',
      img: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Self Love',
      img: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Festive',
      img: 'https://images.unsplash.com/photo-1506634572416-48cdfe530110?auto=format&fit=crop&w=1200&q=80',
    },
  ]

  useEffect(() => {
    const container = occasionRef.current
    if (!container) return
    const el = container.children?.[2]
    if (!el || typeof el.scrollIntoView !== 'function') return
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' })
    })
  }, [])

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
  }, [])

  return (
    <div className="mt-12">
      <section className="w-full rounded-3xl bg-[#f2f7f9] py-10">
        <div className="mb-6 text-center">
          <div className="inline-block rounded-md bg-[#0f2e40] px-6 py-1 text-xl font-bold text-white">
            Shop by Occasion
          </div>
        </div>

        <div className="relative mx-auto max-w-[92vw]">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#f2f7f9] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#f2f7f9] to-transparent" />

          <div
            ref={occasionRef}
            className="no-scrollbar flex min-h-[430px] snap-x snap-mandatory items-end gap-10 overflow-x-auto px-12 py-10"
          >
            {occasions.map((it, idx) => {
              const distance = Math.abs(idx - activeIdx)
              const opacityClass =
                distance === 0 ? 'opacity-100' : distance === 1 ? 'opacity-80' : 'opacity-60'
              const scaleClass =
                distance === 0 ? 'scale-[1.12] z-20' : distance === 1 ? 'scale-[1.06] z-10' : 'scale-100 z-0'

              return (
                <div
                  key={it.label}
                  className={`shrink-0 snap-center transition-transform duration-300 ${opacityClass} ${scaleClass}`}
                >
                  <div
                    className="relative h-[340px] w-[230px] overflow-hidden rounded-[36px] border-4 border-white bg-white shadow-lg ring-1 ring-[#0f2e40]/10"
                  >
                    <img
                      src={it.img}
                      alt={it.label}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-white/95 px-6 py-2 text-sm font-bold text-[#0f2e40] shadow-sm ring-1 ring-[#0f2e40]/20">
                      {it.label}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

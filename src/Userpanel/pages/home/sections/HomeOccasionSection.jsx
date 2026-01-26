import { useEffect, useRef, useState } from 'react'
import occasionImg1 from '../../../../assets/876 × 1628-1.png'
import occasionImg2 from '../../../../assets/876 × 1628-2.png'
import occasionImg3 from '../../../../assets/876 × 1628-3.png'
import occasionImg4 from '../../../../assets/876 × 1628-4.png'

export default function HomeOccasionSection() {
  const occasionRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(2)

  const occasions = [
    {
      label: "Valentine's Day",
      img: occasionImg1,
    },
    {
      label: 'Temple Date',
      img: occasionImg2,
    },
    {
      label: 'Propose Day',
      img: occasionImg3,
    },
    {
      label: 'Date Night Ready',
      img: occasionImg4,
    },
    {
      label: "Galentine's",
      img: occasionImg1,
    },
    {
      label: 'Birthday',
      img: occasionImg2,
    },
    {
      label: 'Anniversary',
      img: occasionImg3,
    },
    {
      label: 'Wedding',
      img: occasionImg4,
    },
    {
      label: 'Self Love',
      img: occasionImg1,
    },
    {
      label: 'Festive',
      img: occasionImg2,
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

        <div className="relative mx-auto max-w-[96vw] sm:max-w-[92vw] lg:max-w-[86vw]">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#f2f7f9] to-transparent sm:w-20 md:w-24 lg:w-28" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#f2f7f9] to-transparent sm:w-20 md:w-24 lg:w-28" />

          <div
            ref={occasionRef}
            className="no-scrollbar flex min-h-[480px] snap-x snap-mandatory items-end gap-12 overflow-x-auto px-8 py-10 sm:px-12 md:px-16 lg:px-20 scroll-px-8 sm:scroll-px-12 md:scroll-px-16 lg:scroll-px-20"
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
                    className="relative h-[390px] w-[230px] overflow-hidden shadow-lg ring-1 ring-[#0f2e40]/10"
                  >
                    <img
                      src={it.img}
                      alt={it.label}
                      className="absolute inset-0 h-full w-full scale-[1.32] object-cover object-[center_35%]"
                      loading="lazy"
                    />
                    <div className="absolute bottom-4 left-1/2 w-[calc(100%-2.5rem)] -translate-x-1/2 bg-white/95 px-4 py-2 text-xs font-bold text-[#0f2e40] shadow-sm ring-1 ring-[#0f2e40]/20 sm:text-sm">
                      <div className="truncate text-center whitespace-nowrap">{it.label}</div>
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

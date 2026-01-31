import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useRef } from 'react'
import panelImg1 from '../../assets/1312 × 668-2.jpg'
import panelImg2 from '../../assets/1312 × 668-3.jpg'
import panelImg3 from '../../assets/1312 × 668-4.jpg'
import panelImg4 from '../../assets/1312 × 668-5.jpg'

export default function ItemPanel({ title = '' }) {
  const ref = useRef(null)

  const items = useMemo(
    () => [
      { label: 'Rings', img: panelImg1, badge: 'Min 65% OFF' },
      { label: 'Bracelets', img: panelImg2, badge: 'Min 60% OFF' },
      { label: 'Anklets', img: panelImg3, badge: 'Min 60% OFF' },
      { label: 'Sets', img: panelImg4, badge: 'Min 60% OFF' },
      { label: 'Men in Silver', img: panelImg1, badge: 'Min 60% OFF' },
      { label: 'Mangalsutras', img: panelImg2, badge: 'Min 60% OFF' },
      { label: 'Silver Chains', img: panelImg3, badge: 'Min 60% OFF' },
      { label: 'Personalised', img: panelImg4, badge: 'Min 60% OFF' },
      { label: 'Rings', img: panelImg1, badge: 'Min 65% OFF' },
      { label: 'Bracelets', img: panelImg2, badge: 'Min 60% OFF' },
      { label: 'Anklets', img: panelImg3, badge: 'Min 60% OFF' },
      { label: 'Sets', img: panelImg4, badge: 'Min 60% OFF' },
      { label: 'Men in Silver', img: panelImg1, badge: 'Min 60% OFF' },
      { label: 'Mangalsutras', img: panelImg2, badge: 'Min 60% OFF' },
      { label: 'Silver Chains', img: panelImg3, badge: 'Min 60% OFF' },
      { label: 'Personalised', img: panelImg4, badge: 'Min 60% OFF' },
    ],
    []
  )

  const scroll = (dir) => {
    if (!ref.current) return
    const container = ref.current
    const firstChild = container.firstElementChild
    const cardWidth = firstChild ? firstChild.getBoundingClientRect().width : 0

    const styles = window.getComputedStyle(container)
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0

    const delta = (cardWidth + gap) * 3 * dir || 520 * dir
    container.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="relative">
      {title ? <div className="mb-3 text-sm font-semibold text-gray-900">{title}</div> : null}

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-gray-800 shadow ring-1 ring-gray-200 hover:bg-gray-50 md:grid"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-gray-800 shadow ring-1 ring-gray-200 hover:bg-gray-50 md:grid"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div ref={ref} className="no-scrollbar flex gap-6 overflow-x-auto px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex w-[120px] shrink-0 flex-col items-center transition-transform hover:cursor-pointer hover:scale-[1.1] sm:w-[150px]"
          >
            <div className="relative h-[120px] w-[120px] overflow-hidden rounded-3xl bg-gray-100 ring-1 ring-gray-200 sm:h-[150px] sm:w-[150px]">
              <img src={it.img} alt={it.label} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute left-2 top-2 rounded-full bg-gray-800 px-1.5 py-0.5 text-[9px] font-bold text-white sm:px-2 sm:py-1 sm:text-[10px]">
                {it.badge}
              </div>
            </div>
            <div className="mt-2 text-center text-[11px] font-bold text-gray-800 sm:mt-3 sm:text-xs">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

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
    ref.current.scrollBy({ left: dir * 520, behavior: 'smooth' })
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

      <div ref={ref} className="no-scrollbar flex gap-6 overflow-x-auto  px-10 py-10 ">
        

        {items.map((it) => (
          <div key={it.label} className="flex w-[150px] shrink-0 flex-col items-center hover:cursor-pointer hover:scale-[1.1] transition-transform">
            <div className="relative h-[150px] w-[150px] overflow-hidden rounded-3xl bg-gray-100 ring-1 ring-gray-200">
              <img src={it.img} alt={it.label} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute left-2 top-2 rounded-full bg-indigo-500/90 px-2 py-1 text-[10px] font-bold text-white">
                {it.badge}
              </div>
            </div>
            <div className="mt-3 text-center text-xs  font-bold text-gray-800">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

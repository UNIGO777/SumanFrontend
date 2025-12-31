import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useRef } from 'react'

export default function ItemPanel({ title = '' }) {
  const ref = useRef(null)

  const items = useMemo(
    () => [
      { label: 'Rings', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', badge: 'Min 65% OFF' },
      { label: 'Bracelets', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Anklets', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Sets', img: 'https://images.unsplash.com/photo-1535632787350-4e68ef4f0b56?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Men in Silver', img: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Mangalsutras', img: 'https://images.unsplash.com/photo-1603575448360-153f093fd0a1?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Silver Chains', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Personalised', img: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1f4?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Rings', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', badge: 'Min 65% OFF' },
      { label: 'Bracelets', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Anklets', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Sets', img: 'https://images.unsplash.com/photo-1535632787350-4e68ef4f0b56?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Men in Silver', img: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Mangalsutras', img: 'https://images.unsplash.com/photo-1603575448360-153f093fd0a1?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Silver Chains', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
      { label: 'Personalised', img: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1f4?auto=format&fit=crop&w=800&q=80', badge: 'Min 60% OFF' },
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

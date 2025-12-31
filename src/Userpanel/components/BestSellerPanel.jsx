import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useRef } from 'react'
import ProductCard from './ProductCard.jsx'

export default function BestSellerPanel({ title = 'Bestsellers', products = [] }) {
  const ref = useRef(null)

  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products])

  const scrollOneCard = (dir) => {
    if (!ref.current) return
    const container = ref.current

    const firstChild = container.firstElementChild
    const cardWidth = firstChild ? firstChild.getBoundingClientRect().width : 0

    const styles = window.getComputedStyle(container)
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0

    const delta = (cardWidth + gap) * dir
    container.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="relative w-full">
      <div className="mb-6 text-center text-2xl font-semibold text-gray-900">{title}</div>

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

      <div ref={ref} className="no-scrollbar flex gap-8 overflow-x-auto px-1 py-2 md:px-10">
        {safeProducts.map((p, idx) => (
          <div key={p.id || p.sku || p.title || idx} className="w-[320px] shrink-0">
            <ProductCard {...p} className="max-w-none" />
          </div>
        ))}
      </div>
    </section>
  )
}

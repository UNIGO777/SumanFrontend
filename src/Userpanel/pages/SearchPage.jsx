import { Search as SearchIcon, Truck, CreditCard, Headphones } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import productImg1 from '../../assets/876 × 1628-1.png'
import productImg2 from '../../assets/876 × 1628-2.png'
import productImg3 from '../../assets/876 × 1628-3.png'
import productImg4 from '../../assets/876 × 1628-4.png'

const PRIMARY = '#0f2e40'

const normalizeText = (v) => String(v || '').trim().toLowerCase()

const COLOR_SWATCH = {
  gold: '#c79b3a',
  silver: '#9ca3af',
  'rose gold': '#e6a8a8',
  black: '#111827',
  blue: '#2563eb',
  green: '#16a34a',
  red: '#dc2626',
  white: '#e5e7eb',
}

const dummyCategories = [
  { id: 'necklaces', name: 'Necklaces' },
  { id: 'rings', name: 'Rings' },
  { id: 'earrings', name: 'Earrings' },
  { id: 'bracelets', name: 'Bracelets' },
  { id: 'anklets', name: 'Anklets' },
  { id: 'chains', name: 'Chains' },
  { id: 'bangles', name: 'Bangles' },
]

const dummySubcategories = [
  { id: 'solitaire', categoryId: 'rings', name: 'Solitaire' },
  { id: 'minimal', categoryId: 'rings', name: 'Minimal' },
  { id: 'studs', categoryId: 'earrings', name: 'Studs' },
  { id: 'hoops', categoryId: 'earrings', name: 'Hoops' },
  { id: 'charm', categoryId: 'bracelets', name: 'Charm' },
  { id: 'tennis', categoryId: 'bracelets', name: 'Tennis' },
  { id: 'pendant', categoryId: 'necklaces', name: 'Pendant' },
  { id: 'layered', categoryId: 'necklaces', name: 'Layered' },
]

const dummyImages = [productImg1, productImg2, productImg3, productImg4]

const buildDummyProducts = () => {
  const titles = [
    'Gold Diamond Ring',
    'Golden Elegance Bracelet',
    'Gold Necklace',
    'Gold Bracelet',
    'Green Diamond Earrings',
    'Gold Bracelet',
    'Gold Bangle',
    'Gold Chain',
    'Silver Minimal Pendant',
    'Silver Classic Solitaire Ring',
    'Silver Hoop Earrings',
    'Rose Gold Tennis Bracelet',
  ]
  const colors = ['Gold', 'Silver', 'Rose Gold', 'Black', 'Green', 'Blue']
  const materials = ['Gold', 'Silver', 'Platinum']
  const out = []

  for (let i = 0; i < 30; i += 1) {
    const c = dummyCategories[i % dummyCategories.length]
    const subs = dummySubcategories.filter((s) => s.categoryId === c.id)
    const sc = subs.length ? subs[i % subs.length] : { id: '', name: '' }
    const title = titles[i % titles.length]
    const base = 180 + (i % 8) * 35
    const price = Math.round(base * 10) * 10
    const originalPrice = Math.round(price * 1.3)
    const key = `${c.id}-${sc.id || 'all'}-${i + 1}`
    const color = colors[i % colors.length]
    const material = materials[i % materials.length]

    out.push({
      key,
      id: key,
      sku: `SJ-${1000 + i}`,
      title,
      categoryId: c.id,
      categoryName: c.name,
      subCategoryId: sc.id,
      subCategoryName: sc.name,
      images: [dummyImages[i % dummyImages.length], dummyImages[(i + 1) % dummyImages.length]],
      imageUrl: dummyImages[i % dummyImages.length],
      price,
      originalPrice,
      rating: 4.8,
      ratingCount: 243,
      couponText: 'EXTRA 15% OFF with coupon',
      color,
      material,
      inStock: i % 7 !== 0,
    })
  }
  return out
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const qParam = String(searchParams.get('q') || '').trim()
  const [q, setQ] = useState(qParam)

  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [availability, setAvailability] = useState('all')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)

  const products = useMemo(() => buildDummyProducts(), [])
  const pageSize = 12

  useEffect(() => {
    setQ(qParam)
  }, [qParam])

  const activeSubcategories = useMemo(() => {
    if (!selectedCategoryId) return dummySubcategories
    return dummySubcategories.filter((s) => String(s.categoryId) === String(selectedCategoryId))
  }, [selectedCategoryId])

  const priceBounds = useMemo(() => {
    const prices = products.map((p) => p.price).filter((n) => Number.isFinite(n))
    const min = prices.length ? Math.min(...prices) : 0
    const max = prices.length ? Math.max(...prices) : 0
    return { min, max }
  }, [products])

  const [minPrice, setMinPrice] = useState(priceBounds.min)
  const [maxPrice, setMaxPrice] = useState(priceBounds.max)

  useEffect(() => {
    setMinPrice(priceBounds.min)
    setMaxPrice(priceBounds.max)
  }, [priceBounds.max, priceBounds.min])

  useEffect(() => {
    setPage(1)
  }, [selectedCategoryId, selectedSubCategoryId, selectedColor, selectedMaterial, availability, minPrice, maxPrice, sort, qParam])

  const filtered = useMemo(() => {
    const qLower = normalizeText(qParam)
    return products.filter((p) => {
      if (qLower && !normalizeText(p.title).includes(qLower)) return false
      if (selectedCategoryId && String(p.categoryId) !== String(selectedCategoryId)) return false
      if (selectedSubCategoryId && String(p.subCategoryId) !== String(selectedSubCategoryId)) return false
      if (selectedColor && normalizeText(p.color) !== normalizeText(selectedColor)) return false
      if (selectedMaterial && normalizeText(p.material) !== normalizeText(selectedMaterial)) return false
      if (availability === 'in' && !p.inStock) return false
      if (availability === 'out' && p.inStock) return false
      if (Number.isFinite(minPrice) && p.price < minPrice) return false
      if (Number.isFinite(maxPrice) && p.price > maxPrice) return false
      return true
    })
  }, [availability, maxPrice, minPrice, products, qParam, selectedCategoryId, selectedColor, selectedMaterial, selectedSubCategoryId])

  const sorted = useMemo(() => {
    const arr = filtered.slice()
    if (sort === 'price_asc') arr.sort((a, b) => (a.price || 0) - (b.price || 0))
    if (sort === 'price_desc') arr.sort((a, b) => (b.price || 0) - (a.price || 0))
    if (sort === 'name_asc') arr.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')))
    if (sort === 'name_desc') arr.sort((a, b) => String(b.title || '').localeCompare(String(a.title || '')))
    return arr
  }, [filtered, sort])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(sorted.length / pageSize)), [pageSize, sorted.length])
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [page, pageSize, sorted])

  const showing = useMemo(() => {
    if (sorted.length === 0) return { from: 0, to: 0 }
    const from = (page - 1) * pageSize + 1
    const to = Math.min(sorted.length, page * pageSize)
    return { from, to }
  }, [page, pageSize, sorted.length])

  const filterChips = useMemo(() => {
    const chips = []
    const cat = selectedCategoryId ? dummyCategories.find((c) => c.id === selectedCategoryId)?.name : ''
    const sub = selectedSubCategoryId ? dummySubcategories.find((s) => s.id === selectedSubCategoryId)?.name : ''
    if (cat) chips.push({ key: 'cat', label: cat, onClear: () => setSelectedCategoryId('') })
    if (sub) chips.push({ key: 'sub', label: sub, onClear: () => setSelectedSubCategoryId('') })
    if (selectedColor) chips.push({ key: 'color', label: selectedColor, onClear: () => setSelectedColor('') })
    if (selectedMaterial) chips.push({ key: 'material', label: selectedMaterial, onClear: () => setSelectedMaterial('') })
    if (availability !== 'all') chips.push({ key: 'availability', label: availability === 'in' ? 'In stock' : 'Out of stock', onClear: () => setAvailability('all') })
    if (priceBounds.max > 0 && (minPrice !== priceBounds.min || maxPrice !== priceBounds.max)) {
      chips.push({
        key: 'price',
        label: `₹${Math.round(minPrice)} - ₹${Math.round(maxPrice)}`,
        onClear: () => {
          setMinPrice(priceBounds.min)
          setMaxPrice(priceBounds.max)
        },
      })
    }
    return chips
  }, [availability, maxPrice, minPrice, priceBounds.max, priceBounds.min, selectedCategoryId, selectedColor, selectedMaterial, selectedSubCategoryId])

  const onSubmitSearch = (e) => {
    e.preventDefault()
    const next = String(q || '').trim()
    setSearchParams(next ? { q: next } : {})
  }

  const clearAll = () => {
    setSelectedCategoryId('')
    setSelectedSubCategoryId('')
    setSelectedColor('')
    setSelectedMaterial('')
    setAvailability('all')
    setSort('default')
    setMinPrice(priceBounds.min)
    setMaxPrice(priceBounds.max)
  }

  return (
    <div className="bg-white">
      <div className="w-full bg-gray-100">
        <div className="w-full px-8 py-10 text-center sm:px-12 md:px-8 lg:px-14">
          <div className="text-4xl font-semibold text-gray-900">Shop</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">
            <Link to="/" className="hover:underline">
              Home
            </Link>{' '}
            <span className="text-gray-400">/</span> <span className="text-gray-900">Shop</span>
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-10 sm:px-12 md:px-8 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200">
              <div className="text-sm font-bold text-gray-900">Filter Options</div>

              <div className="mt-5 space-y-6">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Category</div>
                  <div className="mt-3 space-y-2 text-sm font-medium text-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId('')
                        setSelectedSubCategoryId('')
                      }}
                      className={`block w-full text-left hover:text-gray-900 ${!selectedCategoryId ? 'text-[#0f2e40]' : ''}`}
                    >
                      All
                    </button>
                    {dummyCategories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryId(c.id)
                          setSelectedSubCategoryId('')
                        }}
                        className={`block w-full text-left hover:text-gray-900 ${selectedCategoryId === c.id ? 'text-[#0f2e40]' : ''}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900">Subcategory</div>
                  <div className="mt-3 space-y-2 text-sm font-medium text-gray-700">
                    <button
                      type="button"
                      onClick={() => setSelectedSubCategoryId('')}
                      className={`block w-full text-left hover:text-gray-900 ${!selectedSubCategoryId ? 'text-[#0f2e40]' : ''}`}
                    >
                      All
                    </button>
                    {activeSubcategories.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSubCategoryId(s.id)}
                        className={`block w-full text-left hover:text-gray-900 ${selectedSubCategoryId === s.id ? 'text-[#0f2e40]' : ''}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900">Price</div>
                  <div className="mt-3">
                    <input
                      type="range"
                      min={Math.floor(priceBounds.min)}
                      max={Math.ceil(priceBounds.max)}
                      value={Math.min(maxPrice, Math.ceil(priceBounds.max))}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#0f2e40]"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs font-semibold text-gray-600">
                      <span>₹{Math.round(minPrice)}</span>
                      <span>₹{Math.round(maxPrice)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900">Color</div>
                  <div className="mt-3 space-y-2 text-sm font-medium text-gray-700">
                    {['Gold', 'Silver', 'Rose Gold', 'Black', 'Green', 'Blue'].map((c) => {
                      const active = normalizeText(selectedColor) === normalizeText(c)
                      const swatch = COLOR_SWATCH[normalizeText(c)] || '#d1d5db'
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(active ? '' : c)}
                          className={`flex w-full items-center justify-between gap-3 text-left hover:text-gray-900 ${active ? 'text-[#0f2e40]' : ''}`}
                        >
                          <span className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full ring-1 ring-gray-300" style={{ backgroundColor: swatch }} />
                            <span>{c}</span>
                          </span>
                          <span className={`text-xs font-bold ${active ? 'text-[#0f2e40]' : 'text-transparent'}`}>✓</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900">Material</div>
                  <div className="mt-3 space-y-2 text-sm font-medium text-gray-700">
                    {['Gold', 'Silver', 'Platinum'].map((m) => {
                      const active = normalizeText(selectedMaterial) === normalizeText(m)
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMaterial(active ? '' : m)}
                          className={`flex w-full items-center justify-between gap-3 text-left hover:text-gray-900 ${active ? 'text-[#0f2e40]' : ''}`}
                        >
                          <span>{m}</span>
                          <span className={`text-xs font-bold ${active ? 'text-[#0f2e40]' : 'text-transparent'}`}>✓</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900">Availability</div>
                  <div className="mt-3 space-y-2 text-sm font-medium text-gray-700">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'in', label: 'In stock' },
                      { key: 'out', label: 'Out of stock' },
                    ].map((a) => (
                      <button
                        key={a.key}
                        type="button"
                        onClick={() => setAvailability(a.key)}
                        className={`flex w-full items-center justify-between text-left hover:text-gray-900 ${
                          availability === a.key ? 'text-[#0f2e40]' : ''
                        }`}
                      >
                        <span>{a.label}</span>
                        <span className={`text-xs font-bold ${availability === a.key ? 'text-[#0f2e40]' : 'text-transparent'}`}>✓</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearAll}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white hover:bg-[#13384d]"
                  style={{ backgroundColor: PRIMARY }}
                >
                  Clear filters
                </button>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-9">
            <form onSubmit={onSubmitSearch} className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder='Search "Rings", "Necklace"...'
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 pr-12 text-sm font-semibold text-gray-900 outline-none focus:border-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md hover:bg-gray-50"
                  aria-label="Search"
                >
                  <SearchIcon className="h-5 w-5 text-gray-700" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="h-11 rounded-lg bg-white px-5 text-sm font-semibold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50"
              >
                View Cart
              </button>
            </form>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm font-semibold text-gray-600">
                Showing {showing.from}–{showing.to} of {sorted.length} results
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-gray-700">Sort by:</div>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-10 appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm font-semibold text-gray-900 outline-none focus:border-gray-400"
                  >
                    <option value="default">Default sorting</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-700">▾</span>
                </div>
              </div>
            </div>

            {filterChips.length ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold text-gray-700">Active filter:</div>
                {filterChips.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={c.onClear}
                    className="inline-flex items-center gap-2 rounded-md bg-[#fff2e2] px-3 py-2 text-xs font-semibold text-gray-800 ring-1 ring-[#f3dcc1]"
                  >
                    {c.label}
                    <span className="text-gray-700">×</span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((p) => (
                <ProductCard key={p.key} {...p} className="max-w-none" />
              ))}
            </div>

            {pageItems.length === 0 ? (
              <div className="mt-10 rounded-xl bg-gray-50 px-6 py-10 text-center ring-1 ring-gray-200">
                <div className="text-lg font-semibold text-gray-900">No products found</div>
                <div className="mt-2 text-sm font-semibold text-gray-600">Try changing filters or search keywords.</div>
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="mt-6 rounded-lg px-6 py-3 text-sm font-semibold text-white hover:bg-[#13384d]"
                  style={{ backgroundColor: PRIMARY }}
                >
                  Clear search
                </button>
              </div>
            ) : null}

            {totalPages > 1 ? (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-10 w-10 rounded-lg bg-white text-sm font-semibold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50"
                  aria-label="Previous page"
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 8) }).map((_, idx) => {
                  const p = idx + 1
                  const active = p === page
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`h-10 w-10 rounded-lg text-sm font-semibold ring-1 ${
                        active ? 'text-white ring-[#0f2e40]' : 'bg-white text-gray-900 ring-gray-200 hover:bg-gray-50'
                      }`}
                      style={active ? { backgroundColor: PRIMARY } : undefined}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-10 w-10 rounded-lg bg-white text-sm font-semibold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50"
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            ) : null}

            <div className="mt-14 grid gap-6 rounded-xl bg-white p-6 ring-1 ring-gray-200 md:grid-cols-3">
              {[
                { icon: Truck, title: 'Free Shipping', sub: 'Free shipping for orders above ₹999' },
                { icon: CreditCard, title: 'Flexible Payment', sub: 'Multiple secure payment options' },
                { icon: Headphones, title: '24/7 Support', sub: 'We support online 24 hours' },
              ].map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-gray-50 ring-1 ring-gray-200">
                      <Icon className="h-5 w-5" style={{ color: PRIMARY }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{f.title}</div>
                      <div className="mt-1 text-xs font-semibold text-gray-600">{f.sub}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

import { Search as SearchIcon, Truck, CreditCard, Headphones } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import productFallback from '../../assets/876 × 1628-1.png'
import { getJson } from '../../AdminPanel/services/apiClient.js'
import { computeProductPricing, getSilver925RatePerGram, getSilverWeightGrams } from '../UserServices/pricingService.js'

const PRIMARY = '#0f2e40'

const normalizeText = (v) => String(v || '').trim().toLowerCase()

const pickPrimaryVariant = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : []
  if (!variants.length) return null
  const active = variants.find((v) => v?.isActive !== false)
  return active || variants[0]
}

const getAttrValue = (attributes, key) => {
  if (!attributes || typeof attributes !== 'object') return ''
  const target = String(key || '').trim().toLowerCase()
  if (!target) return ''
  const entry = Object.entries(attributes).find(([k]) => String(k).trim().toLowerCase() === target)
  if (!entry) return ''
  const v = entry[1]
  return v === undefined || v === null ? '' : String(v).trim()
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const qParam = String(searchParams.get('q') || '').trim()
  const categoryIdParam = String(searchParams.get('categoryId') || '').trim()
  const subCategoryIdParam = String(searchParams.get('subCategoryId') || '').trim()
  const occasionKeyParam = String(searchParams.get('occasionKey') || '').trim()
  const [q, setQ] = useState(qParam)

  const [selectedCategoryId, setSelectedCategoryId] = useState(() => categoryIdParam)
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(() => subCategoryIdParam)
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [apiProducts, setApiProducts] = useState([])
  const [apiCategories, setApiCategories] = useState([])
  const [apiSubcategories, setApiSubcategories] = useState([])
  const [silverPricePerGram, setSilverPricePerGram] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const pageSize = 12

  const categories = useMemo(() => (Array.isArray(apiCategories) ? apiCategories : []), [apiCategories])
  const subcategories = useMemo(() => (Array.isArray(apiSubcategories) ? apiSubcategories : []), [apiSubcategories])

  const categoryById = useMemo(() => {
    const m = new Map()
    categories.forEach((c) => m.set(String(c?._id || c?.id || ''), c))
    return m
  }, [categories])
  const subById = useMemo(() => {
    const m = new Map()
    subcategories.forEach((s) => m.set(String(s?._id || s?.id || ''), s))
    return m
  }, [subcategories])

  const products = useMemo(() => (Array.isArray(apiProducts) ? apiProducts : []), [apiProducts])

  useEffect(() => {
    let active = true
    setLoadError('')

    Promise.all([getJson('/api/categories', { page: 1, limit: 200 }), getJson('/api/subcategories', { page: 1, limit: 200 })])
      .then(([catsRes, subsRes]) => {
        if (!active) return
        const cats = Array.isArray(catsRes?.data) ? catsRes.data : []
        const subs = Array.isArray(subsRes?.data) ? subsRes.data : []
        setApiCategories(cats)
        setApiSubcategories(subs)
      })
      .catch(() => {
        if (!active) return
        setApiCategories([])
        setApiSubcategories([])
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    getSilver925RatePerGram()
      .then((rate) => {
        if (!active) return
        setSilverPricePerGram(Number.isFinite(Number(rate)) ? Number(rate) : 0)
      })
      .catch(() => {
        if (!active) return
        setSilverPricePerGram(0)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError('')

    const path = occasionKeyParam
      ? `/api/occasions/${encodeURIComponent(occasionKeyParam)}/products`
      : '/api/products/search'

    const query = occasionKeyParam
      ? { page: 1, limit: 200 }
      : {
          page: 1,
          limit: 200,
          q: qParam,
          categoryId: categoryIdParam,
          subCategoryId: subCategoryIdParam,
        }

    getJson(path, query)
      .then((res) => {
        if (!active) return
        const rows = Array.isArray(res?.data) ? res.data : []
        const mapped = rows.map((p, idx) => {
          const v = pickPrimaryVariant(p) || {}
          const images = [p?.image, ...(Array.isArray(p?.images) ? p.images : []), v?.image, ...(Array.isArray(v?.images) ? v.images : [])].filter(
            Boolean
          )
          const cover = images[0] || productFallback
          const pricing = computeProductPricing(p, silverPricePerGram)
          const gramsNum = getSilverWeightGrams(p)
          const categoryId = String(p?.category || '')
          const subCategoryId = String(p?.subCategory || '')
          const categoryName = categoryById.get(categoryId)?.name || ''
          const subCategoryName = subById.get(subCategoryId)?.name || ''
          const stock = Number(p?.stock)
          const inStock = Number.isFinite(stock) ? stock > 0 : (Number(v?.stock) || 0) > 0

          return {
            key: p?._id || `p-${idx + 1}`,
            id: p?._id,
            sku: p?.sku || v?.sku || '',
            title: p?.name || 'Product',
            categoryId,
            categoryName,
            subCategoryId,
            subCategoryName,
            images: images.length ? images : [cover],
            imageUrl: cover,
            price: Number.isFinite(pricing?.price) ? pricing.price : 0,
            originalPrice: Number.isFinite(pricing?.originalPrice) ? pricing.originalPrice : undefined,
            discountPercent: Number.isFinite(pricing?.discountPercent) ? pricing.discountPercent : 0,
            silverWeightGrams: gramsNum || undefined,
            rating: undefined,
            ratingCount: undefined,
            couponText: '',
            color: getAttrValue(p?.attributes, 'color'),
            material: getAttrValue(p?.attributes, 'material'),
            inStock,
          }
        })
        setApiProducts(mapped)
      })
      .catch((e) => {
        if (!active) return
        setApiProducts([])
        setLoadError(e?.message || 'Failed to load products')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [categoryById, categoryIdParam, occasionKeyParam, qParam, silverPricePerGram, subById, subCategoryIdParam])

  useEffect(() => {
    setQ(qParam)
  }, [qParam])

  useEffect(() => {
    setSelectedCategoryId(categoryIdParam)
    setSelectedSubCategoryId(subCategoryIdParam)
  }, [categoryIdParam, subCategoryIdParam])

  useEffect(() => {
    const currentCat = String(searchParams.get('categoryId') || '').trim()
    const currentSub = String(searchParams.get('subCategoryId') || '').trim()
    const next = new URLSearchParams(searchParams)

    const nextCat = String(selectedCategoryId || '').trim()
    const nextSub = String(selectedSubCategoryId || '').trim()

    if (nextCat) next.set('categoryId', nextCat)
    else next.delete('categoryId')

    if (nextSub) next.set('subCategoryId', nextSub)
    else next.delete('subCategoryId')

    const hasChange = currentCat !== nextCat || currentSub !== nextSub
    if (!hasChange) return

    setSearchParams(next, { replace: true })
  }, [searchParams, selectedCategoryId, selectedSubCategoryId, setSearchParams])

  const activeSubcategories = useMemo(() => {
    if (!selectedCategoryId) return subcategories
    return subcategories.filter((s) => String(s.category || s.categoryId || '') === String(selectedCategoryId))
  }, [selectedCategoryId, subcategories])

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
  }, [selectedCategoryId, selectedSubCategoryId, minPrice, maxPrice, sort, qParam])

  const filtered = useMemo(() => {
    const qLower = normalizeText(qParam)
    return products.filter((p) => {
      if (qLower) {
        const hay = [
          p.title,
          p.categoryName,
          p.subCategoryName,
          p.color,
          p.material,
        ]
          .map((x) => normalizeText(x))
          .filter(Boolean)
          .join(' ')
        if (!hay.includes(qLower)) return false
      }
      if (selectedCategoryId && String(p.categoryId) !== String(selectedCategoryId)) return false
      if (selectedSubCategoryId && String(p.subCategoryId) !== String(selectedSubCategoryId)) return false
      if (Number.isFinite(minPrice) && p.price < minPrice) return false
      if (Number.isFinite(maxPrice) && p.price > maxPrice) return false
      return true
    })
  }, [maxPrice, minPrice, products, qParam, selectedCategoryId, selectedSubCategoryId])

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
    const cat = selectedCategoryId ? (categories.find((c) => String(c._id || c.id) === String(selectedCategoryId))?.name || '') : ''
    const sub = selectedSubCategoryId
      ? (subcategories.find((s) => String(s._id || s.id) === String(selectedSubCategoryId))?.name || '')
      : ''
    if (cat) chips.push({ key: 'cat', label: cat, onClear: () => setSelectedCategoryId('') })
    if (sub) chips.push({ key: 'sub', label: sub, onClear: () => setSelectedSubCategoryId('') })
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
  }, [categories, maxPrice, minPrice, priceBounds.max, priceBounds.min, selectedCategoryId, selectedSubCategoryId, subcategories])

  const onSubmitSearch = (e) => {
    e.preventDefault()
    const next = String(q || '').trim()
    const params = new URLSearchParams(searchParams)
    if (next) params.set('q', next)
    else params.delete('q')
    setSearchParams(params)
  }

  const clearAll = () => {
    setSelectedCategoryId('')
    setSelectedSubCategoryId('')
    setSort('default')
    setMinPrice(priceBounds.min)
    setMaxPrice(priceBounds.max)
    const params = new URLSearchParams(searchParams)
    params.delete('categoryId')
    params.delete('subCategoryId')
    setSearchParams(params, { replace: true })
  }

  const FilterBox = ({ className = '' }) => (
    <div className={`rounded-xl bg-white p-5 ring-1 ring-gray-200 ${className}`.trim()}>
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
            {categories.map((c) => {
              const id = String(c?._id || c?.id || '')
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(id)
                    setSelectedSubCategoryId('')
                  }}
                  className={`block w-full text-left hover:text-gray-900 ${selectedCategoryId === id ? 'text-[#0f2e40]' : ''}`}
                >
                  {c.name}
                </button>
              )
            })}
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
            {activeSubcategories.map((s) => {
              const id = String(s?._id || s?.id || '')
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedSubCategoryId(id)}
                  className={`block w-full text-left hover:text-gray-900 ${selectedSubCategoryId === id ? 'text-[#0f2e40]' : ''}`}
                >
                  {s.name}
                </button>
              )
            })}
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
  )

  return (
    <div className="bg-white">
      <div className="w-full px-8 py-10 sm:px-12 md:px-8 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="hidden lg:block lg:col-span-3">
            <FilterBox />
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

            <div className="lg:hidden mb-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((v) => !v)}
                className="flex h-11 w-full items-center  justify-between rounded-lg bg-white px-4 text-sm font-semibold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50"
                aria-expanded={mobileFiltersOpen}
              >
                <span>Filters</span>
                <span className="text-gray-700">{mobileFiltersOpen ? '▴' : '▾'}</span>
              </button>
              {mobileFiltersOpen ? <div className="mt-4"><FilterBox /></div> : null}
            </div>

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

            {loadError ? (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {loadError}
              </div>
            ) : null}
            {loading ? (
              <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 ring-1 ring-gray-200">
                Loading products...
              </div>
            ) : null}

            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
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

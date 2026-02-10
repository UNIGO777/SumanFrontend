import { ChevronDown, Heart, MapPin, Menu, Search, ShoppingCart, Store, User } from 'lucide-react'
import LOGO from '../../assets/LOGO.png'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { getJson } from '../../AdminPanel/services/apiClient.js'

const CART_KEY = 'sj_cart_v1'

const readCartCount = () => {
  if (typeof window === 'undefined') return 0
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    const items = Array.isArray(parsed?.items) ? parsed.items : []
    return items.reduce((sum, it) => sum + (Number.parseInt(it?.qty, 10) || 1), 0)
  } catch {
    return 0
  }
}

const buildSearchHref = ({ q, categoryId, subCategoryId }) => {
  const params = new URLSearchParams()
  const qValue = String(q || '').trim()
  const catValue = String(categoryId || '').trim()
  const subValue = String(subCategoryId || '').trim()
  if (qValue) params.set('q', qValue)
  if (catValue) params.set('categoryId', catValue)
  if (subValue) params.set('subCategoryId', subValue)
  const qs = params.toString()
  return qs ? `/search?${qs}` : '/search'
}

export default function Navbar({
  promoText = 'Flat 150 Off on Silver Jewellery. Use: FLAT150',
  brandText = 'GIV',
  cartCount,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const initialCount = useMemo(() => (Number.isFinite(cartCount) ? cartCount : readCartCount()), [cartCount])
  const [count, setCount] = useState(initialCount)
  const [searchText, setSearchText] = useState('')
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const isSearchPage = String(location?.pathname || '').startsWith('/search')

  const goSearch = () => {
    const q = String(searchText || '').trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  useEffect(() => {
    let active = true
    Promise.all([getJson('/api/categories', { page: 1, limit: 200, isActive: true }), getJson('/api/subcategories', { page: 1, limit: 500, isActive: true })])
      .then(([catsRes, subsRes]) => {
        if (!active) return
        const cats = Array.isArray(catsRes?.data) ? catsRes.data : []
        const subs = Array.isArray(subsRes?.data) ? subsRes.data : []
        setCategories(cats)
        setSubcategories(subs)
      })
      .catch(() => {
        if (!active) return
        setCategories([])
        setSubcategories([])
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const onCustom = () => setCount(readCartCount())
    const onStorage = (e) => {
      if (e?.key && e.key !== CART_KEY) return
      setCount(readCartCount())
    }
    window.addEventListener('sj_cart_updated', onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('sj_cart_updated', onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const showBadge = Number.isFinite(count) && count > 0
  const badgeText = count > 9 ? '9+' : String(count)

  const categoriesSorted = useMemo(() => {
    const arr = Array.isArray(categories) ? categories.slice() : []
    arr.sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')))
    return arr
  }, [categories])

  const subByCategoryId = useMemo(() => {
    const m = new Map()
    const subs = Array.isArray(subcategories) ? subcategories : []
    subs.forEach((s) => {
      const catId = String(s?.category || s?.categoryId || '')
      if (!catId) return
      const current = m.get(catId) || []
      current.push(s)
      m.set(catId, current)
    })
    for (const [k, v] of m.entries()) {
      v.sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')))
      m.set(k, v)
    }
    return m
  }, [subcategories])

  const topCategories = useMemo(() => categoriesSorted.slice(0, 9), [categoriesSorted])
  const moreCategories = useMemo(() => categoriesSorted.slice(9), [categoriesSorted])

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="primary-bg h-10 w-full px-4 text-white">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-center text-center text-sm tracking-wide">
          {promoText}
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="mx-auto  px-5 md:px-10">
          <div className="flex h-16 items-center justify-between md:hidden">
            <div className="flex items-center gap-3">
              <button type="button" className="p-2 text-gray-900">
                <Menu className="h-6 w-6" />
              </button>
              <div className="text-3xl font-semibold tracking-widest text-gray-900">
                <img src={LOGO} alt={brandText} className="h-12 w-auto" />
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-900">
              <button type="button" className="p-2">
                <Store className="h-6 w-6" />
              </button>
              <Link to="/wishlist" className="p-2">
                <Heart className="h-6 w-6" />
              </Link>
              <Link to="/cart" className="relative p-2">
                <ShoppingCart className="h-6 w-6" />
                {showBadge ? (
                  <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-semibold text-white">
                    {badgeText}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              className="flex w-full items-center gap-2 py-3 text-sm text-gray-900"
            >
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">Update Delivery Pincode</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {!isSearchPage ? (
              <div className="pb-4">
                <div className="relative">
                  <input
                    className="h-12 w-full rounded-md border border-gray-300 bg-white px-4 pr-12 text-base text-gray-900 outline-none focus:border-gray-400"
                    placeholder='Search "Gifts For Her"'
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') goSearch()
                    }}
                  />
                  <button
                    type="button"
                    onClick={goSearch}
                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-gray-700 hover:bg-gray-50"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden md:block">
            <div className="flex h-20 items-center gap-6">
              <Link to="/" className="flex items-center gap-3">
                <img src={LOGO} alt={brandText} className="h-16 w-auto" />
              </Link>

              

              {!isSearchPage ? (
                <div className="flex-1">
                  <div className="relative">
                    <input
                      className="h-11 w-full rounded-md border border-gray-300 bg-white px-4 pr-12 text-sm text-gray-900 outline-none focus:border-gray-400"
                      placeholder='Search "Pure Gold Jewellery"'
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') goSearch()
                      }}
                    />
                    <button
                      type="button"
                      onClick={goSearch}
                      className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-gray-700 hover:bg-gray-50"
                      aria-label="Search"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1" />
              )}

              <div className="flex items-center gap-6">
                
                
                <Link to="/wishlist" className="flex flex-col items-center gap-1 text-gray-800">
                  <Heart className="h-6 w-6" />
                  <span className="text-[10px] font-semibold tracking-wider">WISHLIST</span>
                </Link>
                <Link to="/cart" className="relative flex flex-col items-center gap-1 text-gray-800">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-[10px] font-semibold tracking-wider">CART</span>
                  {showBadge ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full primary-bg px-1 text-xs font-semibold text-white">
                      {badgeText}
                    </span>
                  ) : null}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="hidden border-b border-gray-200 md:block">
        <div className="mx-auto  px-10">
          <div className="flex h-11 items-center justify-center gap-10 text-[11px] font-medium text-gray-700">
            {topCategories.map((c) => {
              const id = String(c?._id || c?.id || '')
              const subs = id ? subByCategoryId.get(id) || [] : []
              const hasSubs = subs.length > 0
              const href = buildSearchHref({ categoryId: id })
              return (
                <div key={id} className="group relative">
                  <Link
                    to={href}
                    className="flex items-center gap-1 text-xs transition-transform hover:scale-[1.1] hover:text-black"
                  >
                    {c?.name || 'Category'}
                    {hasSubs ? <ChevronDown className="h-3.5 w-3.5" /> : null}
                  </Link>
                  {hasSubs ? (
                    <div className="invisible absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl bg-white p-2 opacity-0 shadow-xl ring-1 ring-gray-200 transition-all group-hover:visible group-hover:opacity-100">
                      <div className="max-h-80 overflow-auto">
                        {subs.map((s) => {
                          const subId = String(s?._id || s?.id || '')
                          const subHref = buildSearchHref({ categoryId: id, subCategoryId: subId })
                          return (
                            <Link
                              key={subId}
                              to={subHref}
                              className="block rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                              {s?.name || 'Subcategory'}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}

            {moreCategories.length ? (
              <div className="group relative">
                <Link
                  to="/search"
                  className="flex items-center gap-1 text-xs transition-transform hover:scale-[1.1] hover:text-black"
                >
                  More
                  <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                <div className="invisible absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-xl bg-white p-2 opacity-0 shadow-xl ring-1 ring-gray-200 transition-all group-hover:visible group-hover:opacity-100">
                  <div className="max-h-80 overflow-auto">
                    {moreCategories.map((c) => {
                      const id = String(c?._id || c?.id || '')
                      const subs = id ? subByCategoryId.get(id) || [] : []
                      const href = buildSearchHref({ categoryId: id })
                      return (
                        <div key={id} className="group/item relative">
                          <Link
                            to={href}
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                          >
                            <span className="truncate">{c?.name || 'Category'}</span>
                            {subs.length ? <ChevronDown className="h-3.5 w-3.5 opacity-70" /> : null}
                          </Link>
                          {subs.length ? (
                            <div className="invisible absolute left-full top-0 z-50 ml-2 w-64 rounded-xl bg-white p-2 opacity-0 shadow-xl ring-1 ring-gray-200 transition-all group-hover/item:visible group-hover/item:opacity-100">
                              <div className="max-h-80 overflow-auto">
                                {subs.map((s) => {
                                  const subId = String(s?._id || s?.id || '')
                                  const subHref = buildSearchHref({ categoryId: id, subCategoryId: subId })
                                  return (
                                    <Link
                                      key={subId}
                                      to={subHref}
                                      className="block rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                                    >
                                      {s?.name || 'Subcategory'}
                                    </Link>
                                  )
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  )
}

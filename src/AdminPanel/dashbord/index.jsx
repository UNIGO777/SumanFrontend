import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import AdminLogin from './Login.jsx'
import { useMemo, useState } from 'react'
import AdminCategories from './Categories.jsx'
import AdminSubcategories from './Subcategories.jsx'
import AdminProductsNew from './ProductsNew.jsx'
import AdminProductsList from './ProductsList.jsx'
import AdminSilverPrice from './SilverPrice.jsx'
import AdminSpecialOccasionCms from './SpecialOccasionCms.jsx'
import AdminOrders, { AdminOrderDetail } from './Orders.jsx'
import HomeHeroPromosCms from './cms/HomeHeroPromosCms.jsx'
import ItemPanelCms from './cms/ItemPanelCms.jsx'
import RecipientPanelCms from './cms/RecipientPanelCms.jsx'
import HomeLaunchBannersCms from './cms/HomeLaunchBannersCms.jsx'
import HomeOccasionCms from './cms/HomeOccasionCms.jsx'
import HomeEssentialsCms from './cms/HomeEssentialsCms.jsx'
import HomeLatestCollectionsCms from './cms/HomeLatestCollectionsCms.jsx'
import HomeInternationalShippingCms from './cms/HomeInternationalShippingCms.jsx'

function RequireAdmin({ children }) {
  const token = window.localStorage.getItem('admin_token') || window.sessionStorage.getItem('admin_token')
  if (!token) return <Navigate to="/admin/login" replace />
  return children
}

function AdminStub({ title }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      <div className="mt-2 text-sm text-gray-600">Coming soon</div>
    </div>
  )
}

function AdminLayout() {
  const [open, setOpen] = useState({ category: false, product: false, cms: false })

  const linkBase = useMemo(
    () =>
      'group flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-colors',
    []
  )

  const linkCls = ({ isActive }) =>
    `${linkBase} ${
      isActive
        ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`

  const subLinkBase = useMemo(
    () =>
      'block rounded-md border border-transparent px-3 py-2 text-[13px] font-medium transition-colors',
    []
  )
  const subLinkCls = ({ isActive }) =>
    `${subLinkBase} ${
      isActive
        ? 'bg-white/15 text-white ring-1 ring-white/10'
        : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="primary-bg hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-72 md:flex-col md:text-white md:z-40 md:shadow-xl md:ring-1 md:ring-black/10">
        <div className="px-4 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-bold tracking-wider ring-1 ring-white/15">
              SJ
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold tracking-wide">Admin Panel</div>
              <div className="truncate text-xs text-white/70">Manage catalog and orders</div>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6 pr-3">
          <div className="space-y-2">
            <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-white/60">Overview</div>
            <NavLink to="/admin/dashboard" className={linkCls}>
              <span>Dashboard</span>
              <span className="text-xs text-white/40 group-hover:text-white/60">→</span>
            </NavLink>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-white/60">Catalog</div>
            <button
              type="button"
              onClick={() => setOpen((v) => ({ ...v, category: !v.category }))}
              className={`${linkBase} text-white/80 hover:bg-white/10 hover:text-white`}
            >
              <span>Category</span>
              <span className={`text-xs transition-transform ${open.category ? 'rotate-90' : ''}`}>›</span>
            </button>
            {open.category ? (
              <div className="space-y-1 pl-2">
                <NavLink to="/admin/categories" className={subLinkCls}>
                  Category
                </NavLink>
                <NavLink to="/admin/subcategories" className={subLinkCls}>
                  Subcategory
                </NavLink>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setOpen((v) => ({ ...v, product: !v.product }))}
              className={`${linkBase} text-white/80 hover:bg-white/10 hover:text-white`}
            >
              <span>Product</span>
              <span className={`text-xs transition-transform ${open.product ? 'rotate-90' : ''}`}>›</span>
            </button>
            {open.product ? (
              <div className="space-y-1 pl-2">
                <NavLink to="/admin/products/new" className={subLinkCls}>
                  Add New Product
                </NavLink>
                <NavLink to="/admin/products" className={subLinkCls} end>
                  All Product
                </NavLink>
                <NavLink to="/admin/products/active" className={subLinkCls}>
                  Active Product
                </NavLink>
              </div>
            ) : null}

            <NavLink to="/admin/orders" className={linkCls}>
              <span>Orders</span>
              <span className="text-xs text-white/40 group-hover:text-white/60">→</span>
            </NavLink>

            <NavLink to="/admin/silver-price" className={linkCls}>
              <span>92.5 Silver Price</span>
              <span className="text-xs text-white/40 group-hover:text-white/60">→</span>
            </NavLink>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-white/60">CMS</div>
            <button
              type="button"
              onClick={() => setOpen((v) => ({ ...v, cms: !v.cms }))}
              className={`${linkBase} text-white/80 hover:bg-white/10 hover:text-white`}
            >
              <span>CMS Sections</span>
              <span className={`text-xs transition-transform ${open.cms ? 'rotate-90' : ''}`}>›</span>
            </button>
            {open.cms ? (
              <div className="space-y-1 pl-2">
                <NavLink to="/admin/cms/special-occasion" className={subLinkCls}>
                  Special Occasion
                </NavLink>
                <NavLink to="/admin/cms/home-hero-promos" className={subLinkCls}>
                  Home Hero Promos
                </NavLink>
                <NavLink to="/admin/cms/home-item-panel" className={subLinkCls}>
                  Home Item Panel
                </NavLink>
                <NavLink to="/admin/cms/home-recipient-panel" className={subLinkCls}>
                  Home Recipient Panel
                </NavLink>
                <NavLink to="/admin/cms/home-latest-collections" className={subLinkCls}>
                  Home Latest Collections
                </NavLink>
                <NavLink to="/admin/cms/home-launch-banners" className={subLinkCls}>
                  Home Launch Banners
                </NavLink>
                <NavLink to="/admin/cms/home-occasion" className={subLinkCls}>
                  Home Occasion
                </NavLink>
                <NavLink to="/admin/cms/home-essentials" className={subLinkCls}>
                  Home Essentials
                </NavLink>
                <NavLink to="/admin/cms/home-international-shipping" className={subLinkCls}>
                  Home International Shipping
                </NavLink>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="border-t border-white/10 px-4 py-4 text-xs text-white/60">© {new Date().getFullYear()} Suman Jwellaries</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-72">
        <div className="primary-bg flex h-14 items-center justify-between px-4 text-white md:hidden">
          <div className="text-sm font-semibold tracking-wide">Admin Panel</div>
          <NavLink to="/admin/dashboard" className="text-xs font-semibold text-white/90 hover:text-white">
            Dashboard
          </NavLink>
        </div>

        <main className="mx-auto w-full px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function AdminPanelRoutes() {
  return (
    <Routes>
      <Route index element={<AdminLogin />} />
      <Route path="login" element={<AdminLogin />} />

      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path="dashboard" element={<AdminStub title="Dashboard" />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="subcategories" element={<AdminSubcategories />} />
        <Route path="products/new" element={<AdminProductsNew />} />
        <Route path="products" element={<AdminProductsList />} />
        <Route path="products/active" element={<AdminProductsList activeOnly />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="silver-price" element={<AdminSilverPrice />} />
        <Route path="cms/special-occasion" element={<AdminSpecialOccasionCms />} />
        <Route path="cms/home-hero-promos" element={<HomeHeroPromosCms />} />
        <Route path="cms/home-item-panel" element={<ItemPanelCms />} />
        <Route path="cms/home-recipient-panel" element={<RecipientPanelCms />} />
        <Route path="cms/home-latest-collections" element={<HomeLatestCollectionsCms />} />
        <Route path="cms/home-launch-banners" element={<HomeLaunchBannersCms />} />
        <Route path="cms/home-occasion" element={<HomeOccasionCms />} />
        <Route path="cms/home-essentials" element={<HomeEssentialsCms />} />
        <Route path="cms/home-international-shipping" element={<HomeInternationalShippingCms />} />
      </Route>

      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  )
}

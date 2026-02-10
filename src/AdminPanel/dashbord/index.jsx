import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import AdminLogin from './Login.jsx'
import { useMemo, useState } from 'react'
import AdminCategories from './Categories.jsx'
import AdminSubcategories from './Subcategories.jsx'
import AdminProductsNew from './ProductsNew.jsx'
import AdminProductsList from './ProductsList.jsx'
import AdminSilverPrice from './SilverPrice.jsx'
import AdminSpecialOccasionCms from './SpecialOccasionCms.jsx'

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
  const [open, setOpen] = useState({ category: true, product: true, cms: true })

  const linkBase = useMemo(
    () => 'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    []
  )

  const linkCls = ({ isActive }) =>
    `${linkBase} ${isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`

  const subLinkBase = useMemo(
    () => 'block rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
    []
  )
  const subLinkCls = ({ isActive }) =>
    `${subLinkBase} ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <aside className="primary-bg hidden w-72 shrink-0 flex-col px-4 py-6 text-white md:flex">
          <div className="px-2">
            <div className="text-lg font-semibold tracking-wide">Admin Panel</div>
            <div className="mt-1 text-xs text-white/70">Manage catalog and orders</div>
          </div>

          <nav className="mt-6 space-y-2">
            <NavLink to="/admin/dashboard" className={linkCls}>
              <span>Dashboard</span>
            </NavLink>

            <button
              type="button"
              onClick={() => setOpen((v) => ({ ...v, category: !v.category }))}
              className={`${linkBase} text-white/80 hover:bg-white/10 hover:text-white`}
            >
              <span>Category</span>
              <span className="text-xs">{open.category ? '—' : '+'}</span>
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
              <span className="text-xs">{open.product ? '—' : '+'}</span>
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
            </NavLink>

            <NavLink to="/admin/silver-price" className={linkCls}>
              <span>92.5 Silver Price</span>
            </NavLink>

            <button
              type="button"
              onClick={() => setOpen((v) => ({ ...v, cms: !v.cms }))}
              className={`${linkBase} text-white/80 hover:bg-white/10 hover:text-white`}
            >
              <span>CMS</span>
              <span className="text-xs">{open.cms ? '—' : '+'}</span>
            </button>
            {open.cms ? (
              <div className="space-y-1 pl-2">
                <NavLink to="/admin/cms/special-occasion" className={subLinkCls}>
                  Special Occasion
                </NavLink>
                <NavLink to="/admin/cms/home-hero-promos" className={subLinkCls}>
                  Home Hero Promos
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
                <NavLink to="/admin/cms/home-international-shipping" className={subLinkCls}>
                  Home International Shipping
                </NavLink>
              </div>
            ) : null}
          </nav>

          <div className="mt-auto px-2 pt-8 text-xs text-white/60">© {new Date().getFullYear()} Suman Jwellaries</div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="primary-bg flex h-14 items-center justify-between px-4 text-white md:hidden">
            <div className="text-sm font-semibold tracking-wide">Admin Panel</div>
            <NavLink to="/admin/dashboard" className="text-xs font-semibold text-white/90 hover:text-white">
              Dashboard
            </NavLink>
          </div>

          <main className="mx-auto w-full  px-10 py-8">
            <Outlet />
          </main>
        </div>
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
        <Route path="orders" element={<AdminStub title="Orders" />} />
        <Route path="silver-price" element={<AdminSilverPrice />} />
        <Route path="cms/special-occasion" element={<AdminSpecialOccasionCms />} />
        <Route path="cms/home-hero-promos" element={<AdminStub title="Home Hero Promos" />} />
        <Route path="cms/home-latest-collections" element={<AdminStub title="Home Latest Collections" />} />
        <Route path="cms/home-launch-banners" element={<AdminStub title="Home Launch Banners" />} />
        <Route path="cms/home-occasion" element={<AdminStub title="Home Occasion" />} />
        <Route path="cms/home-international-shipping" element={<AdminStub title="Home International Shipping" />} />
      </Route>

      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  )
}

import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import AdminLogin from './Login.jsx'
import AdminDashboard from './dashbord/index.jsx'
import { useMemo, useState } from 'react'
import AdminCategories from './Categories.jsx'
import AdminSubcategories from './Subcategories.jsx'
import AdminProductsNew from './ProductsNew.jsx'
import AdminProductsList from './ProductsList.jsx'

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
  const [open, setOpen] = useState({ category: true, product: true })

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

          <main className="mx-auto w-full max-w-6xl px-4 py-8">
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
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="subcategories" element={<AdminSubcategories />} />
        <Route path="products/new" element={<AdminProductsNew />} />
        <Route path="products" element={<AdminProductsList />} />
        <Route path="products/active" element={<AdminProductsList activeOnly />} />
        <Route path="orders" element={<AdminStub title="Orders" />} />
      </Route>

      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  )
}

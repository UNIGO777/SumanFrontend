import './index.css'
import AdminPanel from './AdminPanel/dashbord/index.jsx'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './Userpanel/components/Navbar.jsx'
import Footer from './Userpanel/components/Footer.jsx'
import Userpanel from './Userpanel/index.jsx'
import CartPage from './Userpanel/pages/CartPage.jsx'
import Wishlist from './Userpanel/pages/Wishlist.jsx'
import ProductProfile from './Userpanel/pages/ProductProfile.jsx'
import Checkout from './Userpanel/pages/Checkout.jsx'
import SearchPage from './Userpanel/pages/SearchPage.jsx'
import TermsAndConditions from './Userpanel/pages/TermsAndConditions.jsx'
import Policies from './Userpanel/pages/Policies.jsx'
import RefundPolicy from './Userpanel/pages/RefundPolicy.jsx'
import PrivacyPolicy from './Userpanel/pages/PrivacyPolicy.jsx'
import ReturnPolicy from './Userpanel/pages/ReturnPolicy.jsx'
import ShippingPolicy from './Userpanel/pages/ShippingPolicy.jsx'
import TrackOrder from './Userpanel/pages/TrackOrder.jsx'
import { useEffect } from 'react'

function UserLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search, location.hash])

  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Userpanel />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="product/:productKey" element={<ProductProfile />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="policies" element={<Policies />} />
          <Route path="refund-policy" element={<RefundPolicy />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="return-policy" element={<ReturnPolicy />} />
          <Route path="shipping-policy" element={<ShippingPolicy />} />
          <Route path="track-order" element={<TrackOrder />} />
        </Route>
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App

import './index.css'
import AdminPanel from './AdminPanel/dashbord/index.jsx'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Navbar from './Userpanel/components/Navbar.jsx'
import Footer from './Userpanel/components/Footer.jsx'
import Userpanel from './Userpanel/index.jsx'
import CartPage from './Userpanel/pages/CartPage.jsx'
import Wishlist from './Userpanel/pages/Wishlist.jsx'
import ProductProfile from './Userpanel/pages/ProductProfile.jsx'
import Checkout from './Userpanel/pages/Checkout.jsx'

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

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Userpanel />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="product/:productKey" element={<ProductProfile />} />
        <Route path="checkout" element={<Checkout />} />
      </Route>
      <Route path="/admin/*" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

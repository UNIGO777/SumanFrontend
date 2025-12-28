import { ChevronDown, Heart, MapPin, Menu, Search, ShoppingCart, Store, User } from 'lucide-react'
import LOGO from '../../assets/LOGO.png'

const desktopLinks = [
  { label: 'Shop by Category', href: '#' },
  { label: 'SALE is Live', href: '#' },
  { label: 'Fresh Drops', href: '#' },
  { label: 'Gold with Lab Diamonds', href: '#' },
  { label: 'GIVA Gift Card', href: '#' },
  { label: 'Gift Store', href: '#' },
  { label: 'Men in Silver', href: '#' },
  { label: 'Exclusive Collections', href: '#' },
  { label: 'More at GIVA', href: '#', chevron: true },
  { label: 'More at GIVA', href: '#', chevron: true },
  { label: 'More at GIVA', href: '#', chevron: true },
]

export default function Navbar({
  promoText = 'Flat 150 Off on Silver Jewellery. Use: FLAT150',
  brandText = 'GIV',
  cartCount = 2,
}) {
  const showBadge = Number.isFinite(cartCount) && cartCount > 0
  const badgeText = cartCount > 9 ? '9+' : String(cartCount)

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="primary-bg h-10 w-full px-4 text-white">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-center text-center text-sm tracking-wide">
          {promoText}
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="mx-auto  px-10">
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
              <button type="button" className="p-2">
                <Heart className="h-6 w-6" />
              </button>
              <button type="button" className="relative p-2">
                <ShoppingCart className="h-6 w-6" />
                {showBadge ? (
                  <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-semibold text-white">
                    {badgeText}
                  </span>
                ) : null}
              </button>
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

            <div className="pb-4">
              <div className="relative">
                <input
                  className="h-12 w-full rounded-md border border-gray-300 bg-white px-4 pr-12 text-base text-gray-900 outline-none focus:border-gray-400"
                  placeholder='Search "Gifts For Her"'
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-700">
                  <Search className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex h-20 items-center gap-6">
              <img src={LOGO} alt={brandText} className="h-16 w-auto" />

              

              <div className="flex-1">
                <div className="relative">
                  <input
                    className="h-11 w-full rounded-md border border-gray-300 bg-white px-4 pr-12 text-sm text-gray-900 outline-none focus:border-gray-400"
                    placeholder='Search "Pure Gold Jewellery"'
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-700">
                    <Search className="h-5 w-5" />
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                
                
                <button type="button" className="flex flex-col items-center gap-1 text-gray-800">
                  <Heart className="h-6 w-6" />
                  <span className="text-[10px] font-semibold tracking-wider">WISHLIST</span>
                </button>
                <button type="button" className="relative flex flex-col items-center gap-1 text-gray-800">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-[10px] font-semibold tracking-wider">CART</span>
                  {showBadge ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full primary-bg px-1 text-xs font-semibold text-white">
                      {badgeText}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="hidden border-b border-gray-200 md:block">
        <div className="mx-auto  px-10">
          <div className="flex h-11 items-center justify-center gap-10 text-[11px] font-medium text-gray-700">
            {desktopLinks.map((link, idx) => (
              <a
                key={`${link.label}-${idx}`}
                href={link.href}
                className="flex items-center gap-1 hover:text-black hover:scale-[1.1] transition-transform text-xs"
              >
                {link.label}
                {link.chevron ? <ChevronDown className="h-3.5 w-3.5" /> : null}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}

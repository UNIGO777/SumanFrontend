import { Heart, Star } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function ProductCard({
  images,
  imageUrl,
  title,
  price,
  originalPrice,
  rating,
  ratingCount,
  couponText,
  ctaText = 'Add to Cart',
  showBestseller = false,
  bestsellerText = 'Bestseller',
  showWishlist = true,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  className = '',
}) {
  const [isHovered, setIsHovered] = useState(false)
  const formatter = useMemo(() => new Intl.NumberFormat('en-IN'), [])

  const showOriginal = Number.isFinite(originalPrice) && Number.isFinite(price) && originalPrice > price
  const showRating = Number.isFinite(rating) && Number.isFinite(ratingCount)

  const coverUrl = images?.[0] || imageUrl
  const hoverUrl = images?.[1]
  const activeUrl = isHovered && hoverUrl ? hoverUrl : coverUrl

  return (
    <div className={`w-full max-w-[460px] ${className} cursor-pointer`}>
      <div className="overflow-hidden   bg-white">
        <div className="relative bg-white">
          <div
            className="flex h-[380px] w-full items-center overflow-hidden justify-center bg-white"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img
              src={activeUrl}
              alt={title || 'Product image'}
              className="h-full w-full hover:scale-[1.1] object-cover transition-all duration-300 "
              loading="lazy"
            />
          </div>

          {showBestseller ? (
            <div
              className="absolute left-0 top-4 px-5 py-2 text-sm font-semibold tracking-wide text-white"
              style={{
                backgroundColor: '#0f2e40',
                clipPath: 'polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)',
              }}
            >
              {bestsellerText}
            </div>
          ) : null}

          {showWishlist ? (
            <button
              type="button"
              aria-label="Wishlist"
              onClick={onToggleWishlist}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-sm ring-1 ring-gray-200"
            >
              <Heart
                className={`h-5 w-5 ${isWishlisted ? 'text-pink-500' : 'text-black'}`}
                strokeWidth={2}
                fill={isWishlisted ? 'currentColor' : 'none'}
              />
            </button>
          ) : null}

          {showRating ? (
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-gray-100/95 px-3 py-2 text-sm font-semibold text-gray-800">
              <span className="flex items-center gap-1">
                {rating}
                <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{formatter.format(ratingCount)}</span>
            </div>
          ) : null}
        </div>

        <div className="space-y-3 px-4 pb-4 pt-4 text-left">
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-gray-900">₹{formatter.format(price || 0)}</div>
            {showOriginal ? (
              <div className="pb-1 text-lg font-semibold text-gray-500 line-through">
                ₹{formatter.format(originalPrice)}
              </div>
            ) : null}
          </div>

          <div className="text-lg font-medium leading-tight text-gray-500">{title}</div>

          {couponText ? (
            <div className="text-sm font-semibold text-[#0f2e40] underline">{couponText}</div>
          ) : null}

          <button
            type="button"
            onClick={onAddToCart}
            className="w-full rounded-xl bg-gradient-to-r hover:scale-[1.1] from-[#0f2e40] to-[#1e4a5f] py-2 text-center text-md font-medium text-white transition-all duration-300 hover:from-[#1e4a5f] hover:to-[#0f2e40] hover:shadow-lg cursor-pointer"
          >
            {ctaText}
          </button>
        </div>
      </div>
    </div>
  )
}

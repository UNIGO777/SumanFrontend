import ProductCard from '../../../components/ProductCard.jsx'

export default function HomeMostGiftedSection() {
  const mostGiftedProducts = [
    {
      id: 'mg-1',
      showBestseller: true,
      images: ['https://www.giva.co/cdn/shop/files/BR01247_1.jpg?v=1743681996&width=1346'],
      rating: 4.8,
      ratingCount: 337,
      price: 4799,
      originalPrice: 8399,
      title: 'Silver Classic Solitaire Ring',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'mg-2',
      showBestseller: true,
      images: [
        'https://www.giva.co/cdn/shop/files/BR01247_2.jpg?v=1743681996&width=1346',
        'https://www.giva.co/cdn/shop/files/BR01247_1.jpg?v=1743681996&width=1346',
      ],
      rating: 4.9,
      ratingCount: 280,
      price: 3599,
      originalPrice: 5799,
      title: 'Anushka Sharma Silver Queens Necklace',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'mg-3',
      showBestseller: false,
      images: ['https://www.giva.co/cdn/shop/files/Personalised_Icon.webp?v=1766122556'],
      rating: 4.7,
      ratingCount: 453,
      price: 1399,
      originalPrice: 3099,
      title: 'Silver Love Like A Butterfly Studs',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'mg-4',
      showBestseller: false,
      images: ['https://www.giva.co/cdn/shop/files/Rings_Icon.webp?v=1766122556'],
      rating: 4.9,
      ratingCount: 297,
      price: 3899,
      originalPrice: 6199,
      title: 'Silver Drizzle Drop Pendant',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'mg-5',
      showBestseller: false,
      images: ['https://www.giva.co/cdn/shop/files/Bracelets_Icon.webp?v=1766122556'],
      rating: 4.8,
      ratingCount: 312,
      price: 3499,
      originalPrice: 5799,
      title: 'Rose Gold Princess Pendant',
      couponText: 'EXTRA 15% OFF with coupon',
    },
  ]

  return (
    <div className="mt-10">
      <section className="w-full">
        <div className="mb-6 text-center text-3xl font-bold text-gray-900">Most Gifted</div>

        <div className="w-full px-4 md:px-10">
          <div className="no-scrollbar flex gap-8 overflow-x-auto py-2">
            {mostGiftedProducts.map((p) => (
              <div key={p.id} className="w-[280px] shrink-0">
                <ProductCard {...p} className="max-w-none" />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="rounded-full border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
            >
              View More
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

import ProductCard from '../../../components/ProductCard.jsx'
import productImg1 from '../../../../assets/876 × 1628-1.png'
import productImg2 from '../../../../assets/876 × 1628-2.png'
import productImg3 from '../../../../assets/876 × 1628-3.png'
import productImg4 from '../../../../assets/876 × 1628-4.png'

export default function HomeValentineSpecialSection() {
  const imagesPool = [productImg1, productImg2, productImg3, productImg4]
  const pick = (i) => imagesPool[i % imagesPool.length]

  const valentineProducts = [
    {
      id: 'vs-1',
      showBestseller: true,
      images: [pick(0)],
      rating: 4.8,
      ratingCount: 112,
      price: 4999,
      originalPrice: 9699,
      title: 'Anushka Sharma Classic Silver Zircon Set',
      couponText: 'EXTRA 20% OFF with coupon',
    },
    {
      id: 'vs-2',
      showBestseller: true,
      images: [pick(1)],
      rating: 4.7,
      ratingCount: 175,
      price: 2899,
      originalPrice: 5299,
      title: 'Anushka Sharma Golden Blooming Flower Earrings',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'vs-3',
      showBestseller: true,
      images: [pick(2)],
      rating: 4.8,
      ratingCount: 196,
      price: 1199,
      originalPrice: 3299,
      title: 'Anushka Sharma Golden Crescent Zircon Studs',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'vs-4',
      showBestseller: true,
      images: [pick(3)],
      rating: 4.7,
      ratingCount: 189,
      price: 2699,
      originalPrice: 4899,
      title: 'Anushka Sharma Golden Gleam Dream Ring',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'vs-5',
      showBestseller: false,
      images: [pick(4)],
      rating: 4.6,
      ratingCount: 141,
      price: 1999,
      originalPrice: 3499,
      title: 'Silver Heart Pendant Necklace',
      couponText: 'EXTRA 10% OFF with coupon',
    },
    {
      id: 'vs-6',
      showBestseller: false,
      images: [pick(5)],
      rating: 4.8,
      ratingCount: 221,
      price: 1599,
      originalPrice: 2899,
      title: 'Silver Minimal Chain',
      couponText: 'EXTRA 10% OFF with coupon',
    },
    {
      id: 'vs-7',
      showBestseller: false,
      images: [pick(6)],
      rating: 4.7,
      ratingCount: 98,
      price: 2299,
      originalPrice: 3999,
      title: 'Silver Sparkle Ring',
      couponText: 'EXTRA 10% OFF with coupon',
    },
    {
      id: 'vs-8',
      showBestseller: false,
      images: [pick(7)],
      rating: 4.9,
      ratingCount: 164,
      price: 3199,
      originalPrice: 5599,
      title: 'Rose Gold Bracelet',
      couponText: 'EXTRA 10% OFF with coupon',
    },
    {
      id: 'vs-9',
      showBestseller: true,
      images: [pick(8)],
      rating: 4.8,
      ratingCount: 203,
      price: 1799,
      originalPrice: 2999,
      title: 'Silver Love Knot Necklace',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'vs-10',
      showBestseller: true,
      images: [pick(9)],
      rating: 4.7,
      ratingCount: 118,
      price: 2499,
      originalPrice: 4199,
      title: 'Silver Infinity Bracelet',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'vs-11',
      showBestseller: true,
      images: [pick(10)],
      rating: 4.8,
      ratingCount: 156,
      price: 2099,
      originalPrice: 3799,
      title: 'Personalised Initial Pendant',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'vs-12',
      showBestseller: true,
      images: [pick(11)],
      rating: 4.6,
      ratingCount: 87,
      price: 1499,
      originalPrice: 2799,
      title: 'Silver Charm Anklet',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'vs-13',
      showBestseller: false,
      images: [pick(12)],
      rating: 4.7,
      ratingCount: 132,
      price: 2699,
      originalPrice: 4899,
      title: 'Gold-Plated Hoop Earrings',
      couponText: 'EXTRA 10% OFF with coupon',
    },
    {
      id: 'vs-14',
      showBestseller: false,
      images: [pick(13)],
      rating: 4.8,
      ratingCount: 201,
      price: 1899,
      originalPrice: 3399,
      title: 'Silver Studs Set',
      couponText: 'EXTRA 10% OFF with coupon',
    },
    {
      id: 'vs-15',
      showBestseller: false,
      images: [pick(14)],
      rating: 4.6,
      ratingCount: 74,
      price: 3599,
      originalPrice: 6199,
      title: 'Silver Mangalsutra',
      couponText: 'EXTRA 10% OFF with coupon',
    },
    {
      id: 'vs-16',
      showBestseller: false,
      images: [pick(15)],
      rating: 4.9,
      ratingCount: 148,
      price: 3899,
      originalPrice: 6999,
      title: 'Silver Band Ring',
      couponText: 'EXTRA 10% OFF with coupon',
    },
    {
      id: 'vs-17',
      showBestseller: true,
      images: [pick(16)],
      rating: 4.8,
      ratingCount: 265,
      price: 2299,
      originalPrice: 3999,
      title: 'Silver Daisy Earrings',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'vs-18',
      showBestseller: true,
      images: [pick(17)],
      rating: 4.7,
      ratingCount: 178,
      price: 2799,
      originalPrice: 4999,
      title: 'Silver Sparkle Bracelet',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'vs-19',
      showBestseller: true,
      images: [pick(18)],
      rating: 4.8,
      ratingCount: 209,
      price: 1999,
      originalPrice: 3699,
      title: 'Silver Rose Pendant',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'vs-20',
      showBestseller: true,
      images: [pick(19)],
      rating: 4.7,
      ratingCount: 167,
      price: 3199,
      originalPrice: 5899,
      title: 'Silver Classic Solitaire Ring',
      couponText: 'EXTRA 15% OFF with coupon',
    },
    {
      id: 'vs-21',
      showBestseller: false,
      images: [pick(20)],
      rating: 4.6,
      ratingCount: 88,
      price: 1499,
      originalPrice: 2799,
      title: 'Silver Minimal Pendant',
      couponText: 'EXTRA 10% OFF with coupon',
    },
    {
      id: 'vs-22',
      showBestseller: false,
      images: [pick(21)],
      rating: 4.8,
      ratingCount: 143,
      price: 2599,
      originalPrice: 4599,
      title: 'Rose Gold Heart Ring',
      couponText: 'EXTRA 10% OFF with coupon',
    },
    {
      id: 'vs-23',
      showBestseller: false,
      images: [pick(22)],
      rating: 4.7,
      ratingCount: 121,
      price: 2899,
      originalPrice: 5299,
      title: 'Silver Necklace Set',
      couponText: 'EXTRA 10% OFF with coupon',
    },
    {
      id: 'vs-24',
      showBestseller: false,
      images: [pick(23)],
      rating: 4.9,
      ratingCount: 199,
      price: 3399,
      originalPrice: 6199,
      title: 'Silver Zircon Earrings',
      couponText: 'EXTRA 10% OFF with coupon',
    },
  ]

  return (
    <div className="mt-14">
      <section className="w-full">
        <div className="mb-6 text-center text-3xl font-bold text-gray-900">Valentine&apos;s Special</div>

        <div className="mx-auto max-w-[92vw]">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {valentineProducts.map((p) => (
              <ProductCard
                key={p.id}
                {...p}
                className="max-w-none"
                cardHeightClassName="h-[460px]"
                imageHeightClassName="h-[240px]"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

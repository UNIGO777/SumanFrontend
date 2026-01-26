import BestSellerPanel from '../../../components/BestSellerPanel.jsx'
import productImg1 from '../../../../assets/876 × 1628-1.png'
import productImg2 from '../../../../assets/876 × 1628-2.png'
import productImg3 from '../../../../assets/876 × 1628-3.png'
import productImg4 from '../../../../assets/876 × 1628-4.png'

export default function HomeBestSellerSection() {
  return (
    <div className="mt-12">
      <div className="mx-auto max-w-[92vw]">
        <BestSellerPanel
          products={[
            {
              showBestseller: true,
              images: [
                productImg1,
                productImg2,
              ],
              rating: 4.8,
              ratingCount: 326,
              price: 3799,
              originalPrice: 8399,
              title: 'Silver Classic Solitaire Ring',
              couponText: 'EXTRA 5% OFF with coupon',
            },
            {
              showBestseller: true,
              images: [
                productImg2,
                productImg1,
              ],
              rating: 4.8,
              ratingCount: 326,
              price: 3799,
              originalPrice: 8399,
              title: 'Silver Classic Solitaire Ring',
              couponText: 'EXTRA 5% OFF with coupon',
            },
            {
              images: [
                productImg3,
                productImg4,
              ],
              rating: 4.6,
              ratingCount: 112,
              price: 2199,
              originalPrice: 3999,
              title: 'Silver Minimal Pendant',
              couponText: 'EXTRA 5% OFF with coupon',
            },
            {
              showBestseller: false,
              images: [
                productImg4,
                productImg3,
              ],
              rating: 4.7,
              ratingCount: 84,
              price: 1599,
              originalPrice: 2999,
              title: 'Silver Everyday Ring',
              couponText: 'EXTRA 5% OFF with coupon',
            },
          ]}
        />
      </div>
    </div>
  )
}

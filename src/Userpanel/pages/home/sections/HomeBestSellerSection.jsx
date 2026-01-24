import BestSellerPanel from '../../../components/BestSellerPanel.jsx'

export default function HomeBestSellerSection() {
  return (
    <div className="mt-12">
      <div className="mx-auto max-w-[92vw]">
        <BestSellerPanel
          products={[
            {
              showBestseller: true,
              images: [
                'https://www.giva.co/cdn/shop/files/BR01247_1.jpg?v=1743681996&width=1346',
                'https://www.giva.co/cdn/shop/files/BR01247_2.jpg?v=1743681996&width=1346',
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
                'https://www.giva.co/cdn/shop/files/BR01247_1.jpg?v=1743681996&width=1346',
                'https://www.giva.co/cdn/shop/files/BR01247_2.jpg?v=1743681996&width=1346',
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
                'https://www.giva.co/cdn/shop/files/Personalised_Icon.webp?v=1766122556',
                'https://www.giva.co/cdn/shop/files/Silver_Chains_Icon.webp?v=1766122556',
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
                'https://www.giva.co/cdn/shop/files/Rings_Icon.webp?v=1766122556',
                'https://www.giva.co/cdn/shop/files/Bracelets_Icon.webp?v=1766122556',
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

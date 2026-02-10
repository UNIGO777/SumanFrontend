import { useMemo } from 'react'
import recipientLeft from '../../assets/ShopByRecipient Left.png'
import recipientRight from '../../assets/Shop By Recipient Right.png'
import { Link } from 'react-router-dom'

export default function RecipientPanel({ title = 'Shop By Recipient' }) {
  const items = useMemo(
    () => [
      {
        label: 'Gifts for Him',
        img: recipientLeft,
        href: '/search/gifts-for-him',
      },
      {
        label: 'Gifts for Her',
        img: recipientRight,
        href: '/search/gifts-for-her',
      },
    ],
    []
  )

  return (
    <section className="w-full">
      <div className="mb-6 text-center text-2xl font-semibold text-gray-900">{title}</div>
      <div className="mb-6 text-center text-sm font-medium text-gray-600">
        Find the perfect gift for your loved one, whether it&apos;s a special occasion or a regular gift.
      </div>
      <div className="mx-auto grid max-w-[94vw] grid-cols-1 gap-8 sm:max-w-[80vw] sm:grid-cols-2 sm:gap-10">
        {items.map((it) => (
          <Link
            key={it.label}
            to={it.href}
            className="relative block overflow-hidden rounded-[44px]"
          >
            <div className="flex items-end justify-center px-4 pt-4 sm:px-6 sm:pt-6">
              <img src={it.img} alt={it.label} className="h-full w-full object-contain" loading="lazy" />
            </div>
            <div>
              <h2 className="mt-5 text-center text-2xl font-semibold text-black">{it.label}</h2>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

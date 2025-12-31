import { useMemo } from 'react'

export default function RecipientPanel({ title = 'Shop By Recipient' }) {
  const items = useMemo(
    () => [
      {
        label: 'Gifts for Her',
        img: 'https://www.giva.co/cdn/shop/files/Him_11.webp?v=1767013611&width=3840',
      },
      {
        label: 'Gifts for Him',
        img: 'https://www.giva.co/cdn/shop/files/Her_9_1.webp?v=1767013610&width=3840',
      },
    ],
    []
  )

  return (
    <section className="w-full">
      <div className="mb-6 text-center text-2xl font-semibold text-gray-900">{title}</div>
      <div className="mx-auto grid max-w-[80vw] grid-cols-1 gap-10 sm:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="relative overflow-hidden rounded-[44px] "
          >
            <div className="flex items-end justify-center px-6 pt-6">
              <img src={it.img} alt={it.label} className="h-full w-full object-contain" loading="lazy" />
            </div>
            
          </div>
        ))}
      </div>
    </section>
  )
}


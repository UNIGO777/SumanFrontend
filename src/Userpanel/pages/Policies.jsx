import { Link } from 'react-router-dom'

export default function Policies() {
  const items = [
    { label: 'Terms and Conditions', to: '/terms-and-conditions' },
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Refund Policy', to: '/refund-policy' },
    { label: 'Return Policy', to: '/return-policy' },
    { label: 'Shipping Policy', to: '/shipping-policy' },
  ]

  return (
    <div className="bg-white">
      <div className="w-full bg-gray-100">
        <div className="w-full px-8 py-10 text-center sm:px-12 md:px-8 lg:px-14">
          <div className="text-4xl font-semibold text-gray-900">Policies</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">
            Quick access to our legal and customer service policies.
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-10 sm:px-12 md:px-8 lg:px-14">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 ring-1 ring-gray-200 hover:bg-white"
              >
                <span>{it.label}</span>
                <span className="text-[#0f2e40]">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

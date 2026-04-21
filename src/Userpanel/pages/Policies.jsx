import { Link } from 'react-router-dom'

const POLICY_LINKS = [
  {
    label: 'Return Policy',
    description: '5-day return window. Items must be unused and in original condition.',
    to: '/return-policy',
  },
  {
    label: 'Refund Policy',
    description: 'Refunds processed within 7–10 business days to your original payment method.',
    to: '/refund-policy',
  },
  {
    label: 'Shipping Policy',
    description: 'Pan-India delivery in 5–7 business days. Free shipping above ₹999.',
    to: '/shipping-policy',
  },
  {
    label: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
    to: '/privacy-policy',
  },
  {
    label: 'Terms and Conditions',
    description: 'Terms governing your use of our platform and services.',
    to: '/terms-and-conditions',
  },
]

export default function Policies() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-[#0f2e40] text-white">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Policies</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            Quick access to all our customer service and legal policies.
          </p>
        </div>
      </div>

      {/* Policy links */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {POLICY_LINKS.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50 p-6 transition-colors hover:border-[#0f2e40]/20 hover:bg-white"
            >
              <div>
                <h2 className="text-sm font-bold text-[#0f2e40] sm:text-base">{p.label}</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500 sm:text-sm">{p.description}</p>
              </div>
              <div className="mt-4 text-xs font-semibold text-[#0f2e40]">Read more →</div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 p-6 text-center">
          <p className="text-sm font-semibold text-gray-800">Still have questions?</p>
          <p className="mt-1 text-sm text-gray-500">Our team is happy to help with any policy-related queries.</p>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="mailto:suman92.5.official@gmail.com"
              className="rounded-xl bg-[#0f2e40] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#13384d]"
            >
              Email Us
            </a>
            <a
              href="tel:+919527772027"
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              +91 95277 72027
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

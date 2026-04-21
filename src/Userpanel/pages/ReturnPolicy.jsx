import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    title: 'Return window',
    body: 'We accept returns within 5 days of delivery. If 5 days have passed since your order was delivered, we are unable to process a return or exchange. Please review all product details carefully before placing your order.',
  },
  {
    title: 'Eligible items',
    body: 'To be eligible for a return, the item must be unused, unworn, and in its original condition. It must also be in the original packaging. Items that have been worn, resized, or show signs of use are not eligible for return.',
  },
  {
    title: 'Damaged or incorrect items',
    body: 'If you receive a damaged or incorrect item, contact us within 48 hours of delivery at suman92.5.official@gmail.com or call +91 95277 72027. Include your order ID and clear photos or a short video of the issue. We will prioritise resolving this for you.',
  },
  {
    title: 'Replacements and exchanges',
    body: 'If a replacement or exchange is approved, the new item will be dispatched within 3–4 working days of receiving the returned item. Replacements are subject to stock availability. If the exact item is unavailable, we will offer a suitable alternative or a refund.',
  },
  {
    title: 'How to initiate a return',
    body: 'Email us at suman92.5.official@gmail.com with your Order ID, the item you wish to return, and the reason. Our team will confirm eligibility and share return instructions. Do not ship items back without prior confirmation from us.',
  },
  {
    title: 'Non-returnable items',
    body: 'Custom-made or personalised jewellery cannot be returned or exchanged unless the item arrived damaged or defective. Items purchased during clearance or final-sale events are also non-returnable.',
  },
  {
    title: 'Refunds',
    body: 'Once a return is received and inspected, we will notify you of the approval status. Approved refunds are processed to the original payment method. See our Refund Policy for timelines.',
  },
]

export default function ReturnPolicy() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-[#0f2e40] text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="mb-3 inline-flex rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300">
            5-Day Return Window
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">Return Policy</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            We want you to be completely satisfied with every purchase. If something is not right, here is how we make it good.
          </p>
        </div>
      </div>

      {/* Notice */}
      <div className="mx-auto max-w-3xl px-6 pt-10">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800">5-day return policy</p>
          <p className="mt-1 text-sm text-amber-700">
            Returns are accepted within 5 days of the delivery date. Please contact us before shipping anything back.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="space-y-8">
          {SECTIONS.map((s, i) => (
            <div key={s.title} className="flex gap-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f2e40] text-xs font-bold text-white">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 sm:text-base">{s.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.body}</p>
                {s.title === 'Refunds' && (
                  <p className="mt-2 text-sm font-semibold">
                    <Link to="/refund-policy" className="text-[#0f2e40] underline underline-offset-2">
                      View Refund Policy →
                    </Link>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="mx-auto max-w-3xl px-6 pb-16">
        <div className="rounded-2xl border border-gray-200 p-8 text-center">
          <h2 className="text-base font-bold text-gray-900">Need help with a return?</h2>
          <p className="mt-2 text-sm text-gray-500">Reach out and we will guide you through the process.</p>
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="mailto:suman92.5.official@gmail.com"
              className="rounded-xl bg-[#0f2e40] px-6 py-3 text-sm font-semibold text-white hover:bg-[#13384d]"
            >
              suman92.5.official@gmail.com
            </a>
            <a
              href="tel:+919527772027"
              className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              +91 95277 72027
            </a>
          </div>
          <div className="mt-5 text-xs text-gray-400">
            Also see:{' '}
            <Link to="/refund-policy" className="font-semibold text-[#0f2e40] underline underline-offset-2">
              Refund Policy
            </Link>{' '}
            ·{' '}
            <Link to="/shipping-policy" className="font-semibold text-[#0f2e40] underline underline-offset-2">
              Shipping Policy
            </Link>{' '}
            ·{' '}
            <Link to="/policies" className="font-semibold text-[#0f2e40] underline underline-offset-2">
              All Policies
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

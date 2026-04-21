import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    title: 'Eligibility',
    body: 'Refunds are issued for items that are returned within the 5-day return window, in original and unworn condition. Items that have been worn, damaged after delivery (by the customer), or returned outside the window are not eligible. Customised or personalised orders are not eligible for refunds unless the item arrived defective.',
  },
  {
    title: 'How to request a refund',
    body: 'Email us at suman92.5.official@gmail.com with your Order ID, the item in question, and the reason for your refund request. Our team will review and respond within 1–2 business days. If a return shipment is required, we will share instructions — do not send items back before confirmation.',
  },
  {
    title: 'Processing time',
    body: 'Once your returned item is received and inspected, we will notify you by email within 2 business days. If your return is approved, the refund will be processed to your original payment method within 7–10 business days. Actual settlement timelines depend on your bank, UPI provider, or card issuer.',
  },
  {
    title: 'Damaged or incorrect items',
    body: 'If you received an item that arrived damaged or was sent incorrectly, contact us within 48 hours of delivery with photos or a short video. We will resolve this on priority — either by sending a replacement at no additional cost or processing a full refund, at your preference.',
  },
  {
    title: 'Non-refundable situations',
    body: 'We do not process refunds for items returned outside the 5-day window, items that show signs of wear or use, custom/personalised orders (unless defective), or items not in their original condition and packaging.',
  },
  {
    title: 'Shipping charges',
    body: 'Original shipping charges (if any) are non-refundable. If the return is due to an error on our end — wrong item sent or item arrived damaged — we will cover return shipping costs.',
  },
]

export default function RefundPolicy() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-[#0f2e40] text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Refund Policy</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Approved refunds are processed within 7–10 business days to your original payment method.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-8">
          {SECTIONS.map((s, i) => (
            <div key={s.title} className="flex gap-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f2e40] text-xs font-bold text-white">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 sm:text-base">{s.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="mx-auto max-w-3xl px-6 pb-16">
        <div className="rounded-2xl border border-gray-200 p-8 text-center">
          <h2 className="text-base font-bold text-gray-900">Have a refund query?</h2>
          <p className="mt-2 text-sm text-gray-500">Contact us and we will sort it out as quickly as possible.</p>
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
            <Link to="/return-policy" className="font-semibold text-[#0f2e40] underline underline-offset-2">
              Return Policy
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

import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    title: 'Delivery timeline',
    body: 'Orders are typically delivered within 5–7 business days from the date of dispatch. Delivery timelines may vary based on your location, local courier capacity, and peak-demand periods such as festivals or sale events. Timelines shown at checkout are estimates, not guarantees.',
  },
  {
    title: 'Order processing',
    body: 'After a successful order and payment, we begin processing your order within 1–2 business days. During high-demand periods, processing may take slightly longer. You will receive an email confirmation once your order is placed, and a separate notification once it is dispatched.',
  },
  {
    title: 'Shipping charges',
    body: 'Shipping is free on all orders above ₹999. Orders below ₹999 carry a flat shipping fee of ₹49. The applicable charge is calculated and shown clearly at checkout before you complete payment.',
  },
  {
    title: 'Logistics partner',
    body: 'We ship across India through Shiprocket-powered logistics. Shiprocket assigns the most suitable courier partner (such as BlueDart, Delhivery, Xpressbees, or others) based on your delivery pincode and order size.',
  },
  {
    title: 'Order tracking',
    body: 'Once your order is dispatched, you will receive tracking details via email. You can also visit the Track Order page on our website and enter your Order ID to check the latest status of your shipment.',
  },
  {
    title: 'Delivery address',
    body: 'Please ensure your delivery address and contact number are accurate at the time of placing the order. We are unable to change the delivery address once the order has been dispatched. For address changes before dispatch, contact us immediately.',
  },
  {
    title: 'Delivery issues',
    body: 'If your order shows as delivered but has not been received, or if the package arrived damaged, contact us within 48 hours at suman92.5.official@gmail.com or call +91 95277 72027. Include your Order ID and, where possible, photos of the packaging.',
  },
  {
    title: 'International shipping',
    body: 'We currently deliver within India only. International shipping is being planned — follow our updates for announcements.',
  },
]

export default function ShippingPolicy() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-[#0f2e40] text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
            Estimated 5–7 business days
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">Shipping Policy</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            We dispatch all orders across India via Shiprocket-powered logistics. Free shipping on orders above ₹999.
          </p>
          <div className="mt-6">
            <Link
              to="/track-order"
              className="inline-flex items-center rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Track My Order
            </Link>
          </div>
        </div>
      </div>

      {/* Quick facts */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Delivery time', value: '5–7 days' },
              { label: 'Free shipping', value: 'Above ₹999' },
              { label: 'Flat fee below', value: '₹49' },
              { label: 'Delivery area', value: 'Pan India' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{f.label}</p>
                <p className="mt-1 text-base font-bold text-[#0f2e40]">{f.value}</p>
              </div>
            ))}
          </div>
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
                {s.title === 'Order tracking' && (
                  <p className="mt-2 text-sm font-semibold">
                    <Link to="/track-order" className="text-[#0f2e40] underline underline-offset-2">
                      Track Order →
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
          <h2 className="text-base font-bold text-gray-900">Shipping issue?</h2>
          <p className="mt-2 text-sm text-gray-500">Contact us and we will look into it right away.</p>
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
            <Link to="/refund-policy" className="font-semibold text-[#0f2e40] underline underline-offset-2">
              Refund Policy
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

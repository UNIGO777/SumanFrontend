import { Link } from 'react-router-dom'

const SERVICES = [
  {
    title: 'Order Tracking',
    description: 'Track your order in real time from dispatch to doorstep. Once your order is shipped via our Shiprocket-powered logistics, you will receive tracking details on your registered email. You can also visit the Track Order page and enter your Order ID at any time.',
    cta: { label: 'Track My Order', to: '/track-order' },
  },
  {
    title: 'Custom Orders',
    description: 'Looking for something unique? We accept custom silver jewellery requests — whether it is a personalised design, a specific weight, or a bespoke gift. Visit our store in Pune or reach out by email or phone to discuss your requirements. Custom orders are subject to availability and artisan capacity.',
    cta: null,
  },
  {
    title: 'Gift Packaging',
    description: 'Every order is dispatched in secure packaging. For gifting occasions — birthdays, anniversaries, weddings, or festivals — you can add a personal note at checkout. We take care of the presentation so the unboxing feels special.',
    cta: null,
  },
  {
    title: 'Returns & Exchanges',
    description: 'We want you to love what you receive. If a product arrives damaged or is not as described, contact us within 48 hours of delivery with photos. Returns and exchanges are accepted on eligible items in original, unworn condition within the window stated in our Return Policy.',
    cta: { label: 'Return Policy', to: '/return-policy' },
  },
  {
    title: 'Refunds',
    description: 'Refunds are processed to the original payment method after the returned item is received and inspected. Timelines vary based on your bank or UPI provider. See our Refund Policy for full details.',
    cta: { label: 'Refund Policy', to: '/refund-policy' },
  },
  {
    title: 'Shipping & Delivery',
    description: 'We dispatch orders across India through Shiprocket. Standard delivery takes 5–7 business days depending on your location. Free shipping is available on all orders above ₹999. Orders below ₹999 carry a flat ₹49 shipping fee.',
    cta: null,
  },
  {
    title: 'Order Modifications & Cancellations',
    description: 'Need to change your delivery address or cancel an order? We can accommodate modifications and cancellations before the order is dispatched. Contact us immediately at suman92.5.official@gmail.com or call +91 95277 72027 after placing your order.',
    cta: null,
  },
  {
    title: 'Silver Price Transparency',
    description: 'Our product prices are calculated as a fixed making charge plus the current 92.5 silver market rate applied to the silver weight of each piece. When the silver rate falls, prices fall. There are no hidden margins. You always know exactly what you are paying for.',
    cta: null,
  },
  {
    title: 'Jewellery Care Guidance',
    description: 'Sterling silver tarnishes naturally over time when exposed to air, moisture, and chemicals. Store your jewellery in a cool, dry place, away from perfumes and lotions. Clean with a soft silver-polishing cloth to restore shine. Our team is happy to answer any care questions.',
    cta: null,
  },
]

const CONTACT = [
  { label: 'Email', value: 'suman92.5.official@gmail.com', href: 'mailto:suman92.5.official@gmail.com' },
  { label: 'Phone', value: '+91 95277 72027', href: 'tel:+919527772027' },
  { label: 'Store', value: 'Shop No 04, 911, Ravi Apartment, 859, Near Manik Lodge, Laxmi Road, Raviwar Peth, Pune — 411002', href: null },
]

export default function AvailableServices() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-[#0f2e40] text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Our Services</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Everything we do to make sure your experience with Suman 9.25 is smooth, honest, and worth coming back for.
          </p>
        </div>
      </div>

      {/* Services list */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="flex flex-col rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <h2 className="text-sm font-bold text-[#0f2e40] sm:text-base">{s.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{s.description}</p>
              {s.cta ? (
                <div className="mt-4">
                  <Link
                    to={s.cta.to}
                    className="inline-flex items-center text-xs font-semibold text-[#0f2e40] underline underline-offset-2 hover:text-[#13384d]"
                  >
                    {s.cta.label} →
                  </Link>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Contact us */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Get in touch</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {CONTACT.map((c) => (
              <div key={c.label} className="rounded-2xl border border-gray-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="mt-2 block text-sm font-semibold text-[#0f2e40] hover:underline">
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-gray-800">{c.value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-[#0f2e40] px-6 py-8 text-center text-white">
            <p className="text-lg font-semibold">Can't find what you need?</p>
            <p className="mt-1 text-sm text-white/70">Our team is available to help with any query.</p>
            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="mailto:suman92.5.official@gmail.com"
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0f2e40] hover:bg-gray-100"
              >
                Email Us
              </a>
              <a
                href="tel:+919527772027"
                className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                +91 95277 72027
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'

const VALUES = [
  {
    title: 'Authentic 92.5 Silver',
    body: 'Every piece in our collection is crafted from 925 Sterling Silver — the internationally recognised standard for high-quality silver jewellery. We believe you deserve purity you can trust.'
  },
  {
    title: 'Jewellery for every moment',
    body: 'From everyday wear to gifting on special occasions — weddings, anniversaries, birthdays, festivals — our collections are designed to fit naturally into your life and mark the moments that matter.'
  },
  {
    title: 'Live silver-linked pricing',
    body: 'We price our products transparently: a fixed making cost plus a silver component tied to the current market rate. No hidden margins — when silver prices fall, you pay less.'
  },
  {
    title: 'Shipped across India',
    body: 'We dispatch orders across India through Shiprocket-powered logistics. Free shipping on orders above ₹999. Track every step of your delivery in real time.'
  },
  {
    title: 'Built for gifting',
    body: 'Looking for the perfect gift? Our "Most Gifted" and occasion-based collections make finding the right piece simple. Add a personal note at checkout to make it even more special.'
  }
]

const STEPS = [
  { number: '01', title: 'Browse our collections', body: 'Explore jewellery organised by category, occasion, and recipient. Use our search to find exactly what you need.' },
  { number: '02', title: 'Place your order', body: 'Add to cart, fill in your details, and complete payment securely via PhonePe — UPI, cards, and net banking accepted.' },
  { number: '03', title: 'We dispatch your order', body: 'Your order is carefully packed and handed to our logistics partner. You receive tracking details by email.' },
  { number: '04', title: 'Delivered to your door', body: 'Your jewellery arrives in secure packaging, ready to wear or gift. Reach out if anything is not right — we will make it good.' }
]

export default function WhatWeDo() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-[#0f2e40] text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">What We Do</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Suman 9.25 is a Pune-based silver jewellery brand dedicated to crafting pieces that are pure, beautiful, and accessible. We combine traditional craftsmanship with transparent pricing so you always know what you're paying for.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/search"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0f2e40] hover:bg-gray-100"
            >
              Shop Now
            </Link>
            <Link
              to="/available-services"
              className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Our Services
            </Link>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">What makes us different</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <h3 className="text-sm font-bold text-[#0f2e40] sm:text-base">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{v.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.number} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f2e40] text-sm font-bold text-white">
                  {s.number}
                </div>
                <h3 className="mb-2 text-sm font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visit us */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">Visit our store in Pune</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
            Shop No 04, 911, Ravi Apartment, 859, Near Manik Lodge, Laxmi Road, Raviwar Peth, Pune — 411002
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="mailto:suman92.5.official@gmail.com"
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              suman92.5.official@gmail.com
            </a>
            <a
              href="tel:+919527772027"
              className="rounded-lg bg-[#0f2e40] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#13384d]"
            >
              +91 95277 72027
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

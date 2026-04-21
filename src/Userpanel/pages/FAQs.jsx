import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'

const FAQS = [
  {
    section: 'Orders & Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major payment methods via PhonePe — including UPI, credit/debit cards, and net banking.'
      },
      {
        q: 'Is it safe to pay on your website?',
        a: 'Yes. All payments are processed through PhonePe\'s secure payment gateway. We do not store your card or UPI details.'
      },
      {
        q: 'Can I cancel my order after placing it?',
        a: 'Orders can be cancelled before they are shipped. Once shipped, you will need to follow the return process. Contact us at suman92.5.official@gmail.com or call +91 95277 72027 as soon as possible.'
      },
      {
        q: 'How do I know my order was confirmed?',
        a: 'You will receive a confirmation email at the email address you provided during checkout. If you do not receive it within 30 minutes, check your spam folder or contact us.'
      },
      {
        q: 'Can I modify my order after placing it?',
        a: 'Modifications (address changes, item changes) are only possible before the order is dispatched. Reach out to us immediately after placing the order.'
      }
    ]
  },
  {
    section: 'Shipping & Delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Delivery typically takes 5–7 business days depending on your location. You will receive tracking information once your order is dispatched.'
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes — orders above ₹999 qualify for free shipping. Orders below ₹999 carry a flat ₹49 shipping fee.'
      },
      {
        q: 'How do I track my order?',
        a: <>Visit the <Link to="/track-order" className="font-semibold text-[#0f2e40] underline underline-offset-2">Track Order</Link> page and enter your Order ID. Tracking details are available once your order has been handed to the courier.</>
      },
      {
        q: 'Do you deliver outside India?',
        a: 'We currently deliver across India. International shipping is being planned — follow our social media channels for updates.'
      }
    ]
  },
  {
    section: 'Products & Pricing',
    items: [
      {
        q: 'What purity is your silver jewellery?',
        a: 'Our jewellery is made from 92.5% pure silver (Sterling Silver), also known as 925 silver — the internationally recognised standard for high-quality silver jewellery.'
      },
      {
        q: 'Why does the price of a product change?',
        a: 'Our product prices include a silver component that is tied to the live market rate of 92.5 silver. When the silver rate changes, product prices may adjust accordingly. The making cost and other charges remain fixed.'
      },
      {
        q: 'Is the silver weight mentioned accurate?',
        a: 'Yes. The silver weight listed on each product is the actual weight of silver used in crafting that piece. This directly affects the price.'
      },
      {
        q: 'Do products come with authenticity certificates?',
        a: 'We are working on providing hallmarking certificates. Please contact us if you require documentation for a specific purchase.'
      },
      {
        q: 'Can I request a custom design?',
        a: 'Yes, we accept custom orders subject to availability. Contact us at suman92.5.official@gmail.com or visit our store in Pune to discuss your requirements.'
      }
    ]
  },
  {
    section: 'Returns & Refunds',
    items: [
      {
        q: 'What is your return policy?',
        a: <>Please see our <Link to="/return-policy" className="font-semibold text-[#0f2e40] underline underline-offset-2">Return Policy</Link> page for full details. Items must be returned within the specified window in original, unworn condition.</>
      },
      {
        q: 'How long does a refund take?',
        a: <>Refund timelines are described on our <Link to="/refund-policy" className="font-semibold text-[#0f2e40] underline underline-offset-2">Refund Policy</Link> page. Refunds are processed to the original payment method.</>
      },
      {
        q: 'My item arrived damaged — what do I do?',
        a: 'Please contact us within 48 hours of delivery with photos of the damaged item and packaging. We will prioritise resolving this immediately.'
      }
    ]
  },
  {
    section: 'Care & Maintenance',
    items: [
      {
        q: 'How do I care for my silver jewellery?',
        a: 'Store silver in a cool, dry place away from direct sunlight. Avoid contact with perfumes, lotions, and chemicals. Clean gently with a soft cloth to maintain its shine.'
      },
      {
        q: 'Why is my silver turning dark?',
        a: 'Silver naturally tarnishes over time when exposed to air and moisture. This is normal and does not indicate poor quality. Use a silver-polishing cloth or mild silver cleaner to restore its original shine.'
      }
    ]
  }
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-gray-900 sm:text-base">{q}</span>
        <ChevronDown className={`mt-0.5 h-5 w-5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-gray-600 sm:text-base">{a}</p>
      )}
    </div>
  )
}

export default function FAQs() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Frequently Asked Questions</h1>
          <p className="mt-3 text-sm text-gray-500 sm:text-base">
            Can't find your answer?{' '}
            <a href="mailto:suman92.5.official@gmail.com" className="font-semibold text-[#0f2e40] underline underline-offset-2">
              Email us
            </a>{' '}
            or call{' '}
            <a href="tel:+919527772027" className="font-semibold text-[#0f2e40]">
              +91 95277 72027
            </a>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-10">
          {FAQS.map((section) => (
            <div key={section.section}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0f2e40]">
                {section.section}
              </h2>
              <div className="rounded-xl border border-gray-200 px-5">
                {section.items.map((item, i) => (
                  <FAQItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-xl bg-[#0f2e40] px-6 py-8 text-center text-white">
          <p className="text-lg font-semibold">Still have questions?</p>
          <p className="mt-1 text-sm text-white/70">Our team is happy to help.</p>
          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <a
              href="mailto:suman92.5.official@gmail.com"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#0f2e40] hover:bg-gray-100"
            >
              Email Us
            </a>
            <a
              href="tel:+919527772027"
              className="rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              +91 95277 72027
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomeEssentialsSection() {
  return (
    <div className="mt-12">
      <section className="w-full">
        <div className="mb-6 text-center text-3xl font-bold text-[#0f2e40]">2026 Jewellery Essentials</div>

        <div className="mx-auto flex max-w-[90vw] flex-col gap-8 md:flex-row">
          {[
            {
              label: 'Timeless Pearls',
              img: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1600&q=80',
              className: 'md:w-[330px]',
            },
            {
              label: 'Stackable Collection',
              img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1600&q=80',
              className: 'md:w-[330px]',
            },
            {
              label: 'Emerging Trends',
              img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=80',
              className: 'md:flex-1',
            },
          ].map((it) => (
            <div key={it.label} className={it.className}>
              <div className="relative h-[260px] overflow-hidden rounded-[40px] bg-gray-100 shadow-lg ring-1 ring-[#0f2e40]/15">
                <img src={it.img} alt={it.label} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0f2e40]/70 to-transparent" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-base font-bold text-white">
                  {it.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import essentialImg1 from '../../../../assets/1312 × 668-6.jpg'
import essentialImg2 from '../../../../assets/1312 × 668-7.jpg'
import essentialImg3 from '../../../../assets/1312 × 668-8.jpg'

export default function HomeEssentialsSection() {
  return (
    <div className="mt-12">
      <section className="w-full">
        <div className="mb-6 text-center text-3xl font-bold text-[#0f2e40]">2026 Jewellery Essentials</div>

        <div className="mx-auto flex max-w-[90vw] flex-col gap-8 md:flex-row">
          {[
            {
              label: 'Timeless Pearls',
              img: essentialImg1,
              className: 'md:w-[330px]',
            },
            {
              label: 'Stackable Collection',
              img: essentialImg2,
              className: 'md:w-[330px]',
            },
            {
              label: 'Emerging Trends',
              img: essentialImg3,
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

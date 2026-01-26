import collectionImg1 from '../../../../assets/1312 × 668-3.jpg'
import collectionImg2 from '../../../../assets/1312 × 668-4.jpg'
import collectionImg3 from '../../../../assets/1312 × 668-5.jpg'
import productImg1 from '../../../../assets/876 × 1628-1.png'
import productImg2 from '../../../../assets/876 × 1628-2.png'
import productImg3 from '../../../../assets/876 × 1628-3.png'
import productImg4 from '../../../../assets/876 × 1628-4.png'

export default function HomeLatestCollectionsSection() {
  const latestCollections = [
    {
      id: 'lc-1',
      title: 'FRESH DROP!',
      subtitle: 'Shiny & New Arrivals',
      tag: 'Only at GIVA',
      img: collectionImg1,
      items: [
        { label: 'Bracelet', img: productImg1 },
        { label: 'Ring', img: productImg2 },
        { label: 'Chain', img: productImg3 },
      ],
    },
    {
      id: 'lc-2',
      title: 'Shakti',
      subtitle: 'COLLECTION',
      tag: 'Wear your power beautifully',
      img: collectionImg2,
      items: [
        { label: 'Pendant', img: productImg4 },
        { label: 'Earring', img: productImg2 },
        { label: 'Ring', img: productImg1 },
      ],
    },
    {
      id: 'lc-3',
      title: 'Pierced',
      subtitle: 'COLLECTION',
      tag: 'Mix, match, and stack',
      img: collectionImg3,
      items: [
        { label: 'Studs', img: productImg3 },
        { label: 'Anklet', img: productImg4 },
        { label: 'Bracelet', img: productImg1 },
      ],
    },
  ]

  return (
    <div className="mt-14">
      <section className="relative w-full">
        <div className="mb-6 text-center text-3xl font-bold text-gray-900">Latest Collections</div>

        <div className="no-scrollbar flex snap-x snap-mandatory gap-8 overflow-x-auto px-1 py-2 md:px-10">
          {latestCollections.map((c) => (
            <div key={c.id} className="shrink-0 snap-center">
              <div className="relative w-[30vw] max-w-[700px] pb-16 md:w-[700px]">
                <div className="relative h-[240px] overflow-hidden rounded-[44px] bg-gray-100 ring-1 ring-gray-200 md:h-[300px]">
                  <img src={c.img} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />

                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-left text-white">
                    <div className="text-4xl font-bold tracking-wide">{c.title}</div>
                    <div className="mt-2 text-sm font-medium text-white/90">{c.subtitle}</div>
                    <div className="mt-1 text-sm font-bold italic text-white/85">{c.tag}</div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-5">
                  {c.items.map((it) => (
                    <div
                      key={`${c.id}-${it.label}`}
                      className="grid h-[120px] w-[120px] place-items-center rounded-3xl bg-white shadow-md ring-1 ring-gray-200"
                    >
                      <img src={it.img} alt={it.label} className="h-[72px] w-[72px] object-contain" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import customerImg1 from '../../../../assets/876 × 1628-1.png'
import customerImg2 from '../../../../assets/876 × 1628-2.png'
import customerImg3 from '../../../../assets/876 × 1628-3.png'

export default function HomeCustomerStoriesSection() {
  const customerStories = [
    {
      id: 'cs-1',
      name: 'Virda',
      story: "A big shout out to you guys for improving my hubby's gifting tastes. Completely in love with my ring!",
      img: customerImg1,
    },
    {
      id: 'cs-2',
      name: 'Harshika',
      story: 'Never thought buying jewellery would be this easy, thanks for helping make my mom’s birthday special.',
      img: customerImg2,
    },
    {
      id: 'cs-3',
      name: 'Priya',
      story:
        'Gifted these earrings to my sister on her wedding and she loved them! I am obsessed with buying gifts from GIVA.',
      img: customerImg3,
    },
  ]

  return (
    <div className="mt-16">
      <section className="w-full">
        <div className="mb-10 text-center">
          <div className="text-3xl font-bold text-gray-900">Customer Stories</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">
            Real moments and real reviews from people who wear and gift our pieces.
          </div>
        </div>

        <div className="mx-auto max-w-[92vw]">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {customerStories.map((s) => (
              <div key={s.id} className="relative rounded-2xl bg-gray-300 px-8 pb-14 pt-8">
                <div className="text-center text-xl font-bold text-gray-900">{s.name}</div>
                <div className="mt-4 text-center text-sm leading-6 text-gray-700">{s.story}</div>

                <div className="absolute -bottom-8 left-1/2 h-16 w-16 -translate-x-1/2 overflow-hidden rounded-full bg-white ring-2 ring-white">
                  <img src={s.img} alt={s.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

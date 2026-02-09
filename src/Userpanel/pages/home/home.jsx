import ItemPanel from '../../components/ItemPanel.jsx'
import RecipientPanel from '../../components/RecipientPanel.jsx'
import HomeHeroPromos from './sections/HomeHeroPromos.jsx'
import HomeBestSellerSection from './sections/HomeBestSellerSection.jsx'
import HomeOccasionSection from './sections/HomeOccasionSection.jsx'
import HomeEssentialsSection from './sections/HomeEssentialsSection.jsx'
import HomeLaunchBannerSection from './sections/HomeLaunchBannerSection.jsx'
import HomeMostGiftedSection from './sections/HomeMostGiftedSection.jsx'
import HomeLatestCollectionsSection from './sections/HomeLatestCollectionsSection.jsx'
import HomeInternationalShippingBanner from './sections/HomeInternationalShippingBanner.jsx'
import HomeSpecialOccasionSection from './sections/HomeSpecialOccasionSection.jsx'
import HomeCustomerStoriesSection from './sections/HomeCustomerStoriesSection.jsx'

const Home = () => {
  return (
    <div className="mx-auto px-4 py-6">
      <HomeHeroPromos />

      <ItemPanel />

      <div className="mt-10">
        <RecipientPanel />
      </div>

      <HomeBestSellerSection />
      <HomeOccasionSection />
      <HomeEssentialsSection />
      <HomeLaunchBannerSection />
      <HomeMostGiftedSection />
      <HomeLatestCollectionsSection />
      <HomeInternationalShippingBanner />
      <HomeSpecialOccasionSection />
      <HomeCustomerStoriesSection />
    </div>
  )
}

export default Home

import HeroSection from './sections/HeroSection'
import FeaturesSection from './sections/FeaturesSection'
import CtaSection from './sections/CtaSection'

/** 랜딩 페이지: 섹션 단위로 쪼개서 sections/ 에 둔다 */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
    </>
  )
}

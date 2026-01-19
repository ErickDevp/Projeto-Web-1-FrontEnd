import HomeMainContent from '../../components/home/HomeMainContent'
import HomeHero from '../../components/home/Home'

export default function Home() {
  return (
    <div className="min-h-screen overflow-y-auto bg-bg-primary">
      <HomeHero />
      <HomeMainContent />
    </div>
  )
}

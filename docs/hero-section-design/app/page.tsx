import { HeroSection } from "@/components/hero-section"
import { HowWeHelpSection } from "@/components/how-we-help-section"
import { AboutUsSection } from "@/components/about-us-section"
import { SuccessStoriesSection } from "@/components/success-stories-section"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <HowWeHelpSection />
      <AboutUsSection />
      <SuccessStoriesSection />
    </main>
  )
}

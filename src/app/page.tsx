import AboutSection from "@/components/landing/AboutSection";
import DestinationSection from "@/components/landing/DestinationSection";
import Footer from "@/components/landing/Footer";
import GameFeatures from "@/components/landing/GameFeatures";
import HeroSection from "@/components/landing/HeroSection";
import HowToPlay from "@/components/landing/HowToPlay";
import LeaderboardPreview from "@/components/landing/LeaderboardPreview";
import Navbar from "@/components/landing/Navbar";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <DestinationSection />
        <GameFeatures />
        <HowToPlay />
        <AboutSection />
        <LeaderboardPreview />
      </main>
      <Footer />
    </>
  );
}

import { Hero } from "@/components/landing/Hero";
import { Scrolly } from "@/components/landing/Scrolly";
import { AboutSection, FeaturesSection, PipelineSection, Footer } from "@/components/landing/Sections";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Scrolly />
      <AboutSection />
      <FeaturesSection />
      <PipelineSection />
      <Footer />
    </>
  );
}

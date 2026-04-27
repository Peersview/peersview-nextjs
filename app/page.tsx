import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
// import { ServicesSection } from "@/components/landing/ServicesSection";
// import { CommunitySection } from "@/components/landing/CommunitySection";
import { JobsSection } from "@/components/landing/JobsSection";
// import { CareerSection } from "@/components/landing/CareerSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PartnerNetwork } from "@/components/landing/PartnerNetwork";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        {/* <ServicesSection />
        <CommunitySection /> */}
        <JobsSection />
        {/* <CareerSection /> */}
        <TestimonialsSection />
        <PartnerNetwork />
      </main>
      <Footer />
    </>
  );
}

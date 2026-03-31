"use client";

import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import PartnerAlliancesSection from "@/components/PartnerAlliancesSection";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import PropertiesSection from "@/components/PropertiesSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import type { GooglePlaceReviews } from "@/lib/google-reviews";
import type { FeaturedProperty } from "@/lib/featured-properties";

type HomePageProps = {
  googleReviews: GooglePlaceReviews | null;
  featuredProperties: FeaturedProperty[];
};

export default function HomePage({ googleReviews, featuredProperties }: HomePageProps) {
  return (
    <div className="min-h-screen">
      <Navbar
        googleRating={googleReviews?.rating}
        googleTotalReviews={googleReviews?.totalReviews}
      />
      <HeroSection />
      <AboutSection />
      <PropertiesSection properties={featuredProperties} />
      <ServicesSection />
      <TestimonialsSection googleReviews={googleReviews} />
      <ContactSection />
      <PartnerAlliancesSection />
      <Footer />
    </div>
  );
}

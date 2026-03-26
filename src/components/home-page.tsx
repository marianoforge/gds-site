"use client";

import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import PropertiesSection from "@/components/PropertiesSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import type { GooglePlaceReviews } from "@/lib/google-reviews";

type HomePageProps = {
  googleReviews: GooglePlaceReviews | null;
};

export default function HomePage({ googleReviews }: HomePageProps) {
  return (
    <div className="min-h-screen">
      <Navbar
        googleRating={googleReviews?.rating}
        googleTotalReviews={googleReviews?.totalReviews}
      />
      <HeroSection />
      <AboutSection />
      <PropertiesSection />
      <ServicesSection />
      <TestimonialsSection googleReviews={googleReviews} />
      <ContactSection />
      <Footer />
    </div>
  );
}

import { motion, useScroll, useSpring } from "framer-motion";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { FinalCta } from "../components/landing/FinalCta";
import { Footer } from "../components/landing/Footer";
import { Hero } from "../components/landing/Hero";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Navbar } from "../components/landing/Navbar";
import { PreviewSection } from "../components/landing/PreviewSection";
import { ProblemSection } from "../components/landing/ProblemSection";

export function LandingPage() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  return (
    <div className="min-h-screen overflow-x-clip">
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-fern" />
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorks />
        <PreviewSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

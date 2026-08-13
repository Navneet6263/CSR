import { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { Hero } from "@/components/landing/Hero";
import { Scholarships } from "@/components/landing/Scholarships";
import { Stories } from "@/components/landing/Stories";
import { Partners } from "@/components/landing/Partners";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { EligibilityChecker } from "@/components/landing/EligibilityChecker";
import { Footer } from "@/components/landing/Footer";
import { PublicPortalProvider } from '@/components/landing/PublicPortalProvider';
import { TrustCenter } from '@/components/landing/TrustCenter';

export const metadata: Metadata = {
  title: "Shikshavritti — CSR Scholarships for Every Deserving Student",
  description: "Shikshavritti connects deserving Indian students with CSR scholarships from trusted companies.",
};

export default function Home() {
  return (
    <div className="landing-theme min-h-screen">
      <PublicPortalProvider><div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
        <Header />
        <AnnouncementBar />
        <main className="flex-1">
          <Hero />
          <TrustCenter />
          <Scholarships />
          <Stories />
          <Partners />
          <HowItWorks />
          <EligibilityChecker />
        </main>
        <Footer />
      </div></PublicPortalProvider>
    </div>
  );
}

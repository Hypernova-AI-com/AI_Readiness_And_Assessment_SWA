import { useCallback } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import PainPoints from "./components/PainPoints";
import HowItWorks from "./components/HowItWorks";
import ReportPreview from "./components/ReportPreview";
import Guarantee from "./components/Guarantee";
import Pricing from "./components/Pricing";
import CalBooking from "./components/CalBooking";
import Footer from "./components/Footer";

export default function App() {
  // Every "get the assessment" CTA scrolls to the booking form and focuses it.
  const goToBook = useCallback(() => {
    const el = document.getElementById("book");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      el.querySelector<HTMLInputElement>('input[autocomplete="name"]')?.focus();
    }, 600);
  }, []);

  return (
    <div id="top">
      <Nav onCta={goToBook} />
      <main>
        <Hero onCta={goToBook} />
        <TrustBar />
        <PainPoints />
        <HowItWorks />
        <ReportPreview />
        <Guarantee />
        <Pricing onAssessment={goToBook} onCustom={goToBook} />
        <CalBooking />
      </main>
      <Footer />
    </div>
  );
}

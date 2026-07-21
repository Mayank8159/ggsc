import { useEffect } from "react";
import CydropreneurNav from "./CydropreneurNav";
import HomeSection from "./HomeSection";
import AboutSection from "./AboutSection";
import WhyToAttendSection from "./WhyToAttendSection";
import SpeakersSection from "./SpeakersSection";
import ContactSection from "./ContactSection";
import CydropreneurFooter from "./CydropreneurFooter";

const Cydropreneur = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#07030e",
        color: "#ffffff",
        fontFamily: "'Rajdhani', 'Orbitron', 'Chakra Petch', sans-serif",
        overflowX: "hidden",
      }}
    >
      <CydropreneurNav />
      <HomeSection />
      <AboutSection />
      <WhyToAttendSection />
      <SpeakersSection />
      <ContactSection />
      <CydropreneurFooter />
    </div>
  );
};

export default Cydropreneur;

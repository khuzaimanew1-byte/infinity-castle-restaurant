import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Story from "@/components/Story";
import Signatures from "@/components/Signatures";
import Menu from "@/components/Menu";
import Characters from "@/components/Characters";
import Reservation from "@/components/Reservation";
import Location from "@/components/Location";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Story />
        <Signatures />
        <Menu />
        <Characters />
        <Reservation />
        <Location />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

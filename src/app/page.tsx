"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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

// CastleGate is client-only (uses Audio API) — load dynamically with no SSR
const CastleGate = dynamic(() => import("@/components/CastleGate"), {
  ssr: false,
});

export default function Home() {
  const [entered, setEntered] = useState(false);

  // Lock scroll until user enters
  useEffect(() => {
    if (!entered) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

  return (
    <>
      {/* Castle Gate — full-screen overlay until user clicks Enter */}
      {!entered && (
        <CastleGate onEntered={() => setEntered(true)} />
      )}

      {/* Main site — rendered underneath gate, shown after entry */}
      <div
        style={{
          opacity: entered ? 1 : 0,
          transition: "opacity 0.8s ease 0.3s",
          pointerEvents: entered ? "auto" : "none",
        }}
      >
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
      </div>
    </>
  );
}

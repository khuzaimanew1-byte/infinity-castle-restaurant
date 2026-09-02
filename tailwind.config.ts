import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette
        void: "#0B0906",        // Deepest background
        timber: "#130E0B",      // Dark wood
        surface: "#1A1410",     // Card surfaces
        line: "#2A201A",        // Subtle borders
        // Accent
        wisteria: "#8961D9",    // Primary accent — wisteria purple
        flame: "#E8753A",       // Rengoku orange
        lantern: "#D4935A",     // Warm gold lantern
        mist: "#7EC8D4",        // Tokito mist cyan
        water: "#4A8FBF",       // Giyu water blue
        // Text
        ink: "#EDE8E0",         // Primary text
        "ink-soft": "#B5ADA0",  // Secondary text
        "ink-faint": "#6B6259", // Tertiary text
        metal: "#7A7068",       // Decorative metallic
        "metal-lit": "#A89880", // Lit metallic accent
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        jp: ["var(--font-noto-jp)", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
        pill: "9999px",
      },
      keyframes: {
        "ember-rise": {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "0.6" },
          "100%": {
            transform: "translateY(-100vh) translateX(var(--drift, 20px))",
            opacity: "0",
          },
        },
        "scroll-cue": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
        "wisteria-drift": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-6px) rotate(-1deg)" },
          "66%": { transform: "translateY(4px) rotate(0.5deg)" },
        },
        "blade-flash": {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "ember-rise": "ember-rise var(--duration, 18s) ease-in var(--delay, 0s) infinite",
        "scroll-cue": "scroll-cue 2.6s ease-in-out infinite",
        "wisteria-drift": "wisteria-drift 6s ease-in-out infinite",
        "blade-flash": "blade-flash 2s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "radial-void": "radial-gradient(ellipse at center, #1A1410 0%, #0B0906 70%)",
        shimmer: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;

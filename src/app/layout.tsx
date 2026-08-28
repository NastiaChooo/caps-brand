import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { SequencePreload } from "@/components/providers/sequence-preload";
import { Grain } from "@/components/ui/grain";
import { ScrollProgress } from "@/components/ui/scroll-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Editorial italic accent — the one note of warmth against the grotesque.
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brand.example"),
  title: {
    default: "BRAND — The signature is on the inside",
    template: "%s · BRAND",
  },
  description:
    "An ultra-premium cap finished in true matte black, with a single neon underbrim only the wearer sees. Worn in shadow, known by the few.",
  openGraph: {
    title: "BRAND — The signature is on the inside",
    description:
      "Matte-black headwear with a hidden neon underbrim. A signature you don't announce.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BRAND — The signature is on the inside",
    description:
      "Matte-black headwear with a hidden neon underbrim. A signature you don't announce.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#060607",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <SmoothScroll>
          <ScrollProgress />
          <SequencePreload>{children}</SequencePreload>
        </SmoothScroll>
        <Grain />
      </body>
    </html>
  );
}

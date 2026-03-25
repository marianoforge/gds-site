import type { Metadata } from "next";
import { Lora, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const siteTitle = "Gustavo De Simone — Soluciones Inmobiliarias | CABA & PBA";
const siteDescription =
  "Gustavo De Simone Soluciones Inmobiliarias. Encontrá la propiedad ideal en CABA y Provincia de Buenos Aires. Asesoramiento profesional.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  authors: [{ name: "Gustavo De Simone" }],
  openGraph: {
    type: "website",
    title: siteTitle,
    description: siteDescription,
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${outfit.variable} ${lora.variable} min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

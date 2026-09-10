import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rodeo Burgers & Chicken Catering | Worth, IL",
    template: "%s | Rodeo Burgers & Chicken Catering",
  },
  description:
    "Catering for corporate events, birthdays, graduations, weddings, and more from Rodeo Burgers and Chicken in Worth, IL. Smash burgers, chicken, and live cookout catering.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream-50 text-ink-900">{children}</body>
    </html>
  );
}

import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FacetScan",
  description:
    "The future of decentralized processing is here. Revolutionizing computation with Dumb Contracts.",
  icons: [
    {
      rel: "icon",
      url: "https://facetscan.com/assets/images/facet-social.png",
    },
  ],
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export default RootLayout;

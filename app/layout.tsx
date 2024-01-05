import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Facet Block Explorer",
  description:
    "Facet Scan allows you to explore and search for blocks, transactions, addresses, and contracts on the Facet VM.",
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-[100vh] flex flex-col">
            <Header />
            {children}
            <Analytics />
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;

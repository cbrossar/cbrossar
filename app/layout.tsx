import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "./ui/navbar";
import "./globals.css";
import StyledComponentsRegistry from "./lib/registry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "COLE",
  description: "Cole Brossart",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <Navbar />
          <main>{children}</main>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

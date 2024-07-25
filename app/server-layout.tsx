import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "./ui/navbar";
import "./globals.css";
import StyledComponentsRegistry from "./lib/registry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Cole Brossart",
    description: "MUSIC SOCCER COLE CODE PHOTOS",
};

export default function ServerLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
            </head>
            <body className={inter.className}>
                <StyledComponentsRegistry>
                    <Navbar />
                    <main>{children}</main>
                </StyledComponentsRegistry>
            </body>
        </html>
    );
}

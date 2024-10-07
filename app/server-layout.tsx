import { Inter } from "next/font/google";
import Navbar from "./ui/navbar";
import Footer from "./ui/footer";
import "./globals.css";
import StyledComponentsRegistry from "./lib/registry";

const inter = Inter({ subsets: ["latin"] });

export default function ServerLayout({
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
                    <Footer />
                </StyledComponentsRegistry>
            </body>
        </html>
    );
}

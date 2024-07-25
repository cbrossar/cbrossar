// app/layout.tsx
import type { Metadata } from "next";
import ServerLayout from "./server-layout";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
    title: "Cole Brossart",
    description: "MUSIC SOCCER COLE CODE PHOTOS",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ServerLayout>
            <ClientLayout>{children}</ClientLayout>
        </ServerLayout>
    );
}

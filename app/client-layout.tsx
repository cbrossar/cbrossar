"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';

import useScrollToTop from "./scroll";

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    useScrollToTop();

    return (
        <>
            {children}
            <Analytics
                beforeSend={(event) => {
                    if (event.url === "https://www.cbrossar.com/") {
                        return null;
                    }
                    return event;
                }}
            />
            <SpeedInsights />
        </>
    );
}

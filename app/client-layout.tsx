"use client";

import useScrollToTop from './scroll';

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    useScrollToTop();

    return <>{children}</>;
}

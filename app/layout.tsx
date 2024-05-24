// app/layout.tsx
import ServerLayout from './server-layout';
import ClientLayout from './client-layout';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ServerLayout>
            <ClientLayout>
                {children}
            </ClientLayout>
        </ServerLayout>
    );
}

import './globals.css';
import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { WalletProvider } from '@/components/WalletProvider';
import { SupabaseProvider } from '@/lib/supabaseClient';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'PharmaTrace | Blockchain Pharma Supply Chain',
  description: 'Secure pharmaceutical supply chain tracking using Solana blockchain and Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plexMono.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider>
            <WalletProvider>
              {children}
              <Toaster />
            </WalletProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
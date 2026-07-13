import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppProviders } from "@/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LootLoom — Premium Reward Platform",
  description:
    "LootLoom is a premium reward platform. Earn coins, manage your wallet, redeem rewards and climb the leaderboard.",
  keywords: [
    "LootLoom",
    "rewards",
    "earn coins",
    "wallet",
    "redeem",
    "leaderboard",
    "daily bonus",
  ],
  authors: [{ name: "LootLoom" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://lootloom.netlify.app"),
  openGraph: {
    title: "LootLoom — Premium Reward Platform",
    description: "Earn coins, manage your wallet, redeem rewards.",
    siteName: "LootLoom",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "LootLoom — Premium Reward Platform",
    description: "Earn coins, manage your wallet, redeem rewards.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} antialiased bg-background text-foreground font-sans`}
      >
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}

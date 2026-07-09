import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/lootloom/theme-provider";

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
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "LootLoom — Premium Reward Platform",
    description: "Earn coins, manage your wallet, redeem rewards.",
    siteName: "LootLoom",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bluesky Picker",
  description: "You can pick winners from any of your giveaways hosted on Bluesky! Just paste in your post link and press the button to get started.",
  applicationName: "Cinna Bluesky Raffle Picker",
  authors: [{name: "CinnamonDoe", url: "https://github.com/CinnamonDoe"}],
  creator: "CinnamonDoe",
  keywords: ['raffle', 'bsky raffle', 'bluesky raffle'],
  category: "social media raffle"
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

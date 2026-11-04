import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Crew Health • Asteria Mission",
  description:
    "Offline-first fictional crew health companion. Space Apps 2026 prototype.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Crew Health",
    statusBarStyle: "black-translucent",
  },
  icons: { apple: "/apple-touch-icon.png" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

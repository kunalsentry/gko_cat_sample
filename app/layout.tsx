import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cat Facts",
  description: "Random cat facts on every page load",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

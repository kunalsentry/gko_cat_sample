import type { Metadata } from "next";
import "./globals.css";
import ClientMetrics from "./ClientMetrics";

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
      <body>
        <ClientMetrics />
        {children}
      </body>
    </html>
  );
}

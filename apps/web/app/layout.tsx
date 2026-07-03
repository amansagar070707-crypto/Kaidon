import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata = {
  title: "Kaidon - Agent Operating System",
  description: "Open-source Agent Operating System for building AI-native applications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.className} dark`} suppressHydrationWarning>
      <body className={GeistMono.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

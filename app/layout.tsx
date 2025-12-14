import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carnet de grâces & de missions",
  description: "Un carnet spirituel pour noter vos grâces, prières et rencontres",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
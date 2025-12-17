import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImotiBG+ | Bulgarian Real Estate with POI Data",
  description: "Find your perfect property in Bulgaria with detailed proximity data to amenities, schools, transport and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

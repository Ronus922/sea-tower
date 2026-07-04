import type { Metadata } from "next";
import { Rubik, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const frank = Frank_Ruhl_Libre({
  variable: "--font-frank",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "מגדל הים — דירות בוטיק וסוויטות על הים בחיפה",
  description:
    "מלון דירות בוטיק בבניין אלמוג על חוף הכרמל בחיפה — דירות וסוויטות מאובזרות ברמה מלונאית, 50 מטר מקו המים. לנופש, לעסקים, לרילוקיישן ולכל תקופה.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${frank.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

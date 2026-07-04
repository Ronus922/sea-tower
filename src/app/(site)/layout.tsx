import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

/* התבנית הקבועה של האתר הציבורי: Header + Footer מרונדרים רק כאן.
   עמודי page.tsx מספקים תוכן בלבד — לעולם לא Header/Footer משלהם */

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

import NavBar from "./NavBar";
import Footer from "./Footer";

export default function NavFooterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="flex flex-col justify-start items-stretch min-h-screen">
        <NavBar />
        <main className="flex-grow flex flex-col">{children}</main>
        <Footer />
      </div>
  );
}

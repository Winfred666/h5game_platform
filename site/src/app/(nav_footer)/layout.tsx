import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="flex flex-col justify-start items-stretch min-h-screen">
        <NavBar />
        <div className="flex-grow flex flex-col">{children}</div>
        <Footer />
      </div>
  );
}

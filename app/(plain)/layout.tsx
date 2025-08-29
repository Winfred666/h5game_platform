export default function PlainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <main className="screen_layout">
        {children}
      </main>
  );
}

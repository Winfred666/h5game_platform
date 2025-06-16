export default function PlainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="screen_layout">
        {children}
      </div>
  );
}

export default async function FormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" relative w-full">
      <div className="relative mx-auto my-4 lg:my-20 p-4 rounded-lg bg-card border lg:w-5/6 lg:scale-110 ">
        {children}
      </div>
    </div>
  );
}

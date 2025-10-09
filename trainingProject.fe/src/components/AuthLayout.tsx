export default function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="justify-center items-center flex flex-col h-screen w-full">
      <h2 className="text-3xl font-bold mb-8">{title}</h2>
      <div className="p-8 shadow-lg border rounded-2xl flex flex-col w-80 bg-white/20 backdrop-blur-md">
        {children}
      </div>
    </div>
  );
}

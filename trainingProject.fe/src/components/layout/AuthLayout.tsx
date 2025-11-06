import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col justify-center items-center h-screen w-full"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-foreground)",
      }}
    >
      <Card
        className="w-80 rounded-2xl shadow-lg border"
        style={{
          backgroundColor: "var(--color-primary)",
          borderColor: "var(--color-muted)",
          color: "var(--color-foreground)",
        }}
      >
        <CardHeader>
          <CardTitle
            className="text-3xl font-bold text-center"
            style={{ color: "var(--color-foreground)" }}
          >
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent
          className="flex flex-col p-8 backdrop-blur-md"
          style={{ backgroundColor: "var(--color-muted)" }}
        >
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

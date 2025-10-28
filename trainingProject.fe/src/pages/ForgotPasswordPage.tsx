import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pageAlert, setPageAlert] = useState<{
    variant: "default" | "destructive";
    title: string;
    description: string;
  } | null>(null);

  const fetchPasswordReset = async (email: string) => {
    try {
      const response = await fetch(
        "http://localhost:5065/api/Authenticate/forgot-password?email=" +
          encodeURIComponent(email),
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send password reset email");
      }
      setPageAlert({
        variant: "default",
        title: "Success",
        description: "Password reset link has been sent to your email.",
      });
    } catch (error) {
      console.error("Error:", error);
      setPageAlert({
        variant: "destructive",
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
      });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchPasswordReset(email);
  };

  const handleAlertClose = () => {
    if (pageAlert?.variant === "default") {
      window.location.href = "mailto:";
    }
    setPageAlert(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-6">
      {pageAlert && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={handleAlertClose}
        >
          <div
            className="w-full max-w-xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Alert
              variant={pageAlert.variant}
              className="relative p-6 md:p-8 text-base rounded-lg shadow-[0_20px_80px_rgba(0,0,0,0.55)] border-2 bg-[var(--color-primary)]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 rounded-t-lg bg-[var(--color-accent)]"
              />
              <AlertTitle className="text-2xl font-semibold pr-8">
                {pageAlert.title}
              </AlertTitle>
              <AlertDescription className="mt-2 text-[var(--color-foreground)]/90">
                {pageAlert.description}
              </AlertDescription>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleAlertClose}>OK</Button>
              </div>
            </Alert>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Forgot Password</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-primary)] p-6 rounded-lg shadow-lg border border-[var(--color-muted)]"
        >
          <div className="mb-4 space-y-2">
            <Label htmlFor="email" className="text-[var(--color-foreground)]">
              Enter your email address
            </Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
  );
}

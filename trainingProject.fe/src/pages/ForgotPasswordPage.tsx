import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ENDPOINTS } from "@/api/endpoints";
import { api } from "@/api/api";
import { toast, Toaster } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const fetchPasswordReset = async (email: string) => {
    try {
      await api.get(
        `${ENDPOINTS.AUTH.FORGOT_PASSWORD}?email=${encodeURIComponent(email)}`
      );
      toast.success(
        "Password reset link sent to your email. You will be redirected shortly."
      );
      setTimeout(() => {
        window.location.href = "mailto:";
      }, 1000);
    } catch (error) {
      console.error("Error sending password reset link:", error);
      toast.error("Failed to send password reset link. Please try again.");
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchPasswordReset(email);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-6">
      <Toaster position="top-center" />

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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";

const validatePassword = (password: string): string | null => {
  if (password.length < 8 || password.length > 64) {
    return "Password must be between 8 and 64 characters.";
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).";
  }

  return null;
};

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pageAlert, setPageAlert] = useState<{
    variant: "default" | "destructive";
    title: string;
    description: string;
  } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setPageAlert({
        variant: "destructive",
        title: "Error",
        description: passwordError,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPageAlert({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match. Please try again.",
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5065/api/Authenticate/update/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            NewPassword: newPassword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      setPageAlert({
        variant: "default",
        title: "Success",
        description: "Your password has been reset successfully.",
      });
    } catch (error) {
      setPageAlert({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset password. Please try again.",
      });
    }
  };

  const handleAlertClose = () => {
    if (pageAlert?.variant === "default") {
      navigate("/login");
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
        <h1 className="text-3xl font-bold mb-6 text-center">Reset Password</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-primary)] p-6 rounded-lg shadow-lg border border-[var(--color-muted)]"
        >
          <div className="mb-4 space-y-2">
            <Label
              htmlFor="new-password"
              className="text-[var(--color-foreground)]"
            >
              New Password
            </Label>
            <Input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>
          <div className="mb-4 space-y-2">
            <Label
              htmlFor="confirm-password"
              className="text-[var(--color-foreground)]"
            >
              Confirm Password
            </Label>
            <Input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}

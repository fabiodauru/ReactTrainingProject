import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setConnectionError(false);

    try {
      const response = await fetch(
        "http://localhost:5065/api/Authenticate/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        }
      );

      if (response.ok) {
        navigate("/");
      } else {
        setError(true);
      }
    } catch (err) {
      setConnectionError(true);
    }
  };

  return (
    <AuthLayout title="Login Page">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Username/Email</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username or email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-[color:var(--color-accent-secondary)] hover:text-[color:var(--color-accent)] hover:underline font-medium transition-colors"
            >
              Register here
            </a>
          </p>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Forgot your password?{" "}
            <a
              href="/forgotPassword"
              className="text-[color:var(--color-accent-secondary)] hover:text-[color:var(--color-accent)] hover:underline font-medium transition-colors"
            >
              Reset it here
            </a>
          </p>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-[color:color-mix(in srgb,var(--color-error) 10%,transparent)] border border-[color:var(--color-error)]">
          <p className="text-[color:var(--color-error)] text-sm font-medium">
            Login failed. Please check your credentials.
          </p>
        </div>
      )}

      {connectionError && (
        <div className="mt-4 p-3 rounded-lg bg-[color:color-mix(in srgb,var(--color-error) 10%,transparent)] border border-[color:var(--color-error)]">
          <p className="text-[color:var(--color-error)] text-sm font-medium">
            Connection with backend failed
          </p>
        </div>
      )}
    </AuthLayout>
  );
}

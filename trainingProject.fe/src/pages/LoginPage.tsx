import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";

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
  }catch(err) {
    setConnectionError(true);
  }
    
  };

  return (
    <AuthLayout title="Login Page">
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Username/Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username/Email"
        />
        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded w-full transition"
        >
          Login
        </button>

        <p className="mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            <br />
            Register here
          </a>
        </p>
      </form>

      {error && (
        <p className="text-red-500 mt-4 hover:text-red-400">
          Login failed. Please check your credentials.
        </p>
      )}

      {connectionError && (
          <p className="text-red-500 mt-4 hover:text-red-400">
            Connection with backend failed
          </p>
      )}
    </AuthLayout>
  );
}

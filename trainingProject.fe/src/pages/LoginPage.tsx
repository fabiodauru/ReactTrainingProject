import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

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
  };

  return (
    <AuthLayout title="Login Page">
      <form onSubmit={handleSubmit}>
        <input
          className="border border-gray-300 p-2 rounded w-full mb-4"
          type="text"
          placeholder="Username/Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="border border-gray-300 p-2 rounded w-full mb-6"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        <p className="text-red-500 mt-4">
          Login failed. Please check your credentials.
        </p>
      )}
    </AuthLayout>
  );
}

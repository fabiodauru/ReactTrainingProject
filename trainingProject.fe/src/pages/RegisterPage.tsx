import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [registerFailedMessage, setRegisterFailedMessage] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [address, setAddress] = useState({
    street: "",
    zipCode: "",
    city: "",
    country: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== passwordConfirm) {
      setRegisterFailedMessage("Passwords do not match");
      return;
    }

    const response = await fetch(
      "http://localhost:5065/api/Authenticate/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          email,
          userFirstName,
          userLastName,
          address,
          birthday,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      navigate("/");
    } else {
      setRegisterFailedMessage(data.message || "Registration failed");
    }
  };

  return (
    <AuthLayout title="Register Page">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            value={userFirstName}
            onChange={(e) => setUserFirstName(e.target.value)}
            placeholder="First Name"
          />
          <FormInput
            label="Last Name"
            value={userLastName}
            onChange={(e) => setUserLastName(e.target.value)}
            placeholder="Last Name"
          />
        </div>

        <FormInput
          label="Birthday"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Street"
            type="text"
            placeholder="Street"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />
          <FormInput
            label="ZIP Code"
            type="text"
            placeholder="ZIP Code"
            value={address.zipCode}
            onChange={(e) =>
              setAddress({ ...address, zipCode: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="City"
            type="text"
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
          <FormInput
            label="Country"
            type="text"
            placeholder="Country"
            value={address.country}
            onChange={(e) =>
              setAddress({ ...address, country: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <FormInput
            label="Confirm Password"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Confirm Password"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded w-full transition"
        >
          Register
        </button>

        {registerFailedMessage && (
          <p className="text-red-500 mt-4">{registerFailedMessage}</p>
        )}

        <p className="mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            <br />
            Login here
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}

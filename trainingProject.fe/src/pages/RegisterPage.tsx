import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { DatePicker } from "../components/ui/datePicker";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";

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

export default function RegisterPage() {
  const navigate = useNavigate();

  const [registerFailedMessage, setRegisterFailedMessage] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [birthday, setBirthday] = useState<Date | undefined>(undefined);
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

    const passwordError = validatePassword(password);
    if (passwordError) {
      setRegisterFailedMessage(passwordError);
      return;
    }

    if (password !== passwordConfirm) {
      setRegisterFailedMessage("Passwords do not match");
      return;
    }

    const birthdayString = birthday
      ? birthday.toISOString().split("T")[0]
      : null;

    try {
      await api.post(ENDPOINTS.AUTH.REGISTER, {
        Username: username,
        Password: password,
        Email: email,
        UserFirstName: userFirstName,
        UserLastName: userLastName,
        Address: address,
        Birthday: birthdayString,
      });
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      setRegisterFailedMessage("Registration failed. Please try again.");
    }
  };

  return (
    <AuthLayout title="Register Page">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={userFirstName}
              onChange={(e) => setUserFirstName(e.target.value)}
              placeholder="First Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={userLastName}
              onChange={(e) => setUserLastName(e.target.value)}
              placeholder="Last Name"
              required
            />
          </div>
        </div>
        <DatePicker selectedDate={birthday} onDateChange={setBirthday} />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street</Label>
            <Input
              id="street"
              type="text"
              placeholder="Street"
              value={address.street}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              type="text"
              placeholder="ZIP Code"
              value={address.zipCode}
              onChange={(e) =>
                setAddress({ ...address, zipCode: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              className="border-solid"
              id="city"
              type="text"
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              type="text"
              placeholder="Country"
              value={address.country}
              onChange={(e) =>
                setAddress({ ...address, country: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Confirm Password</Label>
            <Input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm Password"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full mt-6">
          Register
        </Button>
        {registerFailedMessage && (
          <div className="mt-4 p-3 rounded-lg bg-[color:color-mix(in srgb,var(--color-error) 10%,transparent)] border border-[color:var(--color-error)]">
            <p className="text-[color:var(--color-error)] text-sm font-medium">
              {registerFailedMessage}
            </p>
          </div>
        )}
        <div className="text-center pt-2">
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[color:var(--color-accent-secondary)] hover:text-[color:var(--color-accent)] hover:underline font-medium transition-colors"
            >
              Login here
            </a>
          </p>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Forgot your password?{" "}
            <a
              href="/forgot-password"
              className="text-[color:var(--color-accent-secondary)] hover:text-[color:var(--color-accent)] hover:underline font-medium transition-colors"
            >
              Reset it here
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

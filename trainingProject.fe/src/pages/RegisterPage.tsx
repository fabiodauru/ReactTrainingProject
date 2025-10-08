import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import AuthLayout from "../components/AuthLayout";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [registerFailedMessage, setRegisterFailedMessage] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [address, setAddress] = useState({
    street: "",
    zipCode: "",
    city: "",
    country: "",
  });
  const [birthday, setBirthday] = useState("17/05/2006");

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          email: email,
          userFirstName: userFirstName,
          userLastName: userLastName,
          address: address,
          birthday: birthday,
        }),
      }
    );
    const data = await response.json();

    if (response.status === 200 && data.message === "Success") {
      navigate("/login");
    } else {
      setRegisterFailedMessage(data.message);
    }
  };

  return (
    <AuthLayout title="Register Page">
      <div className="register-container">
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="inputUsername">Username</label>
            <input
              type="text"
              placeholder="Username"
              id="inputUsername"
              onChange={(event) => setUsername(event.target.value)}
              value={username}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputEmail">Email</label>
            <input
              type="email"
              placeholder="Email"
              id="inputEmail"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputFirstName">First Name</label>
            <input
              type="text"
              placeholder="First Name"
              id="inputFirstName"
              onChange={(event) => setUserFirstName(event.target.value)}
              value={userFirstName}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputLastName">Last Name</label>
            <input
              type="text"
              placeholder="Last Name"
              id="inputLastName"
              onChange={(event) => setUserLastName(event.target.value)}
              value={userLastName}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputBirthday">Birthday</label>
            <input
              type="date"
              id="inputBirthday"
              onChange={(event) => setBirthday(event.target.value)}
              value={birthday}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputStreet">Street</label>
            <input
              type="text"
              placeholder="Street"
              id="inputStreet"
              onChange={(event) =>
                setAddress({ ...address, street: event.target.value })
              }
              value={address.street}
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputZipCode">ZIP Code</label>
            <input
              type="text"
              placeholder="ZIP Code"
              id="inputZipCode"
              onChange={(event) =>
                setAddress({ ...address, zipCode: event.target.value })
              }
              value={address.zipCode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputCity">City</label>
            <input
              type="text"
              placeholder="City"
              id="inputCity"
              onChange={(event) =>
                setAddress({ ...address, city: event.target.value })
              }
              value={address.city}
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputCountry">Country</label>
            <input
              type="text"
              placeholder="Country"
              id="inputCountry"
              onChange={(event) =>
                setAddress({ ...address, country: event.target.value })
              }
              value={address.country}
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputPassword">Password</label>
            <input
              type="password"
              placeholder="Password"
              id="inputPassword"
              onChange={(event) => setPassword(event.target.value)}
              value={password}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputPasswordConfirm">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm Password"
              id="inputPasswordConfirm"
              onChange={(event) => setPasswordConfirm(event.target.value)}
              value={passwordConfirm}
              required
            />
          </div>

          <button type="submit" className="register-btn">
            Register
          </button>

          <div className="error-message">{registerFailedMessage}</div>

          <div className="register-footer">
            <p className="mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-blue-500 hover:underline">
                <br />
                Login here
              </a>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

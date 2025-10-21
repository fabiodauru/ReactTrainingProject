import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { DatePicker } from "../components/ui/datePicker";
import DefaultPfp from "../assets/Default_pfp.svg";

type Address = {
  street: string;
  zipCode: string;
  city: string;
  country: string;
};

type User = {
  id: string;
  email?: string | null;
  username: string;
  userFirstName?: string | null;
  userLastName?: string | null;
  profilePictureUrl?: string | null;
  joiningDate?: string | null;
  address?: Address | null;
  birthday?: string | null;
};

export default function EditUser() {
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState("");

  const [email, setEmail] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [birthday, setBirthday] = useState<Date | undefined>(undefined);
  const [address, setAddress] = useState<Address>({
    street: "",
    zipCode: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleDeleteVisibility = () => {
    setDeleteVisible(!deleteVisible);
  };

  const fetchUserData = () => {
    fetch("http://localhost:5065/api/User/me", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data: User) => {
        setUser(data);
        setEmail(data.email ?? "");
        setUserFirstName(data.userFirstName ?? "");
        setUserLastName(data.userLastName ?? "");
        setAddress(
          data.address ?? { street: "", zipCode: "", city: "", country: "" }
        );
        if (data.birthday) {
          setBirthday(new Date(data.birthday));
        }
        console.log(data);
      })
      .catch((error) => {
        console.error("Failed to fetch user data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getProfilePictureUrl = (base64String?: string | null): string => {
    if (!base64String) {
      return DefaultPfp;
    }

    if (base64String.startsWith("data:")) {
      return base64String;
    }

    return `data:image/jpeg;base64,${base64String}`;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const birthdayString = birthday?.toISOString().split("T")[0];

    const response = await fetch("http://localhost:5065/api/User/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email,
        userFirstName,
        userLastName,
        address,
        birthday: birthdayString,
      }),
    });

    if (response.ok) {
      fetchUserData();
      alert("Profile updated successfully!");
    } else {
      alert("Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      alert("User information is unavailable. Please try again.");
      return;
    }

    if (confirmDeleteInput !== user.username) {
      alert(`Please type ${user.username} to confirm account deletion.`);
      return;
    }

    const response = await fetch("http://localhost:5065/api/User/delete", {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      window.location.href = "/login";
    } else {
      alert("Failed to delete account");
      setDeleteVisible(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--color-accent)] border-r-transparent"></div>
          <p className="mt-4 text-[var(--color-muted-foreground)]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <p className="text-[var(--color-error)]">Failed to load user data</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-background)] p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-6">
          Account Settings
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-1/4 lg:sticky lg:top-6 lg:self-start bg-[var(--color-primary)] p-6 rounded-xl border border-[var(--color-muted)] h-fit">
            <div className="flex flex-col items-center">
              <img
                src={getProfilePictureUrl(user.profilePictureUrl)}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-[var(--color-accent)]"
                onError={(e) => {
                  e.currentTarget.src = DefaultPfp;
                }}
              />
              <h2 className="text-center mt-4 text-xl font-semibold text-[var(--color-foreground)]">
                {user.username}
              </h2>
              <p className="text-center text-sm text-[var(--color-muted-foreground)] mt-1">
                {user.email}
              </p>
              {user.joiningDate && (
                <p className="text-center text-xs text-[var(--color-muted-foreground)] mt-2">
                  Joined {new Date(user.joiningDate).toLocaleDateString()}
                </p>
              )}
            </div>

            <nav className="mt-6 flex flex-col gap-2">
              <Button
                variant="ghost"
                className="justify-start text-[var(--color-foreground)] font-semibold border border-[var(--color-muted)] hover:border-[var(--color-accent)] hover:bg-[color:color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
                onClick={() => scrollToSection("profile")}
              >
                Profile
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-[var(--color-foreground)] font-semibold border border-[var(--color-muted)] hover:border-[var(--color-accent)] hover:bg-[color:color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
                onClick={() => scrollToSection("password")}
              >
                Password
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-[var(--color-error)] font-semibold border border-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[color:color-mix(in_srgb,var(--color-error)_10%,transparent)]"
                onClick={() => scrollToSection("danger-zone")}
              >
                Danger Zone
              </Button>
            </nav>
          </aside>

          <main className="flex-1 space-y-6">
            <section
              id="profile"
              className="bg-[var(--color-primary)] p-6 rounded-xl border border-[var(--color-muted)] scroll-mt-6"
            >
              <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-6">
                Personal Information
              </h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={user.username}
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={userFirstName}
                      onChange={(e) => setUserFirstName(e.target.value)}
                      placeholder="First Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={userLastName}
                      onChange={(e) => setUserLastName(e.target.value)}
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <DatePicker
                  selectedDate={birthday}
                  onDateChange={setBirthday}
                />

                <div className="pt-4 border-t border-[var(--color-muted)]">
                  <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
                    Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        value={address.street}
                        onChange={(e) =>
                          setAddress({ ...address, street: e.target.value })
                        }
                        placeholder="Street"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={address.zipCode}
                        onChange={(e) =>
                          setAddress({ ...address, zipCode: e.target.value })
                        }
                        placeholder="ZIP Code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) =>
                          setAddress({ ...address, city: e.target.value })
                        }
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={address.country}
                        onChange={(e) =>
                          setAddress({ ...address, country: e.target.value })
                        }
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6">
                  Save Changes
                </Button>
              </form>
            </section>

            <section
              id="password"
              className="bg-[var(--color-primary)] p-6 rounded-xl border border-[var(--color-muted)] scroll-mt-6"
            >
              <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-6">
                Change Password
              </h3>
            </section>

            <section
              id="danger-zone"
              className="bg-[var(--color-primary)] p-6 rounded-xl border border-[var(--color-error)] scroll-mt-6"
            >
              <h3 className="text-xl font-semibold text-[var(--color-error)] mb-4">
                Danger Zone
              </h3>
              <p className="text-[var(--color-muted-foreground)] mb-6">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteVisibility}
                className="w-full"
              >
                Delete Account
              </Button>
            </section>
          </main>
        </div>
      </div>

      {deleteVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleDeleteVisibility}
        >
          <div
            className="bg-[var(--color-primary)] border border-[var(--color-error)] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-[var(--color-error)]">
                Delete Account
              </h3>
            </div>

            <p className="text-[var(--color-foreground)] mb-2">
              Are you absolutely sure you want to delete your account?
            </p>

            <Input
              className="mb-4 mt-4 placeholder:text-[var(--color-muted-foreground)]"
              placeholder={`Type ${user.username} to confirm`}
              style={{ borderColor: "var(--color-error)" }}
              value={confirmDeleteInput}
              onChange={(e) => setConfirmDeleteInput(e.target.value)}
            />

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleDeleteVisibility}
                className="flex-1 text-[var(--color-foreground)] border border-[var(--color-muted)]"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="flex-1"
              >
                Delete Forever
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import DefaultPfp from "../assets/Default_pfp.svg";
import CameraIcon from "../assets/camera-svgrepo-com.svg";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";

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

export default function EditUser() {
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState("");
  const navigate = useNavigate();

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

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [pageAlert, setPageAlert] = useState<{
    variant: "default" | "destructive";
    title?: string;
    description: string;
  } | null>(null);

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
      });
  };

  const showAlert = (
    variant: "default" | "destructive",
    description: string,
    title?: string
  ) => setPageAlert({ variant, description, title });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showAlert(
        "destructive",
        "User information is unavailable. Please try again.",
        "Error"
      );
      return;
    }

    const updatedUser = {
      Email: email,
      UserFirstName: userFirstName,
      UserLastName: userLastName,
      Birthday: birthday ? birthday.toISOString().split("T")[0] : null,
      Address: address,
    };

    fetch("http://localhost:5065/api/User/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update user");
        }
        return response.json();
      })
      .then(() => {
        fetchUserData();
        showAlert("default", "Profile updated successfully.", "Success");
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        showAlert("destructive", "Failed to update profile.", "Error");
      });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      showAlert("destructive", "Please fill in all password fields.", "Error");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showAlert("destructive", passwordError, "Error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showAlert("destructive", "New passwords do not match.", "Error");
      return;
    }

    fetch("http://localhost:5065/api/User/update/password", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        OldPassword: oldPassword,
        NewPassword: newPassword,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          showAlert(
            "destructive",
            "Failed to change password. Please check your current password.",
            "Error"
          );
          throw new Error("Password change failed");
        }
        return response.json();
      })
      .then(() => {
        showAlert("default", "Password changed successfully.", "Success");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error changing password:", error);
      });
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      showAlert(
        "destructive",
        "User information is unavailable. Please try again.",
        "Error"
      );
      return;
    }

    if (confirmDeleteInput !== user.username) {
      showAlert(
        "destructive",
        `Please type ${user.username} to confirm account deletion.`,
        "Error"
      );
      return;
    }

    fetch("http://localhost:5065/api/User/delete", {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete account");
        }
        return response.json();
      })
      .then(() => {
        showAlert("default", "Account deleted successfully.", "Success");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error deleting account:", error);
        showAlert("destructive", "Failed to delete account.", "Error");
      });
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <p className="text-[var(--color-error)]">Failed to load user data</p>
      </div>
    );
  }

  function handleCameraClick() {
    showAlert(
      "default",
      "Profile picture change functionality is not implemented yet.",
      "Notice"
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-background)] p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-6">
          Account Settings
        </h1>

        {pageAlert && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setPageAlert(null)}
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
                  {pageAlert.title ??
                    (pageAlert.variant === "destructive" ? "Error" : "Notice")}
                </AlertTitle>
                <AlertDescription className="mt-2 text-[var(--color-foreground)]/90">
                  {pageAlert.description}
                </AlertDescription>

                <button
                  aria-label="Close alert"
                  onClick={() => setPageAlert(null)}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md
                     text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]
                     hover:bg-white/5 transition"
                >
                  ×
                </button>
              </Alert>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="bg-[var(--color-primary)] p-6 rounded-xl border border-[var(--color-muted)] w-64 flex-shrink-0 self-start">
            <div className="flex flex-col items-center">
              <div
                className="group relative w-24 h-24 cursor-pointer"
                onClick={handleCameraClick}
              >
                <img
                  src={DefaultPfp}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-[var(--color-accent)]"
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <img
                    src={CameraIcon}
                    alt="Change profile picture"
                    className="h-8 brightness-150 drop-shadow-md"
                  />
                  <span className="text-white text-xs mt-1 select-none">
                    Click to change
                  </span>
                </div>
              </div>

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

          {/* Profile Section */}

          <main className="flex-1 space-y-6">
            <section
              id="password"
              className="bg-[var(--color-primary)] p-6 rounded-xl border border-[var(--color-muted)] scroll-mt-6"
            >
              <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-6">
                Change Password
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="oldPassword"
                    className="text-[var(--color-foreground)]"
                  >
                    Current Password
                  </Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-[var(--color-foreground)]"
                  >
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmNewPassword"
                    className="text-[var(--color-foreground)]"
                  >
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button type="submit" className="w-full mt-6">
                  Change Password
                </Button>
              </form>
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

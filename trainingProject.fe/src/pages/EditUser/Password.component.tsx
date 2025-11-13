import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

export default function PasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const navigate = useNavigate();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      await api.patch(ENDPOINTS.USER.UPDATE_PASSWORD, {
        OldPassword: oldPassword,
        NewPassword: newPassword,
      });
      toast.success("Password changed successfully. Please log in again.");
      navigate("/login");
    } catch (error) {
      toast.error(
        "Failed to change password. Please check your current password."
      );
      console.error("Error changing password:", error);
    }
  };

  return (
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
  );
}

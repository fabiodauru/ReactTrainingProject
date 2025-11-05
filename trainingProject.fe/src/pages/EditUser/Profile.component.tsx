import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datePicker";
import type { Address, User } from "@/lib/type";
import { useState } from "react";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { toast } from "sonner";

type Props = {
  user: User;
  onUserUpdate: () => Promise<void>;
};

export default function ProfileForm({ user, onUserUpdate }: Props) {
  const [email, setEmail] = useState(user.email ?? "");
  const [userFirstName, setUserFirstName] = useState(user.userFirstName ?? "");
  const [userLastName, setUserLastName] = useState(user.userLastName ?? "");
  const [birthday, setBirthday] = useState<Date | undefined>(
    user.birthday ? new Date(user.birthday) : undefined
  );
  const [address, setAddress] = useState<Address>(
    user.address ?? { street: "", zipCode: "", city: "", country: "" }
  );

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser = {
      Email: email,
      UserFirstName: userFirstName,
      UserLastName: userLastName,
      Birthday: birthday ? birthday.toISOString().split("T")[0] : null,
      Address: address,
    };

    try {
      await api.patch(ENDPOINTS.USER.UPDATE, updatedUser);
      await onUserUpdate();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
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
            <Label htmlFor="email" className="text-[var(--color-foreground)]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-[var(--color-foreground)]"
            >
              Username
            </Label>
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
            <Label
              htmlFor="firstName"
              className="text-[var(--color-foreground)]"
            >
              First Name
            </Label>
            <Input
              id="firstName"
              value={userFirstName}
              onChange={(e) => setUserFirstName(e.target.value)}
              placeholder="First Name"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-[var(--color-foreground)]"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              value={userLastName}
              onChange={(e) => setUserLastName(e.target.value)}
              placeholder="Last Name"
            />
          </div>
        </div>

        <DatePicker selectedDate={birthday} onDateChange={setBirthday} />

        <div className="pt-4 border-t border-[var(--color-muted)]">
          <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
            Address
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="street"
                className="text-[var(--color-foreground)]"
              >
                Street
              </Label>
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
              <Label
                htmlFor="zipCode"
                className="text-[var(--color-foreground)]"
              >
                ZIP Code
              </Label>
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
              <Label htmlFor="city" className="text-[var(--color-foreground)]">
                City
              </Label>
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
              <Label
                htmlFor="country"
                className="text-[var(--color-foreground)]"
              >
                Country
              </Label>
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
  );
}

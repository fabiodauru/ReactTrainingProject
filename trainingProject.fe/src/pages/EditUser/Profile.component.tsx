import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datePicker";
import type { Address, User } from "@/lib/type";
import { useEffect, useState } from "react";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";

export default function ProfileForm() {
  const [user, setUser] = useState<User | null>(null);

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

  const fetchUserData = async () => {
    try {
      api.get<User>(`${ENDPOINTS.USER.ME}`).then((data) => {
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
      });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
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

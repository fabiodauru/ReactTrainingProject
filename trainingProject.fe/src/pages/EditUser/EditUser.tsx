import { Toaster } from "sonner";
import ProfileSidebar from "./Sidebar.component";
import ProfileForm from "./Profile.component";
import PasswordForm from "./Password.component";
import DeleteAccount from "./Delete.component";
import { useEffect, useState } from "react";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import type { User } from "@/lib/type";
import { toast } from "sonner";

export default function EditUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await api.get<User>(ENDPOINTS.USER.ME);
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--color-accent)] border-r-transparent"></div>
          <p className="mt-4 text-[var(--color-muted-foreground)]">
            Loading user data...
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
      <Toaster position="top-center" />
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-6">
          Account Settings
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <ProfileSidebar
            user={user}
            onNavigate={scrollToSection}
            onUserUpdate={setUser}
          />

          <main className="flex-1 space-y-6">
            <ProfileForm user={user} onUserUpdate={fetchUserData} />
            <PasswordForm />
            <DeleteAccount user={user} />
          </main>
        </div>
      </div>
    </div>
  );
}

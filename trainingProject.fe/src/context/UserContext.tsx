import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import type { User } from "@/lib/type";
import { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  user: User | null;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await api.get<User>(ENDPOINTS.USER.ME);
      setUser(userData);
    } catch {
      setUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

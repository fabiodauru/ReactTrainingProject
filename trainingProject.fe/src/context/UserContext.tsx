import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import type { User } from "@/lib/type";
import { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  username: string | null;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<User>(`${ENDPOINTS.USER.ME}`)
      .then((user) => {
        setUsername(user.username);
      })
      .catch(() => setUsername(null));
  }, []);

  return (
    <UserContext.Provider value={{ username }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

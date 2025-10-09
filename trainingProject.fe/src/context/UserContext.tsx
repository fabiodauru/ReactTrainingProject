import { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  username: string | null;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5065/api/Authenticate/me", {
      credentials: "include", // wichtig, wenn du Cookies nutzt
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        // falls dein Backend { username: "Giulian" } zurückgibt:
        if (data && data.username) setUsername(data.username);
        else setUsername(null);
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

import { useState } from "react";

const ID_KEY = "uome-user-id";
const NAME_KEY = "uome-user-name";

export function useCurrentUser() {
  const [userId, setUserId] = useState(() => {
    const stored = localStorage.getItem(ID_KEY);
    return stored ? Number(stored) : null;
  });
  const [userName, setUserName] = useState(
    () => localStorage.getItem(NAME_KEY) || ""
  );

  function setUser(id, name) {
    localStorage.setItem(ID_KEY, String(id));
    localStorage.setItem(NAME_KEY, name);
    setUserId(id);
    setUserName(name);
  }

  function clearUser() {
    localStorage.removeItem(ID_KEY);
    localStorage.removeItem(NAME_KEY);
    setUserId(null);
    setUserName("");
  }

  return { userId, userName, setUser, clearUser };
}

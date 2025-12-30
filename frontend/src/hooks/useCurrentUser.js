import { useState } from "react";

const KEY = "expense-tracker-user";

export function useCurrentUser(members) {
  const [user, setUser] = useState(
    () => localStorage.getItem(KEY) || ""
  );

  function chooseUser(name) {
    localStorage.setItem(KEY, name);
    setUser(name);
  }

  return { user, chooseUser };
}

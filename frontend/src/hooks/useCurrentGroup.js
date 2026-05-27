import { useState } from "react";

const ID_KEY = "uome-group-id";
const NAME_KEY = "uome-group-name";
const CODE_KEY = "uome-join-code";

export function useCurrentGroup() {
  const [groupId, setGroupId] = useState(() => {
    const stored = localStorage.getItem(ID_KEY);
    return stored ? Number(stored) : null;
  });
  const [groupName, setGroupName] = useState(
    () => localStorage.getItem(NAME_KEY) || ""
  );
  const [joinCode, setJoinCode] = useState(
    () => localStorage.getItem(CODE_KEY) || ""
  );

  function setGroup(id, name, code = "") {
    localStorage.setItem(ID_KEY, String(id));
    localStorage.setItem(NAME_KEY, name);
    localStorage.setItem(CODE_KEY, code);
    setGroupId(id);
    setGroupName(name);
    setJoinCode(code);
  }

  function clearGroup() {
    localStorage.removeItem(ID_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(CODE_KEY);
    setGroupId(null);
    setGroupName("");
    setJoinCode("");
  }

  return { groupId, groupName, joinCode, setGroup, clearGroup };
}

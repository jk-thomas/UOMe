import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { joinGroup } from "../api";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useCurrentGroup } from "../hooks/useCurrentGroup";
import UserSetup from "./UserSetup";

export default function JoinPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { userId, setUser } = useCurrentUser();
  const { setGroup } = useCurrentGroup();
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [needsUser, setNeedsUser] = useState(!userId);

  useEffect(() => {
    if (!userId || needsUser) return;

    let cancelled = false;
    setJoining(true);
    setError("");

    joinGroup(token, userId)
      .then((result) => {
        if (cancelled) return;
        setGroup(result.group_id, "Joined group", token);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setJoining(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, token, needsUser, setGroup, navigate]);

  function handleUserComplete(id, name) {
    setUser(id, name);
    setNeedsUser(false);
  }

  if (needsUser) {
    return <UserSetup onComplete={handleUserComplete} />;
  }

  if (joining) {
    return (
      <div className="container setup-screen">
        <p>Joining group…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container setup-screen">
        <h2>Could not join group</h2>
        <p className="error-msg">{error}</p>
        <button type="button" onClick={() => navigate("/")}>
          Go home
        </button>
      </div>
    );
  }

  return null;
}

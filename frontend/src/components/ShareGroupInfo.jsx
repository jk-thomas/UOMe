import { useState } from "react";

export default function ShareGroupInfo({
  groupName,
  joinCode,
  onContinue,
  onClose,
}) {
  const joinUrl = `${window.location.origin}/join/${joinCode}`;
  const [copied, setCopied] = useState(false);
  const isModal = Boolean(onClose);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const content = (
    <>
      <h2>{isModal ? "Share group" : "Group created"}</h2>
      <p>
        Share this link so others can join <strong>{groupName}</strong>.
      </p>

      <div className="share-box">
        <div className="share-label">Join code</div>
        <code>{joinCode}</code>

        <div className="share-label">Invite link</div>
        <code className="share-link">{joinUrl}</code>

        <button type="button" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      <div className="share-actions">
        {onContinue && (
          <button type="button" onClick={onContinue}>
            Continue to ledger
          </button>
        )}
        {onClose && (
          <button type="button" onClick={onClose}>
            Done
          </button>
        )}
      </div>
    </>
  );

  if (isModal) {
    return (
      <div
        className="modal-backdrop"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal share-modal">{content}</div>
      </div>
    );
  }

  return <div className="container setup-screen">{content}</div>;
}

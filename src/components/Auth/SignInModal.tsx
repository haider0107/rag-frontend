import { SignIn } from "@clerk/clerk-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SignInModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <SignIn />
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
}

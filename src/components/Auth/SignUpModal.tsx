import { SignUp } from "@clerk/clerk-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SignUpModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <SignUp />
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
}

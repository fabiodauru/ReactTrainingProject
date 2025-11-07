import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { User } from "@/lib/type";

type Props = {
  user: User;
};

export default function DeleteAccount({ user }: Props) {
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState("");
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (confirmDeleteInput !== user.username) {
      toast.error(`Please type ${user.username} to confirm account deletion.`);
      return;
    }

    try {
      await api.delete(ENDPOINTS.USER.DELETE);
      toast.success("Account deleted successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account.");
    }
  };

  return (
    <>
      <section
        id="danger-zone"
        className="bg-[var(--color-primary)] p-6 rounded-xl border border-[var(--color-error)] scroll-mt-6"
      >
        <h3 className="text-xl font-semibold text-[var(--color-error)] mb-4">
          Danger Zone
        </h3>
        <p className="text-[var(--color-muted-foreground)] mb-6">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => setDeleteVisible(true)}
        >
          Delete Account
        </Button>
      </section>

      {deleteVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setDeleteVisible(false)}
        >
          <div
            className="bg-[var(--color-primary)] border border-[var(--color-error)] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-[var(--color-error)]">
                Delete Account
              </h3>
            </div>

            <p className="text-[var(--color-foreground)] mb-2">
              Are you absolutely sure you want to delete your account?
            </p>

            <Input
              className="mb-4 mt-4 placeholder:text-[var(--color-muted-foreground)]"
              placeholder={`Type ${user.username} to confirm`}
              style={{ borderColor: "var(--color-error)" }}
              value={confirmDeleteInput}
              onChange={(e) => setConfirmDeleteInput(e.target.value)}
            />

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setDeleteVisible(false)}
                className="flex-1 text-[var(--color-foreground)] border border-[var(--color-muted)]"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="flex-1"
              >
                Delete Forever
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

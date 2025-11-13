import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import DefaultPfp from "@/assets/Default_pfp.svg";
import CameraIcon from "@/assets/camera-svgrepo-com.svg";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/type";
import { fileToBase64 } from "@/lib/utils";
import { useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  user: User;
  onNavigate: (id: string) => void;
  onUserUpdate: (updatedUser: User) => void;
};

export default function ProfileSidebar({
  user,
  onNavigate,
  onUserUpdate,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleProfilePictureChange = async (file: File) => {
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validImageTypes.includes(file.type)) {
            toast.error("Invalid image type. Please use JPEG, PNG, GIF, or WebP format.");
      return;
    }

    setIsUploading(true);
    const base64Image = await fileToBase64(file);

    try {
      const response = await api.patch<User>(ENDPOINTS.USER.UPDATE, {
        ProfilePictureUrl: base64Image,
      });

      onUserUpdate(response);

      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to update profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      setIsUploading(true);
      const response = await api.patch<User>(ENDPOINTS.USER.UPDATE, {
        ProfilePictureUrl: null,
      });

      onUserUpdate(response);

      toast.success("Profile picture removed!");
    } catch (error) {
      toast.error("Failed to remove profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProfilePictureChange(file);
    }
  };

  return (
    <aside className="bg-[var(--color-primary)] p-6 rounded-xl border border-[var(--color-muted)] w-64 flex-shrink-0 self-start">
      <div className="flex flex-col items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div
          className="group relative w-24 h-24 cursor-pointer"
          onClick={handleCameraClick}
        >
          <img
            src={user.profilePictureUrl || DefaultPfp}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-2 border-[var(--color-accent)]"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            {isUploading ? (
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
            ) : (
              <>
                <img
                  src={CameraIcon}
                  alt="Change profile picture"
                  className="h-8 brightness-150 drop-shadow-md"
                />
                <span className="text-white text-xs mt-1 select-none">
                  Click to change
                </span>
              </>
            )}
          </div>
        </div>

        {user.profilePictureUrl && (
          <button
            onClick={handleRemoveProfilePicture}
            disabled={isUploading}
            className="mt-2 text-xs text-[var(--color-error)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove picture
          </button>
        )}

        <h2 className="text-center mt-4 text-xl font-semibold text-[var(--color-foreground)]">
          {user.username}
        </h2>
        <p className="text-center text-sm text-[var(--color-muted-foreground)] mt-1">
          {user.email}
        </p>
        {user.joiningDate && (
          <p className="text-center text-xs text-[var(--color-muted-foreground)] mt-2">
            Joined {new Date(user.joiningDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <nav className="mt-6 flex flex-col gap-2">
        <Button
          variant="ghost"
          className="justify-start text-[var(--color-foreground)] font-semibold border border-[var(--color-muted)] hover:border-[var(--color-accent)] hover:bg-[color:color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
          onClick={() => onNavigate("profile")}
        >
          Profile
        </Button>
        <Button
          variant="ghost"
          className="justify-start text-[var(--color-foreground)] font-semibold border border-[var(--color-muted)] hover:border-[var(--color-accent)] hover:bg-[color:color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
          onClick={() => onNavigate("password")}
        >
          Password
        </Button>
        <Button
          variant="ghost"
          className="justify-start text-[var(--color-error)] font-semibold border border-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[color:color-mix(in_srgb,var(--color-error)_10%,transparent)]"
          onClick={() => onNavigate("danger-zone")}
        >
          Danger Zone
        </Button>
      </nav>
    </aside>
  );
}

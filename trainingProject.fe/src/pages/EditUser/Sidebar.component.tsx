import DefaultPfp from "@/assets/Default_pfp.svg";
import CameraIcon from "@/assets/camera-svgrepo-com.svg";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/type";
import { toast } from "sonner";

type Props = {
  user: User;
  onNavigate: (id: string) => void;
};

export default function ProfileSidebar({ user, onNavigate }: Props) {
  const handleCameraClick = () => {
    toast.info("Profile picture change not implemented yet");
  };

  return (
    <aside className="bg-[var(--color-primary)] p-6 rounded-xl border border-[var(--color-muted)] w-64 flex-shrink-0 self-start">
      <div className="flex flex-col items-center">
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
            <img
              src={CameraIcon}
              alt="Change profile picture"
              className="h-8 brightness-150 drop-shadow-md"
            />
            <span className="text-white text-xs mt-1 select-none">
              Click to change
            </span>
          </div>
        </div>

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

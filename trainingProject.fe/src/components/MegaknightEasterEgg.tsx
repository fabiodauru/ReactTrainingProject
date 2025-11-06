import { useEffect, useRef, useState } from "react";

const MEGAKNIGHT_IMAGE_URL =
  "https://gladiatorboost.com/wp-content/uploads/2025/02/Clash-Royale-Best-Mega-Knight-Decks.jpg";

const DISPLAY_DURATION = 3500;

const MegaknightEasterEgg = () => {
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Listen for any input changes and trigger the easter egg when "67" appears.
    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement | null;

      if (!target || typeof target.value !== "string") {
        return;
      }

      if (target.value.includes("67")) {
        setIsVisible(true);
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = window.setTimeout(() => {
          setIsVisible(false);
        }, DISPLAY_DURATION);
      }
    };

    document.addEventListener("input", handleInput, true);

    return () => {
      document.removeEventListener("input", handleInput, true);
      window.clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
      <img
        src={MEGAKNIGHT_IMAGE_URL}
        alt="Mega Knight from Clash Royale"
        className="h-[60vh] max-h-[400px] w-auto animate-bounce drop-shadow-[0_0_25px_rgba(0,0,0,0.6)]"
      />
    </div>
  );
};

export default MegaknightEasterEgg;

import { useEffect, useMemo, useRef, useState } from "react";

const MEGAKNIGHT_IMAGE_URL =
  "https://gladiatorboost.com/wp-content/uploads/2025/02/Clash-Royale-Best-Mega-Knight-Decks.jpg";

const DISPLAY_DURATION = 3000;
const BLACKSCREEN_DURATION = 1500;
const GIF_DURATION = 67000;

const MegaknightEasterEgg = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showBlackscreen, setShowBlackscreen] = useState(false);
  const [showSixSeven, setShowSixSeven] = useState(false);
  const hideTimeoutRef = useRef<number | undefined>(undefined);
  const blackscreenTimeoutRef = useRef<number | undefined>(undefined);
  const sixtySevenTimeoutRef = useRef<number | undefined>(undefined);

  const gifPositions = useMemo(() => {
    if (!showSixSeven) return [];
    return Array.from({ length: 20 }).map(() => ({
      top: Math.random() * 70,
      left: Math.random() * 70,
      duration: 2 + Math.random() * 2,
    }));
  }, [showSixSeven]);

  useEffect(() => {
    // Listen for any input changes and trigger the easter egg when "67" appears.
    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement | null;

      if (!target || typeof target.value !== "string") {
        return;
      }

      if (target.value.includes("67")) {
        setIsVisible(true);
        setShowBlackscreen(false);
        setShowSixSeven(false);
        window.clearTimeout(hideTimeoutRef.current);
        window.clearTimeout(blackscreenTimeoutRef.current);
        window.clearTimeout(sixtySevenTimeoutRef.current);

        hideTimeoutRef.current = window.setTimeout(() => {
          setIsVisible(false);
          setShowBlackscreen(true);

          blackscreenTimeoutRef.current = window.setTimeout(() => {
            setShowBlackscreen(false);
            setShowSixSeven(true);

            sixtySevenTimeoutRef.current = window.setTimeout(() => {
              setShowSixSeven(false);
            }, GIF_DURATION);
          }, BLACKSCREEN_DURATION);
        }, DISPLAY_DURATION);
      }
    };

    document.addEventListener("input", handleInput, true);

    return () => {
      document.removeEventListener("input", handleInput, true);
      window.clearTimeout(hideTimeoutRef.current);
      window.clearTimeout(blackscreenTimeoutRef.current);
      window.clearTimeout(sixtySevenTimeoutRef.current);
    };
  }, []);

  if (showBlackscreen) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-black">
        <h1 className="text-4xl font-bold text-white md:text-6xl">
          you have been megaknighted
        </h1>
      </div>
    );
  }

  if (showSixSeven) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        {gifPositions.map((position, index) => (
          <iframe
            key={index}
            src="https://tenor.com/embed/11824772831247572536"
            width="200"
            height="200"
            frameBorder="0"
            allowFullScreen
            className="absolute animate-spin"
            style={{
              top: `${position.top}%`,
              left: `${position.left}%`,
              animationDuration: `${position.duration}s`,
            }}
          />
        ))}
      </div>
    );
  }

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

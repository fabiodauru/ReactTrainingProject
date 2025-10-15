import { useCallback, useEffect, useState } from "react";

export default function ImageCarouselModal({
  imageUrls,
  isOpen,
  onClose,
}: {
  imageUrls: string[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const hasImages = imageUrls.length > 0;

  useEffect(() => {
    if (isOpen) setIndex(0);
  }, [isOpen, imageUrls]);

  const goNext = useCallback(() => {
    if (!hasImages) return;
    setIndex((prev) => (prev + 1) % imageUrls.length);
  }, [hasImages, imageUrls.length]);

  const goPrev = useCallback(() => {
    if (!hasImages) return;
    setIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  }, [hasImages, imageUrls.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (!hasImages) return;
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, hasImages, goNext, goPrev, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        {hasImages ? (
          <>
            <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-black/40">
              <img
                key={imageUrls[index]}
                src={imageUrls[index]}
                alt={`Trip photo ${index + 1} of ${imageUrls.length}`}
                className="max-h-[65vh] w-full rounded-xl object-contain"
                loading="lazy"
              />

              {imageUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-lg font-semibold text-white transition hover:bg-white/25"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-lg font-semibold text-white transition hover:bg-white/25"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-white/60">
              <span>
                Image {index + 1} of {imageUrls.length}
              </span>
              {imageUrls.length > 1 && (
                <div className="flex items-center gap-2">
                  {imageUrls.map((_, dotIndex) => (
                    <span
                      key={dotIndex}
                      className={`h-2 w-2 rounded-full transition ${
                        dotIndex === index ? "bg-emerald-400" : "bg-white/25"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm text-white/60">
            No images found for this trip.
          </div>
        )}
      </div>
    </div>
  );
}

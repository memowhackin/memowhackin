import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { fetchImageBlob, type SiteImage } from "@/config/scanner";

/*
 * The full-screen viewer for the harvested homepage images.
 *
 * It is a real dialog, not a styled div: the page behind it stops scrolling,
 * Escape and a backdrop click close it, the arrow keys move between images, and
 * focus is put inside on open and returned to the opener on close. A gallery
 * that a keyboard cannot drive is a gallery half the visitors cannot use.
 *
 * Download is best-effort by necessity. Nearly every image here is served from
 * a third-party CDN that does not send permissive CORS headers, so a
 * fetch-to-blob download would be blocked. It is attempted anyway, because it
 * works for same-origin and cooperative hosts, and it falls back to opening the
 * original in a new tab, where the reader can save it themselves. The button
 * never silently does nothing.
 */

/** A filename for the download, derived from the URL or a stable fallback. */
function filenameFor(url: string): string {
  try {
    const path = new URL(url).pathname;
    const base = path.split("/").filter(Boolean).pop();
    if (base !== undefined && base.length > 0) return base.slice(0, 120);
  } catch {
    // Falls through to the default below.
  }
  return "image";
}

export function ImageLightbox({
  images,
  startIndex,
  onClose,
}: {
  images: readonly SiteImage[];
  startIndex: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(startIndex);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const clamp = useCallback(
    (next: number) => ((next % images.length) + images.length) % images.length,
    [images.length],
  );

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => clamp(current + delta));
    },
    [clamp],
  );

  // Scroll lock, focus, and keyboard, for as long as the viewer is mounted.
  useEffect(() => {
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => closeRef.current?.focus());

    function onKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          go(1);
          break;
        case "ArrowLeft":
          go(-1);
          break;
        default:
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [go, onClose]);

  // Keep the active thumbnail in view as the selection moves.
  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [index]);

  const image = images[index];
  if (image === undefined) return null;

  async function download(target: SiteImage) {
    try {
      const blob = await fetchImageBlob(target.url);
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = filenameFor(target.url);
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(href);
    } catch {
      // Cross-origin without CORS: opening the original is the honest fallback.
      window.open(target.url, "_blank", "noopener,noreferrer");
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("scanner.report.lightbox.title")}
      data-testid="scan-image-lightbox"
      className="bg-ink-deep/85 fixed inset-0 z-[110] flex flex-col backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* The bar: what you are looking at, and the ways out. */}
      <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
        <div className="flex min-w-0 flex-col">
          <span className="text-mist font-mono text-sm tabular-nums">
            {index + 1} / {images.length}
          </span>
          <span
            className="text-mist/55 truncate font-mono text-xs"
            title={image.url}
          >
            {image.origin}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void download(image)}
            data-testid="scan-image-download"
            className="text-mist hover:bg-mist/15 ring-mist/15 inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-sm font-medium ring-1 transition-colors"
          >
            <Download className="size-4" aria-hidden="true" />
            {t("scanner.report.lightbox.download")}
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("scanner.report.lightbox.close")}
            data-testid="scan-image-close"
            className="text-mist hover:bg-mist/15 ring-mist/15 inline-flex size-10 items-center justify-center rounded-full bg-black/30 ring-1 transition-colors"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* The image, and the arrows that walk the set. */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t("scanner.report.lightbox.previous")}
              className="text-mist hover:bg-mist/15 ring-mist/15 absolute left-2 z-10 inline-flex size-11 items-center justify-center rounded-full bg-black/30 ring-1 transition-colors sm:left-4"
            >
              <ChevronLeft className="size-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t("scanner.report.lightbox.next")}
              className="text-mist hover:bg-mist/15 ring-mist/15 absolute right-2 z-10 inline-flex size-11 items-center justify-center rounded-full bg-black/30 ring-1 transition-colors sm:right-4"
            >
              <ChevronRight className="size-6" aria-hidden="true" />
            </button>
          </>
        )}

        <img
          key={image.url}
          src={image.url}
          alt=""
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full rounded-lg object-contain"
        />
      </div>

      {/* The strip: every image, scrollable, the current one lit. */}
      <div ref={stripRef} className="flex gap-2 overflow-x-auto p-4 sm:px-6">
        {images.map((thumb, thumbIndex) => (
          <button
            key={thumb.url}
            type="button"
            data-active={thumbIndex === index}
            onClick={() => setIndex(thumbIndex)}
            aria-label={t("scanner.report.lightbox.goTo", {
              index: thumbIndex + 1,
            })}
            className={clsx(
              "bg-ink relative aspect-[4/3] h-14 shrink-0 overflow-hidden rounded-md ring-1 transition-all",
              thumbIndex === index
                ? "ring-lavender opacity-100"
                : "ring-mist/10 opacity-50 hover:opacity-90",
            )}
          >
            <img
              src={thumb.url}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="size-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}

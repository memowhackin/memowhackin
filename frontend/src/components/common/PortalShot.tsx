import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { LogoMark } from "@/components/common/Logo";

interface PortalShotProps {
  /** Where the screenshot will live, e.g. `/assets/argus/insights.webp`. */
  src: string;
  /** i18n key for the alt text. Describes the screen, not the file. */
  altKey: string;
  /** i18n key for the line under the frame, naming the shot that belongs here. */
  captionKey: string;
  /**
   * The shape of the screen being shown, not a styling preference.
   *
   * A findings table is wide, a single finding runs down the page, a
   * conversation is a narrow column. Framing all three at 16:10 would either
   * crop two of them or float them in empty chrome, and a screenshot that has
   * been cropped to fit a frame stops being evidence of anything.
   */
  aspect?: "wide" | "panel" | "tall";
  /**
   * Drop the line under the frame. For the back frame of a stack, where one
   * picture is made of two frames and two captions would read as two pictures.
   */
  hideCaption?: boolean;
  className?: string;
}

const ASPECT = {
  wide: "aspect-[16/10]",
  panel: "aspect-[4/3]",
  tall: "aspect-[3/4]",
} as const;

/**
 * A screenshot of the portal, or a designed space waiting for one.
 *
 * The image is rendered first and the placeholder only replaces it if the file
 * is not there, which is the same trick the about page uses for the founder's
 * portrait. Two things fall out of that, and both are the point:
 *
 * - dropping `insights.webp` into `public/assets/argus/` is the whole of
 *   publishing that screenshot. No code change, no ticket, no deploy that
 *   somebody has to remember to pair with the asset;
 * - the page is never broken while the asset is missing. It shows a frame with
 *   the name of the shot that belongs in it, which doubles as the brief for
 *   whoever takes it.
 *
 * The frame holds its aspect ratio in both states, so the real screenshot lands
 * into exactly the space the placeholder was keeping and nothing below it moves.
 */
export function PortalShot({
  src,
  altKey,
  captionKey,
  aspect = "wide",
  hideCaption = false,
  className,
}: PortalShotProps) {
  const { t } = useTranslation();
  const [missing, setMissing] = useState(false);

  return (
    <figure className={clsx("m-0 flex flex-col gap-3", className)}>
      <div
        className={clsx(
          "border-indigo-deep bg-ink-deep relative w-full overflow-hidden rounded-xl border",
          ASPECT[aspect],
        )}
      >
        {missing ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center"
            data-testid="portal-shot-placeholder"
          >
            {/*
              The mark at a whisper, the way the footer and the about page use
              it. Loud enough that the space reads as designed rather than as a
              failed request, quiet enough that nobody mistakes it for content.
            */}
            <LogoMark className="text-lavender/20 w-12" aria-hidden="true" />

            <div className="flex flex-col gap-1">
              <span className="eyebrow text-lavender/60">
                {t("shots.pending")}
              </span>
              <span className="text-mist/70 max-w-sm text-sm leading-relaxed text-pretty">
                {t(captionKey)}
              </span>
            </div>
          </div>
        ) : (
          <img
            src={src}
            alt={t(altKey)}
            loading="lazy"
            data-testid="portal-shot-image"
            className="absolute inset-0 size-full object-cover object-top"
            onError={() => {
              setMissing(true);
            }}
          />
        )}
      </div>

      {/*
        The caption stays under the frame in both states. While the shot is
        missing it reads as a brief; once it lands it reads as a caption, which
        is what a screenshot of a product screen needs anyway: the reader should
        not have to work out what they are looking at.
      */}
      {!hideCaption && (
        <figcaption className="text-mist/50 text-sm leading-relaxed text-pretty">
          {t(captionKey)}
        </figcaption>
      )}
    </figure>
  );
}

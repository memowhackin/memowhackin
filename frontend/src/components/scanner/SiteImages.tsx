import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { GlassPanel } from "@/components/scanner/GlassPanel";
import { ImageLightbox } from "@/components/scanner/ImageLightbox";
import {
  SECTION_SHELL,
  SectionHeading,
} from "@/components/scanner/SectionHeading";
import type { SiteImage } from "@/config/scanner";

/*
 * The pictures the site puts on its own front page.
 *
 * Held inside one frosted container rather than spread across the page, and
 * capped: the first four are shown, and the rest live behind a "+N" tile that
 * opens the full set in the viewer. A homepage can reference two dozen images,
 * and two dozen tiles turned a supporting section into the largest thing on the
 * report. Four is enough to show the brand assets, which is the point that
 * matters, and the viewer carries the rest.
 *
 * Every tile opens the viewer, where the image is shown large, the whole set is
 * scrollable, and each one can be downloaded. See `ImageLightbox`.
 */

const KIND_ORDER: Record<string, number> = {
  icon: 0,
  logo: 1,
  social: 2,
  content: 3,
};

const VISIBLE = 4;

/** Bytes as a short human figure. Tabular, so a column of them lines up. */
function size(bytes: number | undefined): string | undefined {
  if (bytes === undefined || bytes <= 0) return undefined;
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${String(Math.round(bytes / 1024))} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * One tile.
 *
 * A load failure removes it rather than leaving the browser's broken-image
 * glyph. The server already confirmed each URL answers 200 with an image
 * content type, so this catches the narrower case: a host that refuses the
 * request when the referrer is not its own site.
 */
function Tile({ image, onOpen }: { image: SiteImage; onOpen: () => void }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const bytes = size(image.bytes);

  if (failed) return null;

  /*
   * Brand marks are letterboxed on the transparency plate, because cropping a
   * logo defeats the point of showing it. Photographs fill their tile instead:
   * a thumbnail may be cropped without losing what it is for.
   */
  const brand = image.kind !== "content";

  return (
    <li className="flex min-w-0 flex-col gap-2">
      <button
        type="button"
        onClick={onOpen}
        data-testid="scan-image-tile"
        className={clsx(
          "focus-visible:outline-lavender group relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2",
          brand ? "image-plate p-4" : "bg-ink-deep",
        )}
      >
        <img
          src={image.url}
          alt=""
          loading="lazy"
          decoding="async"
          /*
           * The scanned site must not learn which report is looking at it.
           * Without this the request carries our result URL in the referrer.
           */
          referrerPolicy="no-referrer"
          onError={() => {
            setFailed(true);
          }}
          className={clsx(
            "transition-transform duration-300 group-hover:scale-[1.03]",
            brand
              ? "max-h-full max-w-full object-contain"
              : "size-full object-cover",
          )}
        />
      </button>

      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-mist/75 truncate text-sm">
          {t(`scanner.report.imageKinds.${image.kind}`, {
            defaultValue: t("scanner.report.imageKinds.content"),
          })}
        </p>
        <p
          className="text-mist/45 truncate font-mono text-xs tabular-nums"
          title={image.url}
        >
          {image.origin}
          {bytes === undefined ? "" : ` · ${bytes}`}
        </p>
      </div>
    </li>
  );
}

export function SiteImages({
  images,
  domain,
}: {
  images: readonly SiteImage[];
  domain: string;
}) {
  const { t } = useTranslation();
  const [lightbox, setLightbox] = useState<number | undefined>(undefined);

  if (images.length === 0) return null;

  const ordered = [...images].sort(
    (a, b) => (KIND_ORDER[a.kind] ?? 4) - (KIND_ORDER[b.kind] ?? 4),
  );

  const shown = ordered.slice(0, VISIBLE);
  const hidden = ordered.length - shown.length;

  /*
   * The security point of the section, as opposed to the pleasant one. Each
   * foreign host serving a picture on the homepage is a supplier who sees every
   * visitor's address and can change what they are shown, and almost nobody has
   * counted them.
   */
  const foreign = new Set(
    ordered
      .map((image) => image.origin)
      .filter((origin) => origin !== domain && !origin.endsWith(`.${domain}`)),
  );

  return (
    <section data-testid="scan-images" className={SECTION_SHELL}>
      <SectionHeading
        id="images"
        title={t("scanner.report.imagesTitle")}
        count={String(ordered.length)}
      />

      {foreign.size > 0 && (
        <p className="text-mist/60 max-w-2xl text-sm leading-relaxed text-pretty sm:text-base">
          {t("scanner.report.imagesOrigins", {
            count: foreign.size,
            origins: [...foreign].join(", "),
          })}
        </p>
      )}

      <GlassPanel innerClassName="p-5 sm:p-6">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {shown.map((image, imageIndex) => (
            <Tile
              key={image.url}
              image={image}
              onOpen={() => {
                setLightbox(imageIndex);
              }}
            />
          ))}

          {hidden > 0 && (
            <li className="flex min-w-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setLightbox(VISIBLE);
                }}
                data-testid="scan-images-more"
                className="glass text-mist focus-visible:outline-lavender grid aspect-[4/3] w-full place-items-center rounded-xl transition hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="flex flex-col items-center gap-1">
                  <span className="font-display text-2xl leading-none tabular-nums">
                    +{hidden}
                  </span>
                  <span className="text-mist/60 text-sm">
                    {t("scanner.report.imagesMore", { count: hidden })}
                  </span>
                </span>
              </button>
            </li>
          )}
        </ul>
      </GlassPanel>

      {lightbox !== undefined && (
        <ImageLightbox
          images={ordered}
          startIndex={lightbox}
          onClose={() => {
            setLightbox(undefined);
          }}
        />
      )}
    </section>
  );
}

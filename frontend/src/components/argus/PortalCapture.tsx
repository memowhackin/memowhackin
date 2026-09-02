import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

/*
 * A slot a real screenshot crop will land in, wearing its drawn stand-in until
 * it does.
 *
 * The inverse of `PortalShot`'s trade. That component shows an empty designed
 * frame while its asset is missing, which is honest but leaves the page looking
 * unfinished; this one shows the composition drawn from the portal's own
 * fragments — sample data, marked as such — and quietly upgrades itself the
 * moment the file exists. Dropping `monthly-trend.webp` into
 * `public/assets/argus/` is the whole of publishing that crop: no code change,
 * no redeploy to pair with the asset.
 *
 * The image never renders while it is missing (it stays `hidden` until its
 * `load` event), so there is no broken-image flash and the drawn fragment is
 * what the prerenderer bakes.
 */
export function PortalCapture({
  shot,
  altKey,
  children,
}: {
  /** File stem under `/assets/argus/`, e.g. `monthly-trend`. */
  shot: string;
  /** Alt text for the day the real crop exists. Describes the screen. */
  altKey: string;
  /** The drawn stand-in. */
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);

  return (
    <div data-testid={`portal-capture-${shot}`}>
      {!loaded && children}

      <img
        src={`/assets/argus/${shot}.webp`}
        alt={loaded ? t(altKey) : ""}
        loading="lazy"
        onLoad={() => {
          setLoaded(true);
        }}
        className={
          loaded
            ? "border-indigo-deep block h-auto w-full rounded-xl border"
            : "hidden"
        }
      />
    </div>
  );
}

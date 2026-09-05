import { useEffect, useRef } from "react";
import clsx from "clsx";

const FOOTAGE_BOX =
  "absolute top-0 left-[-4.219%] h-[108.52%] w-[108.49%] max-w-none";
export function BannerFootage({ playing }: { playing: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playing) return;

    const video = videoRef.current;
    if (!video) return;

    /*
     * Set as a property rather than an attribute: `disableRemotePlayback` is
     * not in React's known-prop list, so writing it in JSX would render the
     * string "true" and a boolean attribute would be ignored.
     */
    video.disableRemotePlayback = true;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        void video.play().catch(() => {
          // Refused autoplay is not an error worth surfacing: the poster under
          // the video is the same picture, and it is already on screen.
        });
      } else {
        video.pause();
      }
    });

    observer.observe(video);
    return () => {
      observer.disconnect();
    };
  }, [playing]);

  return (
    <>
      {playing && (
        <video
          ref={videoRef}
          className={clsx(FOOTAGE_BOX, "pointer-events-none object-cover")}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          /*
           * This is wallpaper, not media. Every affordance a browser attaches
           * to a <video> by itself is wrong here and is switched off:
           * `controls={false}` and `disablePictureInPicture` remove the play,
           * pause and picture-in-picture buttons some mobile browsers overlay
           * on a large video regardless of whether controls were asked for —
           * which is the pause button that was showing on a phone — and the
           * cast button goes with `disableRemotePlayback` in the effect above.
           *
           * `aria-hidden` with `tabIndex={-1}` keeps it out of the accessibility
           * tree and the tab order, so it is not an unlabelled stop for a
           * screen reader or a keyboard. `pointer-events-none` is repeated here
           * rather than left to the wrapper: it is what makes a tap fall
           * through to the page instead of waking the native controls.
           */
          controls={false}
          disablePictureInPicture
          tabIndex={-1}
          aria-hidden="true"
          data-testid="hero-backdrop-video"
        >
          <source src="/assets/hero-banner.mp4" type="video/mp4" />
        </video>
      )}
    </>
  );
}

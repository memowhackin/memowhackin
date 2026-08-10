import { useEffect, useRef } from "react";
import clsx from "clsx";

/*
 * 2083x1172 at (-81, 0) on the frame's 1920x1080 banner.
 *
 * `max-w-none` is not decoration. The base layer caps every `video` at
 * `max-width: 100%`, so this box was coming out 1920 wide while the height took
 * — a 1.64 box for 16:9 footage, which `object-cover` then filled by cropping
 * the sides. That moved the plume a whole column left of where the frame has it
 * and cost it a third of its light: measured against the frame, 55.7 against
 * 75.5 at x=640, and 26.1 against 41.2 at x=800.
 */
const FOOTAGE_BOX =
  "absolute top-0 left-[-4.219%] h-[108.52%] w-[108.49%] max-w-none";

/**
 * The hero's moving backdrop: the frame's own clip, played straight.
 *
 * This used to be painted onto a canvas — the clip tiled across the banner two
 * or three copies over and cross-faded, so the whole picture could be slid left
 * and right to fake a travelling glow. That is where the glitching came from.
 * Compositing a video against shifted copies of itself leaves a band, about a
 * fifth of the banner wide, that is always two different moments of the footage
 * blended together; as the strip slid, that band travelled, and on anything but
 * the most diffuse frame it read as a seam or a ghost. The turnarounds of the
 * left-right sweep added a second tell — the picture easing to a stop and
 * reversing every few seconds.
 *
 * None of that buys anything the clip does not already have. It is a seamless
 * stock loop with its own drift in it, so played straight through a plain
 * `video` it moves on its own, loops without a jump, and is decoded and
 * composited by the browser on the GPU — no per-frame canvas work, no tiling,
 * no crossfade, nothing to glitch. The recolour, the edge masks and the light
 * shafts still sit over it in `Hero`; this layer is just the footage, in the
 * place and at the scale the frame draws it.
 *
 * It is paused while the banner is off screen. The hero is the first thing on
 * the page, so it spends most of a reading session behind the reader, and a
 * decoding video there is spent battery for nothing.
 */
export function BannerFootage({ playing }: { playing: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playing) return;

    const video = videoRef.current;
    if (!video) return;

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
      {/*
        The still under the footage. It is the frame the loop returns to, so it
        stands in seamlessly while the video is still arriving, and for anyone
        who has asked for reduced motion.
      */}
      <div
        className={clsx(FOOTAGE_BOX, "bg-cover bg-center")}
        style={{ backgroundImage: "url('/assets/hero-motion-poster.webp')" }}
      />

      {playing && (
        <video
          ref={videoRef}
          className={clsx(FOOTAGE_BOX, "object-cover")}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/assets/hero-motion-poster.webp"
          data-testid="hero-backdrop-video"
        >
          <source src="/assets/hero-motion.webm" type="video/webm" />
          <source src="/assets/hero-motion.mp4" type="video/mp4" />
        </video>
      )}
    </>
  );
}

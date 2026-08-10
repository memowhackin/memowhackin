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
          className={clsx(FOOTAGE_BOX, "object-cover")}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/assets/hero-motion-poster.webp"
          data-testid="hero-backdrop-video"
        >
          <source src="/assets/hero-banner.mp4" type="video/mp4" />
        </video>
      )}
    </>
  );
}

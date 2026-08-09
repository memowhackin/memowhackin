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

/** The box above, as fractions of the banner, for the canvas to work in. */
const TILE_WIDTH = 1.0849;
const TILE_HEIGHT = 1.0852;

/**
 * How much of a copy is spent fading into the one before it.
 *
 * This is what carries the join, and it is wide on purpose. The two sides of a
 * join are different pictures — the clip's last column against its first — and
 * a blend narrow enough to notice is just a soft-edged version of the line it
 * replaced. At 18% of a copy the crossing runs about 375px on a 1920 banner,
 * which on footage this diffuse is not a transition anyone can point at.
 */
const FEATHER = 0.18;

/** What is left of a copy once the fade is taken off it: the strip's period. */
const PERIOD = TILE_WIDTH * (1 - FEATHER);

/** The fade, as a fraction of the period rather than of a copy. */
const FEATHER_PERIODS = (FEATHER * TILE_WIDTH) / PERIOD;

/**
 * The shape of the fade, sampled from `6s⁵ - 15s⁴ + 10s³`.
 *
 * A straight ramp is not enough. Across the crossing the picture is
 * `a·B + (1-a)·A`, and where `a` starts and stops changing there is a step in
 * the *slope* of that — proportional to how far apart A and B are, which by the
 * whole premise of this file is not zero. A step in slope is a crease, and a
 * crease down a soft glow is the line all over again, just softer.
 *
 * This curve leaves and arrives at zero rate of change, so the crossing has no
 * beginning and no end to find. Canvas interpolates its stops linearly, so the
 * curve is sampled rather than described: eight steps put the worst remaining
 * kink at an eighth of the straight ramp's, well under what shows on footage
 * this diffuse.
 *
 * The stops are in `rgba()` rather than the space-separated form used
 * everywhere else here. `addColorStop` throws on a colour it cannot parse, and
 * the canvas parser is older than the CSS one in more than one shipping
 * browser — a backdrop that throws every frame is not a trade worth making for
 * consistent syntax.
 */
const FEATHER_RAMP: readonly (readonly [number, number])[] = [
  [0, 0],
  [0.125, 0.0161],
  [0.25, 0.1035],
  [0.375, 0.2752],
  [0.5, 0.5],
  [0.625, 0.7248],
  [0.75, 0.8965],
  [0.875, 0.9839],
  [1, 1],
];

/**
 * The glow does not run one way forever; it walks out and walks back — left to
 * right, then right to left, for as long as the page is open. This is the
 * seamless-loop trick the footage itself is built on ("play it, then play it
 * backwards"), lifted up to the strip so the *travel* loops the same way the
 * clip does.
 *
 * `SWEEP_PERIODS` is how far it walks each way, in periods; `SECONDS_PER_SWEEP`
 * is how long one one-way walk takes. A full there-and-back cycle is twice that.
 */
const SWEEP_PERIODS = 1;
const SECONDS_PER_SWEEP = 26;

/**
 * Where the strip stands when the page opens, in periods: the frame's own -81
 * on a 1920 banner, so the copy carrying the plume opens in the place and at
 * the scale the frame draws it, and the travel starts from there.
 *
 * The banner's left sixth is a crossing even at that offset — there is always
 * one somewhere, since a crossing runs a fifth of a period and the banner is
 * wider than a period. It falls where the backdrop is darkest and furthest from
 * the headline, which is the best any offset can do with it.
 */
const DRAWN_OFFSET = -0.04219 / PERIOD;

/**
 * The footage is diffuse — a plume of smoke, blurred and tinted — with no edge
 * in it that a backing store this wide could not already carry. Painting it any
 * larger spends fill rate (and, under the header's backdrop blur, re-composite
 * cost) on detail the source does not have. 1600 covers every common width at
 * the device ratio this caps to below, and softens nothing anyone can see.
 */
const MAX_BACKING_WIDTH = 1600;

/**
 * The device-pixel ratio the backing store is drawn at, capped low on purpose.
 * A 2× store doubles every fill the strip does each frame and doubles the area
 * the sticky header has to blur over it — for sharpness footage this soft has
 * no use for. 1.5 keeps it crisp enough and roughly halves that per-frame cost
 * on the high-DPI screens where the lag was worst.
 */
const MAX_DEVICE_RATIO = 1.5;

/**
 * A frame longer than this is a tab coming back or a stalled main thread, not
 * elapsed time. Advancing the strip by it would jump the plume across the
 * banner, which is the one thing this is here to avoid.
 */
const MAX_FRAME_SECONDS = 0.1;

/** Positive remainder. `%` keeps the sign of the dividend, which is no use here. */
function wrap(value: number, span: number): number {
  return ((value % span) + span) % span;
}

/*
 * `requestVideoFrameCallback` fires once per decoded video frame, which is how
 * the strip tells a frame it must rebuild the tile from apart from a frame it
 * only has to slide the tile on. It is widely shipped, but a browser without it
 * (older Safari) still has to work — so it is reached through a runtime check,
 * and where it is missing the loop falls back to rebuilding every frame.
 */
function hasVideoFrameCallback(video: HTMLVideoElement): boolean {
  return "requestVideoFrameCallback" in video;
}

/**
 * The hero's moving backdrop, walking left to right and back again for as long
 * as the page is open.
 *
 * The clip cannot do this by itself. It is a stock loop, and stock loops are
 * made seamless by playing the footage and then playing it backwards, so the
 * plume walks out to the middle and walks back — which is exactly the there-
 * and-back the strip's own travel now takes (see `SECONDS_PER_SWEEP`). Neither
 * can it be laid end to end and slid: its last column and its first column are
 * different pictures, and the join between them is a hard vertical edge that
 * then travels across the banner for the whole cycle.
 *
 * Mirroring every second copy does away with that edge — a copy and its
 * reflection meet on the column they share — but not with the join. Two
 * pictures that meet at the same value and opposite slopes make a crease, and a
 * crease down a soft glow reads as a line as surely as a step does.
 *
 * So the copies are crossed over instead. The strip is painted rather than laid
 * out: every frame the current video frame is drawn across a canvas two or
 * three times over, each copy fading in over the last fifth of the one before
 * on a curve that starts and ends flat, so no two copies ever meet at an edge —
 * they dissolve, and not even the ends of the dissolve are findable. There is
 * nowhere on the banner where one picture stops and the next starts.
 *
 * The cost of that is a crossing on screen at all times: about a fifth of the
 * banner is always two copies over each other. On footage this diffuse it reads
 * as haze, which the clip has plenty of already.
 *
 * Two more things fall out of painting it. There is one decoder and one video
 * frame, so the copies cannot drift out of sync with each other, and the
 * stutter that comes of handing the banner from one `video` element to another
 * is not possible. And the walk's phase is kept inside one there-and-back, so
 * there is no end of a cycle to restart from: no seam in time any more than in
 * space, and the turnarounds are eased so neither reads as a stop.
 *
 * The video stays in the tree beneath the canvas at the size and offset the
 * frame draws it. It is the canvas's source, and it is also what shows if the
 * canvas never paints — a browser without 2D context support gets the backdrop
 * as it was, pacing but perfectly presentable.
 */
export function BannerFootage({ playing }: { playing: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!playing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    /*
     * One copy of the footage, with its leading edge already faded out, built
     * once a frame and then stamped across the banner. Masking a gradient into
     * an image is a composite operation, and a composite operation applies to a
     * whole surface — so it needs a surface of its own.
     */
    const scratch = document.createElement("canvas");
    const scratchContext = scratch.getContext("2d");
    if (!scratchContext) return;

    /*
     * Where the strip stands, in periods, and how far along its there-and-back
     * walk it is. `phase` runs forward forever at a constant rate; `offset` is
     * read off it with a raised cosine, which is what makes the two turnarounds
     * ease in and out instead of snapping — the walk never stops and never
     * jerks. At phase 0 the strip sits exactly where the frame draws it, so the
     * motion begins from the still under the canvas rather than from a jump.
     */
    let phase = 0;
    let offset = DRAWN_OFFSET;
    let last = 0;
    let frame = 0;
    let running = false;

    /*
     * The tile the strip stamps is rebuilt from the video only when there is a
     * new video frame to rebuild it from — `frameDirty` is raised once per
     * decoded frame. Between frames the strip only slides the tile it has, which
     * is a handful of `drawImage`s and nothing that touches the decoder. The
     * fade gradient depends solely on the tile's width, so it is cached and
     * rebuilt only when a resize changes that width.
     */
    let frameDirty = true;
    let ramp: CanvasGradient | null = null;
    let rampWidth = -1;
    let videoFrameHandle = 0;
    const scheduler = hasVideoFrameCallback(video) ? video : null;

    /* The device pixel ratio the backing store was last sized for. */
    let ratio = 0;

    const currentRatio = () =>
      Math.min(window.devicePixelRatio, MAX_DEVICE_RATIO);

    const resize = () => {
      ratio = currentRatio();
      const width = Math.min(
        Math.round(canvas.clientWidth * ratio),
        MAX_BACKING_WIDTH,
      );
      const height = Math.round(
        canvas.clientHeight * (width / Math.max(canvas.clientWidth, 1)),
      );

      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
    };

    const paint = () => {
      const { width, height } = canvas;
      if (width === 0 || height === 0) return;
      if (video.readyState < 2 || video.videoWidth === 0) return;

      const tileWidth = width * TILE_WIDTH;
      const tileHeight = height * TILE_HEIGHT;
      const period = width * PERIOD;

      const scratchWidth = Math.ceil(tileWidth);
      const scratchHeight = Math.ceil(tileHeight);
      const sizeChanged =
        scratch.width !== scratchWidth || scratch.height !== scratchHeight;

      /*
       * The one piece of per-frame work that reads the video, gated to the
       * frames that actually change it. On a frame that is only sliding the
       * strip along, this whole block is skipped and the loop drops to the
       * stamping below — which is where the cost of a moving backdrop belongs.
       */
      if (frameDirty || sizeChanged) {
        if (sizeChanged) {
          scratch.width = scratchWidth;
          scratch.height = scratchHeight;
        }

        /*
         * `object-cover`, by hand: the larger of the two scales fills the box,
         * and what does not fit is centred and runs off the ends of the copy.
         */
        const scale = Math.max(
          tileWidth / video.videoWidth,
          tileHeight / video.videoHeight,
        );
        const drawWidth = video.videoWidth * scale;
        const drawHeight = video.videoHeight * scale;

        scratchContext.globalCompositeOperation = "source-over";
        scratchContext.clearRect(0, 0, scratch.width, scratch.height);
        scratchContext.drawImage(
          video,
          (tileWidth - drawWidth) / 2,
          (tileHeight - drawHeight) / 2,
          drawWidth,
          drawHeight,
        );

        /*
         * The fade. `destination-in` keeps what is already drawn only as far as
         * what is drawn now is opaque, so a ramp filled over the whole copy
         * takes its left edge to nothing and leaves the rest of it untouched.
         * The fill has to cover the copy entirely — anything it misses is
         * erased, not left alone. The ramp only depends on the copy's width, so
         * it is built once and kept until a resize changes that width.
         */
        if (!ramp || rampWidth !== tileWidth) {
          ramp = scratchContext.createLinearGradient(0, 0, tileWidth, 0);
          for (const [at, alpha] of FEATHER_RAMP) {
            ramp.addColorStop(
              at * FEATHER,
              `rgba(0, 0, 0, ${alpha.toString()})`,
            );
          }
          ramp.addColorStop(1, "rgba(0, 0, 0, 1)");
          rampWidth = tileWidth;
        }

        scratchContext.globalCompositeOperation = "destination-in";
        scratchContext.fillStyle = ramp;
        scratchContext.fillRect(0, 0, scratch.width, scratch.height);

        frameDirty = false;
      }

      /*
       * The copies with any part of themselves on the banner, painted left to
       * right so each one fades into the one before it.
       *
       * The first is the last one whose fade has finished by the left edge of
       * the banner — so the only faded edge anywhere is off the canvas, and
       * every copy on it can be the same stamp. Without that there would have
       * to be a first copy drawn solid to keep the left of the banner covered,
       * and its hard edge would be the thing to hide instead.
       */
      const firstTile = Math.floor(-offset - FEATHER_PERIODS);
      const lastTile = Math.floor(width / period - offset);

      context.clearRect(0, 0, width, height);

      for (let index = firstTile; index <= lastTile; index++) {
        context.drawImage(scratch, (offset + index) * period, 0);
      }
    };

    const step = (now: number) => {
      const elapsed = Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
      last = now;

      if (currentRatio() !== ratio) resize();

      /*
       * Where the browser cannot report decoded frames, there is no way to know
       * which paints carry a new one, so every paint rebuilds the tile — the
       * loop as it was before the gate. Where it can, `onVideoFrame` raises this
       * instead and the gate does its work.
       */
      if (!scheduler) frameDirty = true;

      /*
       * The strip holds its drawn position until there is a frame to paint with
       * it. The clock would otherwise run through the second or two the video
       * spends arriving, and the first painted frame would land wherever the
       * strip had walked to by then — a sideways jump out of the still, which
       * is the first thing anyone would see.
       */
      if (video.readyState >= 2) {
        // `phase` advances at π per one-way sweep, so a full there-and-back is
        // 2π, and it is wrapped there: the walk is periodic, so nothing is lost
        // by keeping the number small, and there is no cycle end to see. The
        // raised cosine turns that steady phase into a position that eases
        // through both turnarounds — moving fastest mid-sweep, softest at the
        // ends — for a glide from one side to the other and back with no seam.
        phase = wrap(
          phase + (Math.PI * elapsed) / SECONDS_PER_SWEEP,
          2 * Math.PI,
        );
        offset = DRAWN_OFFSET + SWEEP_PERIODS * (1 - Math.cos(phase)) * 0.5;
      }

      paint();
      frame = requestAnimationFrame(step);
    };

    /*
     * One decoded frame has arrived: the next paint has to rebuild the tile
     * from it. The callback re-arms itself for as long as the loop is running,
     * so there is exactly one outstanding request at a time.
     */
    const onVideoFrame = () => {
      frameDirty = true;
      videoFrameHandle = 0;
      if (running && scheduler) {
        videoFrameHandle = scheduler.requestVideoFrameCallback(onVideoFrame);
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      void video.play().catch(() => {
        // Refused autoplay is not an error worth surfacing: the still under the
        // canvas is the same picture, and it is already on screen.
      });
      if (scheduler) {
        videoFrameHandle = scheduler.requestVideoFrameCallback(onVideoFrame);
      }
      frame = requestAnimationFrame(step);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
      if (scheduler && videoFrameHandle !== 0) {
        scheduler.cancelVideoFrameCallback(videoFrameHandle);
        videoFrameHandle = 0;
      }
      video.pause();
    };

    resize();

    /*
     * Nothing is painted, and nothing is decoded, while the banner is off
     * screen. It is the first thing on the page, so it spends most of a reading
     * session behind the reader.
     */
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) start();
      else stop();
    });
    observer.observe(canvas);

    const resizes = new ResizeObserver(() => {
      resize();
      if (running) paint();
    });
    resizes.observe(canvas);

    return () => {
      stop();
      observer.disconnect();
      resizes.disconnect();
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
        <>
          {/*
            The frame does not lay the footage flush. It sits at 2083x1172 over
            a 1920x1080 box — the same 8.5% over on both axes — pulled 81 left
            and hung off the top edge, which is what puts the bright of the
            plume where the frame puts it rather than a hand's width to the
            left.

            This copy is the canvas's source, and it is drawn at exactly that
            box so that it is also the fallback: where the canvas cannot paint,
            what is left is the backdrop as it was.
          */}
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

          <canvas
            ref={canvasRef}
            className="absolute inset-0 size-full"
            data-testid="hero-backdrop-canvas"
          />
        </>
      )}
    </>
  );
}

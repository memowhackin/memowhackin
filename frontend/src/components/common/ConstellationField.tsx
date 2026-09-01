import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { chipClass, chipMarkerClass } from "@/components/common/chipClass";
import {
  buildConstellation,
  linkConstellation,
  stepConstellation,
  type ConstellationLink,
  type ConstellationModel,
  type ConstellationNode,
} from "@/components/common/constellationModel";
import { useMediaQuery } from "@/components/common/useMediaQuery";

/**
 * The live constellation: the frame's network artwork drawn rather than
 * photographed, with the brand mark glowing at its core and capability tags
 * floating over the dense body of the graph.
 *
 * Three layers, chosen by what each is cheapest as:
 *
 *   - The nodes and lines are a `<canvas>`. Six hundred squares and a thousand
 *     hairlines redraw in a millisecond or so, and a canvas is a single
 *     compositor surface however much is on it. As DOM they would be over a
 *     thousand elements each carrying its own transform.
 *   - The core and the tags are DOM. They carry text, a border and a shadow,
 *     which is what DOM is for, and their motion is `transform` only — the
 *     compositor moves them without the page laying out.
 *   - The still artwork stays underneath as a poster. The prerendered page and
 *     a visitor without JavaScript see it as before, and it fades out under the
 *     first drawn frame rather than being replaced by a blank square while the
 *     script arrives.
 *
 * The field moves on its own. Every node has a velocity and is stepped each
 * frame (see `stepConstellation`), the lines are recomputed each frame from
 * wherever the nodes are, and a few signals travel the lines of the dense body.
 * The tags are tied to the node nearest each of them by a hairline, which is
 * what makes them read as labels on the graph rather than chips laid over it.
 *
 * The pointer is optional. Where there is a fine one it moves the layers by
 * depth — far nodes barely, near nodes more, the tags most — which is what
 * makes the field read as having volume; two per cent of the box at the very
 * front, so it is felt rather than seen. Nothing waits for it.
 *
 * Everything but the still picture is off for a reader who has asked for
 * reduced motion. The loop also runs only while the box is on screen and the
 * tab is visible: a section three screens down, or a tab in the background,
 * has no business spending frames.
 */

export interface ConstellationLabel {
  key: string;
  text: string;
  /**
   * Where the chip's centre sits, as Tailwind position utilities. Classes
   * rather than numbers because the placement is responsive — a chip that sits
   * on the right flank at `lg` may need the left one on a phone — and Tailwind
   * can only emit rules it can see in the source.
   */
  position: string;
  testId?: string;
}

interface ConstellationFieldProps {
  labels: readonly ConstellationLabel[];
  /** What the disc at the core carries — the brand mark. */
  core: ReactNode;
  /** The still artwork shown until the first frame is drawn, and instead of it where nothing can draw. */
  poster: string;
  className?: string;
}

/** Lavender and indigo-bright from the palette, as channels for `rgba()`. */
const NODE_RGB = "173, 157, 238";
const LINE_RGB = "96, 70, 202";

/**
 * The lines, stroked in three weights by how close their ends are. Grouping is
 * what makes them cheap: each tier is one path and one stroke, rather than a
 * style change per line. The faintest tier is also where the long lines out to
 * the stragglers go.
 */
const LINE_TIERS = [
  { closeness: 0.6, alpha: 0.42 },
  { closeness: 0.3, alpha: 0.3 },
  { closeness: 0, alpha: 0.18 },
] as const;

/** How far the nearest layer shifts under the pointer, as a fraction of the box. */
const PARALLAX = 0.02;
/** Depth of the DOM layers, on the same 0 far–1 near scale as the nodes. */
const CORE_DEPTH = 0.45;
const LABEL_DEPTH = 1;

/**
 * The longest step the physics is allowed. Frames stop arriving while the tab
 * is hidden or the box is off screen, and the first one back must not carry
 * the whole absence as one leap.
 */
const MAX_STEP = 0.05;

/**
 * The tags each float on their own cycle so the three never bob in step, which
 * is what would make them read as one animated object.
 */
const FLOAT_CYCLES = ["10.5s", "13s", "11.75s"] as const;

/**
 * Radii of 50% reach exactly the edges of the box, so the field has faded out
 * completely by the time it gets there and leaves no rectangle behind. The
 * solid core runs to 30%: the graph is the only thing carrying its half of the
 * section, and starting the falloff a sixth of the way out left it a smudge
 * with three bright tags on top.
 */
const MASK = "radial-gradient(50% 50% at 50% 50%, #000 30%, transparent 100%)";

interface Anchor {
  /** The chip's centre, as fractions of the box. */
  x: number;
  y: number;
  node: ConstellationNode;
}

interface Pulse {
  from: ConstellationNode;
  to: ConstellationNode;
  start: number;
  duration: number;
}

interface ParallaxLayer {
  element: HTMLElement;
  depth: number;
}

/**
 * How many nodes a box of this width carries. Enough to read as a dense
 * network at every size, capped where more would only be more draw calls.
 */
function nodeCountFor(width: number): number {
  return Math.round(Math.min(Math.max(width, 260), 760));
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}

export function ConstellationField({
  labels,
  core,
  poster,
  className,
}: ConstellationFieldProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calm = useMediaQuery("(prefers-reduced-motion: reduce)");
  const finePointer = useMediaQuery("(pointer: fine)");
  const animates = !calm;
  const parallax = animates && finePointer;

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;

    // No 2D context — a test host, or a browser with canvas disabled — and the
    // poster simply stays. It is the same picture, standing still.
    const context = canvas.getContext("2d");
    if (!context) return;

    let model: ConstellationModel | null = null;
    let builtWidth = 0;
    let width = 0;
    let height = 0;
    let anchors: Anchor[] = [];
    let layers: ParallaxLayer[] = [];
    const links: ConstellationLink[] = [];
    const tiers: ConstellationLink[][] = LINE_TIERS.map(() => []);
    const pulses: Pulse[] = [];

    /* Where the pointer is, in -1..1 of the box, and where the layers have eased to. */
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };

    let frame = 0;
    /* The last frame's timestamp, or 0 when the loop has just (re)started. */
    let lastTime = 0;
    let onScreen = false;

    const measure = () => {
      const rect = box.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      /*
       * Capped at 2. A 3x phone screen would draw the field at nine times the
       * pixels of a 1x one for hairlines nobody can tell apart from 2x, and it
       * is the phone that has the least to spare.
       */
      const ratio =
        window.devicePixelRatio > 0 ? Math.min(window.devicePixelRatio, 2) : 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      /*
       * The model is built for the width it is first drawn at and kept through
       * ordinary resizes — its positions are fractions, so it just rescales.
       * Only a change large enough to want a different node count, a phone
       * turning over, rebuilds it.
       */
      if (model === null || Math.abs(width - builtWidth) / builtWidth > 0.25) {
        model = buildConstellation({ count: nodeCountFor(width) });
        builtWidth = width;
        pulses.length = 0;
      }

      layers = Array.from(
        box.querySelectorAll<HTMLElement>("[data-depth]"),
        (element) => ({
          element,
          depth: Number(element.dataset.depth),
        }),
      );

      /*
       * Each tag is tied to the nearest node beyond its own footprint — a node
       * underneath the chip would give a tether of zero visible length. Tied
       * by home position, so the tether keeps its node as that node wanders.
       * The chips are measured rather than positioned from numbers because
       * their placement is responsive (see `ConstellationLabel.position`).
       */
      const nodes = model.nodes;
      anchors = [];
      for (const element of box.querySelectorAll<HTMLElement>(
        "[data-tether]",
      )) {
        const chip = element.getBoundingClientRect();
        const x = (chip.left + chip.width / 2 - rect.left) / width;
        const y = (chip.top + chip.height / 2 - rect.top) / height;
        const clearance =
          Math.hypot(chip.width / width, chip.height / height) * 0.6;

        let best: Anchor | null = null;
        let bestDistance = Infinity;
        for (const node of nodes) {
          const distance = Math.hypot(node.x - x, node.y - y);
          if (distance <= clearance || distance >= bestDistance) continue;
          bestDistance = distance;
          best = { x, y, node };
        }
        if (best !== null) anchors.push(best);
      }
    };

    /*
     * A signal sets off along one of this frame's lines in the dense body. A
     * pulse that ran out along a straggler's long line would cross empty
     * ground and draw the eye to nothing.
     */
    const spawn = (now: number): Pulse | null => {
      const body = links.filter((link) => link.closeness > 0.3);
      const link = body[Math.floor(Math.random() * body.length)];
      if (link === undefined) return null;
      const reverse = Math.random() < 0.5;
      return {
        from: reverse ? link.to : link.from,
        to: reverse ? link.from : link.to,
        // A rest before each run, so the signals arrive singly rather than as
        // a shoal that set off together.
        start: now + Math.random() * 1.6,
        duration: 1.6 + Math.random() * 1.4,
      };
    };

    const draw = (time: number) => {
      if (model === null || width === 0) return;
      const now = time / 1000;
      const nodes = model.nodes;

      const dt =
        lastTime === 0 ? 0 : Math.min((time - lastTime) / 1000, MAX_STEP);
      lastTime = time;
      if (animates && dt > 0) stepConstellation(nodes, dt);
      linkConstellation(nodes, links);

      if (parallax) {
        eased.x += (pointer.x - eased.x) * 0.05;
        eased.y += (pointer.y - eased.y) * 0.05;
      }

      const shiftX = eased.x * PARALLAX * width;
      const shiftY = eased.y * PARALLAX * height;

      for (const node of nodes) {
        node.px = node.cx * width + shiftX * node.depth;
        node.py = node.cy * height + shiftY * node.depth;
      }

      for (const layer of layers) {
        layer.element.style.transform = `translate3d(${(shiftX * layer.depth).toFixed(2)}px, ${(shiftY * layer.depth).toFixed(2)}px, 0)`;
      }

      context.clearRect(0, 0, width, height);

      /* The lines: one path per tier, so three strokes draw them all. */
      for (const tier of tiers) tier.length = 0;
      for (const link of links) {
        const index = LINE_TIERS.findIndex(
          (tier) => link.closeness >= tier.closeness,
        );
        tiers[index === -1 ? LINE_TIERS.length - 1 : index]?.push(link);
      }
      context.lineWidth = Math.max(0.8, width / 1100);
      LINE_TIERS.forEach((tier, index) => {
        const members = tiers[index];
        if (members === undefined || members.length === 0) return;
        context.strokeStyle = `rgba(${LINE_RGB}, ${tier.alpha.toString()})`;
        context.beginPath();
        for (const link of members) {
          context.moveTo(link.from.px, link.from.py);
          context.lineTo(link.to.px, link.to.py);
        }
        context.stroke();
      });

      /* The signals travelling the body. */
      if (animates) {
        const wanted = Math.round(nodes.length / 80);
        while (pulses.length < wanted) {
          const pulse = spawn(now);
          if (pulse === null) break;
          pulses.push(pulse);
        }

        context.lineWidth = Math.max(1, width / 900);
        context.lineCap = "round";
        pulses.forEach((pulse, index) => {
          const progress = (now - pulse.start) / pulse.duration;
          if (progress < 0) return;
          if (progress >= 1) {
            const next = spawn(now);
            if (next !== null) pulses[index] = next;
            return;
          }

          const { from, to } = pulse;
          const head = progress;
          const tail = Math.max(0, progress - 0.22);
          const headX = from.px + (to.px - from.px) * head;
          const headY = from.py + (to.py - from.py) * head;
          const tailX = from.px + (to.px - from.px) * tail;
          const tailY = from.py + (to.py - from.py) * tail;

          // Brightest mid-run, so a signal fades up out of the line and back
          // into it rather than switching on at one node and off at the next.
          const strength = 0.7 * Math.sin(Math.PI * progress);
          const gradient = context.createLinearGradient(
            tailX,
            tailY,
            headX,
            headY,
          );
          gradient.addColorStop(0, `rgba(${NODE_RGB}, 0)`);
          gradient.addColorStop(1, `rgba(${NODE_RGB}, ${strength.toString()})`);
          context.strokeStyle = gradient;
          context.beginPath();
          context.moveTo(tailX, tailY);
          context.lineTo(headX, headY);
          context.stroke();
        });
        context.lineCap = "butt";
      }

      /* The tethers, from each tag's centre to its node. */
      context.lineWidth = Math.max(0.8, width / 1100);
      context.strokeStyle = `rgba(${NODE_RGB}, 0.32)`;
      context.beginPath();
      for (const anchor of anchors) {
        context.moveTo(
          anchor.x * width + shiftX * LABEL_DEPTH,
          anchor.y * height + shiftY * LABEL_DEPTH,
        );
        context.lineTo(anchor.node.px, anchor.node.py);
      }
      context.stroke();

      /* The nodes: squares, as the frame draws them. */
      const base = Math.max(2, width * 0.0048);
      context.fillStyle = `rgb(${NODE_RGB})`;
      for (const node of nodes) {
        const alpha =
          node.alpha +
          node.twinkle * Math.sin(now * node.twinkleSpeed + node.twinklePhase);
        const size = base * node.size * (0.85 + 0.3 * node.depth);
        context.globalAlpha = alpha;
        context.fillRect(node.px - size / 2, node.py - size / 2, size, size);
      }

      // The tethered nodes are the ones a tag names, so they read as the
      // brightest points in the field.
      context.globalAlpha = 1;
      for (const anchor of anchors) {
        const size = base * 1.6;
        context.fillRect(
          anchor.node.px - size / 2,
          anchor.node.py - size / 2,
          size,
          size,
        );
      }

      box.dataset.ready = "true";
    };

    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!animates || frame !== 0) return;
      if (!onScreen || document.hidden) return;
      lastTime = 0;
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    measure();
    draw(performance.now());

    const onResize = () => {
      measure();
      draw(performance.now());
    };
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(onResize);
    resizeObserver?.observe(box);

    /*
     * A margin either side, so the loop is already running when the box
     * scrolls into view rather than starting a frame after. Without an
     * observer to ask, the box is taken to be on screen.
     */
    const intersection =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              onScreen = entries.some((entry) => entry.isIntersecting);
              if (onScreen) start();
              else stop();
            },
            { rootMargin: "10% 0px" },
          );
    if (intersection === null) {
      onScreen = true;
      start();
    } else {
      intersection.observe(box);
    }

    // A hidden tab gets no frames from the browser anyway; stopping outright
    // as well means the physics resumes from a clean step rather than from a
    // stale timestamp when the tab comes back.
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onPointerMove = (event: PointerEvent) => {
      const rect = box.getBoundingClientRect();
      pointer.x = clamp(
        (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2),
        -1,
        1,
      );
      pointer.y = clamp(
        (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2),
        -1,
        1,
      );
    };
    // On the window, not the box: the box bleeds off the left of the page and
    // the copy sits beside it, so the pointer is over the section far more
    // often than it is over the graph.
    if (parallax) window.addEventListener("pointermove", onPointerMove);

    return () => {
      stop();
      resizeObserver?.disconnect();
      intersection?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [animates, parallax]);

  return (
    <div
      ref={boxRef}
      data-ready="false"
      className={clsx("group relative aspect-square", className)}
    >
      <img
        src={poster}
        alt=""
        width={1552}
        height={2172}
        loading="lazy"
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover mix-blend-screen transition-opacity duration-700 group-data-[ready=true]:opacity-0"
        style={{ maskImage: MASK }}
      />

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 group-data-[ready=true]:opacity-100"
        style={{ maskImage: MASK }}
      />

      {/*
        The brand mark at the centre of the graph — node 83:41738, which the
        frame calls a "Btn": a 150 disc in `ink-deep` behind a 6px edge in
        `indigo-bright` at 74%, carrying a 25px blur at 18px of spread in the
        same colour at 70%. That glow is what seats the mark in the
        constellation; without it the disc reads as a sticker laid on top.

        The glow breathes. The shadow itself stays put — animating a blur
        repaints every frame — and a wider, softer wash behind the disc does
        the moving, on `opacity` and `scale` only. The glyph is 40.2% of the
        disc, as drawn, and the edge steps down on narrow viewports where 6px
        on a 40px disc would be a third of it.
      */}
      <span
        className="absolute top-[47.9%] left-[52.7%] aspect-square w-[14%] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <span
          data-depth={CORE_DEPTH}
          className="relative block size-full will-change-transform"
        >
          <span
            className="motion-safe:animate-core-pulse pointer-events-none absolute -inset-[70%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(96, 70, 202, 0.42) 0%, rgba(96, 70, 202, 0.14) 38%, transparent 70%)",
            }}
          />
          <span className="bg-ink-deep relative flex size-full items-center justify-center rounded-full border-[0.1875rem] border-[#6046cabd] shadow-[0_0_1.5625rem_1.125rem_#6046cab3] sm:border-[0.25rem] lg:border-[0.375rem]">
            {core}
          </span>
        </span>
      </span>

      {labels.map((label, index) => (
        <span
          key={label.key}
          data-tether=""
          /*
            The chip is three nested spans because three things move it and
            they must not share an element: the position utilities place it,
            the parallax layer is written by the loop above, and the float is
            a CSS animation — two transforms on one element and one of them
            wins outright.
          */
          className={clsx(
            "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap",
            label.position,
          )}
        >
          <span
            data-depth={LABEL_DEPTH}
            className="block will-change-transform"
          >
            <span
              data-testid={label.testId}
              className={chipClass(
                "motion-safe:animate-tag-float inline-flex whitespace-nowrap",
              )}
              style={{
                animationDuration: FLOAT_CYCLES[index % FLOAT_CYCLES.length],
                animationDelay: `-${(index * 3.7).toString()}s`,
              }}
            >
              <span className={chipMarkerClass} aria-hidden="true" />
              {label.text}
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

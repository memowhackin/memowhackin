import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useTranslation } from "react-i18next";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  Captions,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  Quote,
  Trash2,
} from "lucide-react";
import {
  mediaUrl,
  toDisplayHtml,
  toStorageHtml,
  uploadImage,
} from "@/config/cms";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

interface ToolButton {
  key: string;
  icon: typeof Bold;
  run: (exec: (command: string, value?: string) => void) => void;
}

const TOOLS: readonly ToolButton[] = [
  { key: "h2", icon: Heading2, run: (e) => e("formatBlock", "h2") },
  { key: "h3", icon: Heading3, run: (e) => e("formatBlock", "h3") },
  { key: "bold", icon: Bold, run: (e) => e("bold") },
  { key: "italic", icon: Italic, run: (e) => e("italic") },
  { key: "list", icon: List, run: (e) => e("insertUnorderedList") },
  { key: "quote", icon: Quote, run: (e) => e("formatBlock", "blockquote") },
];

type Align = "left" | "center" | "right";

const ALIGNMENTS: readonly { key: Align; icon: typeof AlignLeft }[] = [
  { key: "left", icon: AlignLeft },
  { key: "center", icon: AlignCenter },
  { key: "right", icon: AlignRight },
];

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Where a drag would land, drawn as a line between blocks. */
interface DropLine {
  left: number;
  top: number;
  width: number;
}

/*
 * Size and alignment are written as data attributes, never as inline styles.
 *
 * The server strips `style` from post bodies when they are saved, so an image
 * sized or aligned through `style` looked right in the editor and then reverted
 * the moment the post was stored — silently, with nothing to indicate the
 * arrangement had been thrown away. The CSS for these attributes lives in
 * `@utility blog-content`, which both the editor and the article page use, so
 * the two cannot drift apart again.
 *
 * The one exception is the live preview while the resize handle is being
 * dragged: that uses `style.width` for smooth feedback, and the style is
 * removed on release before anything is emitted.
 */
const WIDTH_STEPS = [25, 50, 75, 100] as const;

const MIN_WIDTH_PERCENT = 15;

/** Snap to the nearest step: free percentages leave a column of images ragged. */
function nearestWidth(percent: number): number {
  return WIDTH_STEPS.reduce((best, step) =>
    Math.abs(step - percent) < Math.abs(best - percent) ? step : best,
  );
}

function applyAlign(image: HTMLImageElement, align: Align): void {
  image.dataset.align = align;
}

function applyWidth(image: HTMLImageElement, percent: number): void {
  image.dataset.displayWidth = String(nearestWidth(percent));
}

function applyAlt(image: HTMLImageElement, alt: string): void {
  image.alt = alt;
}

function makeImage(src: string): HTMLImageElement {
  const image = document.createElement("img");
  image.src = src;
  image.alt = "";
  image.className = "blog-image";
  image.draggable = true;
  applyWidth(image, 100);
  applyAlign(image, "center");
  return image;
}

/*
 * Where between the editor's top-level blocks a point lands: which block, and
 * whether above or below it. One resolver shared by the drop indicator and the
 * drop itself, so the line the author sees is exactly where the image goes.
 */
interface DropSpot {
  node: Node | null;
  /** true = below the node, false/null = above it; null node = at the end. */
  after: boolean | null;
}

function resolveDropTarget(
  editor: HTMLElement,
  range: Range | null,
  y?: number,
): DropSpot {
  if (!range) return { node: null, after: null };

  let ref: Node = range.startContainer;
  while (ref.parentNode && ref.parentNode !== editor) ref = ref.parentNode;
  if (ref.parentNode !== editor) return { node: null, after: null };

  if (ref instanceof Element && y !== undefined) {
    const rect = ref.getBoundingClientRect();
    return { node: ref, after: y > rect.top + rect.height / 2 };
  }
  return { node: ref, after: null };
}

/**
 * Drop a node in as a block between the editor's top-level children rather than
 * inside a line of text, so an image never lands mid-sentence.
 */
function placeBlock(
  editor: HTMLElement,
  node: Node,
  range: Range | null,
  y?: number,
): void {
  const spot = resolveDropTarget(editor, range, y);

  if (spot.node === null) {
    editor.append(node);
  } else if (spot.after === true) {
    editor.insertBefore(node, spot.node.nextSibling);
  } else {
    editor.insertBefore(node, spot.node);
  }

  // A trailing image would leave the caret nowhere to go; give it a line.
  if (node.nextSibling === null && node.parentNode === editor) {
    const paragraph = document.createElement("p");
    paragraph.innerHTML = "<br>";
    editor.append(paragraph);
  }
}

/*
 * Everything needed to reconcile the document after a drag, captured when the
 * drag starts.
 *
 * Browsers implement drag-and-drop inside contenteditable themselves, and the
 * split of work between the drop event's default action and dragend's cleanup
 * differs by engine and by how the drag began. Three defence layers keep the
 * document sane whatever the engine does:
 *
 *  1. The drop event's default is prevented and the move performed here.
 *  2. Chromium expresses its own edits as cancelable `beforeinput` events with
 *     inputType `deleteByDrag` / `insertFromDrop`; while one of our drags is in
 *     flight those are cancelled, which stops the engine's copy at the layer
 *     it is actually created.
 *  3. After dragend — deferred past the engine's own cleanup — the document is
 *     reconciled against this snapshot: engine-inserted copies are removed and
 *     the dragged image is restored if the engine deleted it.
 *
 * The invariant: a drag repositions exactly one image.
 */
interface DragSession {
  image: HTMLImageElement;
  /** Same-src images that legitimately existed before the drag. */
  twinsBefore: readonly HTMLImageElement[];
  /** Where the image came from, to restore a drag that went nowhere. */
  originParent: Node | null;
  originNext: Node | null;
  /** Where our drop handler placed it, once it has. */
  placedParent: Node | null;
  placedNext: Node | null;
}

/**
 * The image a drag is about, however the browser aimed the event.
 *
 * A drag started directly on an image fires dragstart at the <img>. But the
 * common flow is click first — which selects the image — then drag, and a
 * selection drag fires dragstart at the containing block with the image only
 * in the selection. Engines differ in what that selection looks like, so the
 * caller also passes the element the last pointerdown landed on: a drag always
 * begins where the pointer went down, which makes it the most reliable signal
 * of all.
 */
function draggedImage(
  target: EventTarget | null,
  pressed: HTMLImageElement | null,
): HTMLImageElement | null {
  if (target instanceof HTMLImageElement) return target;

  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (range.endOffset - range.startOffset === 1) {
      const node = range.startContainer.childNodes[range.startOffset];
      if (node instanceof HTMLImageElement) return node;
    }
  }

  return pressed?.isConnected === true ? pressed : null;
}

/**
 * The caret position under a point, across engines. Chromium and WebKit have
 * `caretRangeFromPoint`; Firefox has `caretPositionFromPoint`. Both are typed as
 * always-present, so `document` is read through a structural type that makes
 * them optional and lets the runtime pick whichever exists.
 */
function caretRangeAt(x: number, y: number): Range | null {
  const doc: {
    caretRangeFromPoint?: (px: number, py: number) => Range | null;
    caretPositionFromPoint?: (px: number, py: number) => CaretPosition | null;
    createRange: () => Range;
  } = document;

  if (doc.caretRangeFromPoint) {
    return doc.caretRangeFromPoint(x, y);
  }
  const position = doc.caretPositionFromPoint?.(x, y) ?? null;
  if (position === null) return null;
  const range = doc.createRange();
  range.setStart(position.offsetNode, position.offset);
  range.collapse(true);
  return range;
}

/**
 * A small block editor for writing posts. Text formatting runs through the
 * toolbar; images are dropped, pasted or picked in, then positioned by hand —
 * dragged to any point in the article with a line previewing where they will
 * land, aligned left/centre/right, and resized by the corner handle. The body
 * is plain HTML in and out, so what is stored is what the post page renders.
 *
 * Images are uploaded to the CMS as they are added, and the body references
 * them by path. The server re-encodes every upload, so what is stored is never
 * the bytes the browser sent.
 */
export function RichEditor({ value, onChange }: RichEditorProps) {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<DragSession | null>(null);
  const pressedImageRef = useRef<HTMLImageElement | null>(null);
  const dropLineFrame = useRef(0);
  const [selected, setSelected] = useState<HTMLImageElement | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [dropLine, setDropLine] = useState<DropLine | null>(null);
  const [resizePercent, setResizePercent] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState(false);

  const attachEditor = useCallback(
    (node: HTMLDivElement | null) => {
      editorRef.current = node;
      if (node && !seeded.current) {
        // Display form in, storage form out: prepends the API host when the
        // admin is served cross-origin, and upgrades legacy /media/blog/
        // paths so the next save stores the canonical form.
        node.innerHTML = toDisplayHtml(value);
        seeded.current = true;
      }
    },
    [value],
  );

  const emit = useCallback(() => {
    if (editorRef.current) onChange(toStorageHtml(editorRef.current.innerHTML));
  }, [onChange]);

  const exec = useCallback(
    (command: string, commandValue?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, commandValue);
      emit();
    },
    [emit],
  );

  const addLink = useCallback(() => {
    const url = window.prompt(t("admin.editor.linkPrompt"));
    if (url) exec("createLink", url);
  }, [exec, t]);

  const positionControls = useCallback((image: HTMLImageElement | null) => {
    const editor = editorRef.current;
    if (!image || !editor || !image.isConnected) {
      setBox(null);
      return;
    }
    const editorBox = editor.getBoundingClientRect();
    const rect = image.getBoundingClientRect();
    setBox({
      left: rect.left - editorBox.left + editor.scrollLeft,
      top: rect.top - editorBox.top + editor.scrollTop,
      right: rect.right - editorBox.left + editor.scrollLeft,
      bottom: rect.bottom - editorBox.top + editor.scrollTop,
    });
  }, []);

  const selectImage = useCallback(
    (image: HTMLImageElement | null) => {
      setSelected(image);
      positionControls(image);
      if (image && !image.complete) {
        image.addEventListener("load", () => positionControls(image), {
          once: true,
        });
      }
    },
    [positionControls],
  );

  // The overlay is positioned in pixels, so a viewport change stales it.
  useEffect(() => {
    const onResize = () => positionControls(selected);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [selected, positionControls]);

  /*
   * The line showing where a dragged image will land. Throttled to a frame:
   * dragover fires far faster than paint.
   */
  const showDropLine = useCallback((clientX: number, clientY: number) => {
    if (dropLineFrame.current !== 0) return;
    dropLineFrame.current = requestAnimationFrame(() => {
      dropLineFrame.current = 0;
      const editor = editorRef.current;
      if (!editor) return;

      const spot = resolveDropTarget(
        editor,
        caretRangeAt(clientX, clientY),
        clientY,
      );
      const anchor =
        spot.node instanceof Element ? spot.node : editor.lastElementChild;
      if (!anchor) {
        setDropLine(null);
        return;
      }

      const editorBox = editor.getBoundingClientRect();
      const rect = anchor.getBoundingClientRect();
      const below = spot.node instanceof Element ? spot.after === true : true;
      setDropLine({
        left: rect.left - editorBox.left + editor.scrollLeft,
        top:
          (below ? rect.bottom : rect.top) - editorBox.top + editor.scrollTop,
        width: rect.width,
      });
    });
  }, []);

  const clearDropLine = useCallback(() => {
    if (dropLineFrame.current !== 0) {
      cancelAnimationFrame(dropLineFrame.current);
      dropLineFrame.current = 0;
    }
    setDropLine(null);
  }, []);

  /*
   * Images are uploaded to the CMS and referenced by path, never inlined as a
   * base64 data URL. The server decodes and re-encodes them, which is what
   * strips EXIF and rejects a file that is only pretending to be an image —
   * and it keeps post bodies small instead of carrying megabytes of base64.
   */
  const insertImageFile = useCallback(
    (file: File, range: Range | null, y?: number) => {
      const editor = editorRef.current;
      if (!editor) return;

      const target = range ?? currentRange(editor);

      uploadImage(file)
        .then((uploaded) => {
          const current = editorRef.current;
          if (!current) return;

          const image = makeImage(mediaUrl(uploaded.path));
          image.width = uploaded.width;
          image.height = uploaded.height;
          placeBlock(current, image, target, y);
          emit();
          selectImage(image);
        })
        .catch(() => {
          setUploadError(true);
        });
    },
    [emit, selectImage],
  );

  /*
   * Resizing: smooth while the handle is held — a live inline width, removed
   * again on release — then snapped to the nearest step and written as the
   * data attribute that survives the sanitizer. The chip next to the handle
   * shows the step the image will snap to, so release is never a surprise.
   */
  const startResize = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const image = selected;
      const editor = editorRef.current;
      if (!image || !editor) return;

      event.preventDefault();
      const handle = event.currentTarget;
      try {
        handle.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic pointer events have no capturable id; the handlers below
        // still receive the pointer while it stays over the handle.
      }

      const target: HTMLImageElement = image;
      const startX = event.clientX;
      const startWidth = target.getBoundingClientRect().width;
      const columnWidth = editor.clientWidth;
      let percent = columnWidth > 0 ? (startWidth / columnWidth) * 100 : 100;

      function onMove(move: PointerEvent) {
        const next = startWidth + (move.clientX - startX);
        percent = Math.min(
          100,
          Math.max(
            MIN_WIDTH_PERCENT,
            columnWidth > 0 ? (next / columnWidth) * 100 : 100,
          ),
        );
        target.style.width = `${percent.toFixed(1)}%`;
        setResizePercent(nearestWidth(percent));
        positionControls(target);
      }

      function onUp() {
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
        handle.removeEventListener("lostpointercapture", onUp);
        // The preview style must never reach the stored body.
        target.style.removeProperty("width");
        if (target.getAttribute("style") === "") {
          target.removeAttribute("style");
        }
        applyWidth(target, percent);
        setResizePercent(null);
        positionControls(target);
        emit();
      }

      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
      handle.addEventListener("lostpointercapture", onUp);
    },
    [selected, emit, positionControls],
  );

  /*
   * Alt text, asked for in the author's words. An image without it is invisible
   * to screen readers and worthless to image search; the sanitizer keeps the
   * attribute, so what is written here reaches the published article.
   */
  const editAlt = useCallback(() => {
    const image = selected;
    if (!image) return;
    const alt = window.prompt(t("admin.editor.altPrompt"), image.alt);
    if (alt === null) return;
    applyAlt(image, alt.trim());
    emit();
  }, [selected, emit, t]);

  const setAlign = useCallback(
    (align: Align) => {
      if (!selected) return;
      applyAlign(selected, align);
      positionControls(selected);
      emit();
    },
    [selected, emit, positionControls],
  );

  /*
   * Removing an image had no affordance at all: it is selected through this
   * component's own state rather than the document selection, so the caret is
   * usually somewhere else entirely and Delete went to the text instead. There
   * is now a button, and the keys anyone would try first are handled too.
   */
  const removeSelected = useCallback(() => {
    const image = selected;
    if (!image) return;

    // Take the empty paragraph that follows a trailing image with it, rather
    // than leaving a blank line behind at the foot of the post.
    const sibling = image.nextElementSibling;
    if (sibling?.tagName === "P" && sibling.textContent?.trim() === "") {
      sibling.remove();
    }

    image.remove();
    selectImage(null);
    emit();
  }, [selected, emit, selectImage]);

  const onEditorKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (selected === null) return;
      if (event.key !== "Delete" && event.key !== "Backspace") return;

      // The image is the selection, so these keys belong to it, not the caret.
      event.preventDefault();
      removeSelected();
    },
    [selected, removeSelected],
  );

  /*
   * Layer 2 of the drag defence (see DragSession): Chromium performs its own
   * half of a drag as cancelable beforeinput events. While one of our drags is
   * in flight they are cancelled — the drop handler has already done the move.
   *
   * Attached natively rather than through React's onBeforeInput, which is a
   * composition-era polyfill that neither fires for these nor carries
   * inputType.
   */
  useEffect(() => {
    const node = editorRef.current;
    if (!node) return;

    const onNativeBeforeInput = (event: Event) => {
      if (dragRef.current === null) return;
      if (!(event instanceof InputEvent)) return;
      if (
        event.inputType === "insertFromDrop" ||
        event.inputType === "deleteByDrag"
      ) {
        event.preventDefault();
      }
    };

    node.addEventListener("beforeinput", onNativeBeforeInput);
    return () => node.removeEventListener("beforeinput", onNativeBeforeInput);
  }, []);

  const onDragEnd = useCallback(() => {
    clearDropLine();
    const session = dragRef.current;
    dragRef.current = null;
    if (!session) return;

    /*
     * Layer 3: reconciliation, deferred past the engine's own dragend cleanup
     * — which runs after this handler and is not cancelable — so whatever it
     * did is visible and reversible here.
     */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const editor = editorRef.current;
        if (!editor) return;

        let changed = false;

        // An engine-inserted copy is a same-src image that is neither the
        // dragged node nor one of its legitimate pre-drag twins.
        for (const candidate of editor.querySelectorAll("img")) {
          if (
            candidate !== session.image &&
            candidate.getAttribute("src") ===
              session.image.getAttribute("src") &&
            !session.twinsBefore.includes(candidate)
          ) {
            candidate.remove();
            changed = true;
          }
        }

        // The engine deleted the dragged image after our drop moved it — or
        // the drag never dropped anywhere and took the image with it.
        if (!session.image.isConnected) {
          const parent = session.placedParent ?? session.originParent;
          const next = session.placedNext ?? session.originNext;
          if (parent instanceof Element && parent.isConnected) {
            parent.insertBefore(
              session.image,
              next?.parentNode === parent ? next : null,
            );
            changed = true;
          }
        }

        if (changed) {
          emit();
          selectImage(session.image.isConnected ? session.image : null);
        }
      });
    });
  }, [clearDropLine, emit, selectImage]);

  return (
    <div className="border-lavender/25 bg-indigo-deep/40 flex flex-col overflow-hidden rounded-lg border">
      {uploadError && (
        <p
          data-testid="editor-upload-error"
          className="text-ember bg-ember/10 border-ember/30 border-b px-3 py-2 text-sm"
        >
          {t("admin.editor.uploadFailed")}
        </p>
      )}
      <div className="border-lavender/15 flex flex-wrap items-center gap-1 border-b p-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.key}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => {
              tool.run(exec);
            }}
            data-testid={`editor-${tool.key}`}
            aria-label={t(`admin.editor.${tool.key}`)}
            className="text-mist/70 hover:bg-lavender/10 hover:text-lavender inline-flex size-9 items-center justify-center rounded-md transition-colors"
          >
            <tool.icon className="size-4" aria-hidden="true" />
          </button>
        ))}

        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={addLink}
          aria-label={t("admin.editor.link")}
          className="text-mist/70 hover:bg-lavender/10 hover:text-lavender inline-flex size-9 items-center justify-center rounded-md transition-colors"
        >
          <Link2 className="size-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label={t("admin.editor.image")}
          data-testid="editor-image"
          className="text-mist/70 hover:bg-lavender/10 hover:text-lavender inline-flex size-9 items-center justify-center rounded-md transition-colors"
        >
          <ImageIcon className="size-4" aria-hidden="true" />
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) insertImageFile(file, currentRange(editorRef.current));
            event.target.value = "";
          }}
        />

        <span className="text-mist/40 ml-auto hidden pr-2 text-xs sm:block">
          {t("admin.editor.imageHint")}
        </span>
      </div>

      <div className="relative">
        <div
          ref={attachEditor}
          contentEditable
          suppressContentEditableWarning
          data-testid="editor-body"
          className="blog-content blog-editor text-mist/85 min-h-[24rem] px-5 py-4 text-base leading-relaxed outline-none"
          onInput={emit}
          onBlur={emit}
          onKeyDown={onEditorKeyDown}
          onPointerDown={(event) => {
            pressedImageRef.current =
              event.target instanceof HTMLImageElement ? event.target : null;
          }}
          onClick={(event) => {
            const target = event.target;
            selectImage(target instanceof HTMLImageElement ? target : null);
          }}
          onDragStart={(event) => {
            const image = draggedImage(event.target, pressedImageRef.current);
            const editor = editorRef.current;
            if (!image || !editor) return;

            dragRef.current = {
              image,
              twinsBefore: [...editor.querySelectorAll("img")].filter(
                (candidate) =>
                  candidate !== image &&
                  candidate.getAttribute("src") === image.getAttribute("src"),
              ),
              originParent: image.parentNode,
              originNext: image.nextSibling,
              placedParent: null,
              placedNext: null,
            };
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", "");
          }}
          onDragOver={(event) => {
            const isFile = event.dataTransfer.types.includes("Files");
            if (!dragRef.current && !isFile) return;

            event.preventDefault();
            // Honest cursor: repositioning moves, a file from outside copies.
            event.dataTransfer.dropEffect = dragRef.current ? "move" : "copy";
            showDropLine(event.clientX, event.clientY);
          }}
          onDragLeave={(event) => {
            const next = event.relatedTarget;
            if (
              !(next instanceof Node) ||
              !event.currentTarget.contains(next)
            ) {
              clearDropLine();
            }
          }}
          onDrop={(event) => {
            clearDropLine();
            const imageFile = [...event.dataTransfer.files].find((file) =>
              file.type.startsWith("image/"),
            );
            const session = dragRef.current;
            if (!imageFile && !session) return;

            event.preventDefault();
            const range = caretRangeAt(event.clientX, event.clientY);
            const editor = editorRef.current;

            if (imageFile) {
              insertImageFile(imageFile, range, event.clientY);
            } else if (session && editor) {
              // Move the existing image to where it was dropped, at block level.
              placeBlock(editor, session.image, range, event.clientY);
              session.placedParent = session.image.parentNode;
              session.placedNext = session.image.nextSibling;
              emit();
              selectImage(session.image);
            }
          }}
          onDragEnd={onDragEnd}
          onPaste={(event) => {
            /*
             * Screenshots pasted from the clipboard. Left to the browser, the
             * paste lands as a base64 data: URL — megabytes in the body, and
             * the sanitizer then strips the scheme on save, so the image
             * silently vanishes from the published post. Upload it like any
             * other insert instead.
             */
            const file = [...event.clipboardData.files].find((candidate) =>
              candidate.type.startsWith("image/"),
            );
            if (!file) return;
            event.preventDefault();
            insertImageFile(file, currentRange(editorRef.current));
          }}
        />

        {dropLine && (
          <div
            aria-hidden="true"
            data-testid="editor-drop-indicator"
            className="bg-lavender pointer-events-none absolute z-10 h-0.5 rounded-full"
            style={{
              left: `${dropLine.left.toString()}px`,
              top: `${dropLine.top.toString()}px`,
              width: `${dropLine.width.toString()}px`,
            }}
          />
        )}

        {selected && box && (
          <>
            {/* The selection outline — an overlay, so the image's own HTML is
                never touched by a decoration that must not be saved. */}
            <div
              aria-hidden="true"
              className="ring-lavender/70 pointer-events-none absolute z-0 rounded-sm ring-2"
              style={{
                left: `${box.left.toString()}px`,
                top: `${box.top.toString()}px`,
                width: `${(box.right - box.left).toString()}px`,
                height: `${(box.bottom - box.top).toString()}px`,
              }}
            />

            {/* Alignment, floating above the image's top-left corner. */}
            <div
              className="border-indigo-deep bg-ink-deep absolute z-10 flex -translate-y-[calc(100%+0.5rem)] items-center gap-0.5 rounded-lg border p-1 shadow-[0_0.5rem_1.5rem_-0.5rem_rgba(0,0,0,0.8)]"
              style={{
                left: `${box.left.toString()}px`,
                top: `${box.top.toString()}px`,
              }}
            >
              {ALIGNMENTS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={() => {
                    setAlign(option.key);
                  }}
                  aria-label={t(`admin.editor.align_${option.key}`)}
                  data-testid={`editor-align-${option.key}`}
                  className="text-mist/70 hover:bg-lavender/10 hover:text-lavender inline-flex size-7 items-center justify-center rounded-md transition-colors"
                >
                  <option.icon className="size-4" aria-hidden="true" />
                </button>
              ))}

              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={editAlt}
                aria-label={t("admin.editor.alt")}
                data-testid="editor-image-alt"
                className="text-mist/70 hover:bg-lavender/10 hover:text-lavender inline-flex size-7 items-center justify-center rounded-md transition-colors"
              >
                <Captions className="size-4" aria-hidden="true" />
              </button>

              {/* Separated from the alignment group: it is the one control here
                  that destroys something, and it should not sit flush against
                  the buttons a hand is moving between. */}
              <span
                className="bg-indigo-deep mx-0.5 h-5 w-px"
                aria-hidden="true"
              />

              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={removeSelected}
                aria-label={t("admin.editor.removeImage")}
                data-testid="editor-image-remove"
                className="text-mist/70 hover:bg-ember/10 hover:text-ember inline-flex size-7 items-center justify-center rounded-md transition-colors"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* The step the image will snap to when the handle is released. */}
            {resizePercent !== null && (
              <span
                data-testid="editor-resize-percent"
                className="border-indigo-deep bg-ink-deep text-mist absolute z-10 -translate-x-full rounded-md border px-2 py-0.5 font-mono text-xs"
                style={{
                  left: `${(box.right - 8).toString()}px`,
                  top: `${(box.bottom + 8).toString()}px`,
                }}
              >
                {resizePercent}%
              </span>
            )}

            {/* Resize handle at the bottom-right corner. */}
            <button
              type="button"
              aria-label={t("admin.editor.resize")}
              data-testid="editor-resize-handle"
              onPointerDown={startResize}
              style={{
                left: `${box.right.toString()}px`,
                top: `${box.bottom.toString()}px`,
              }}
              className="border-ink-deep bg-lavender absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize touch-none rounded-sm border-2"
            />
          </>
        )}
      </div>
    </div>
  );
}

/** The current caret range if it sits inside the editor, else null. */
function currentRange(editor: HTMLElement | null): Range | null {
  if (!editor) return null;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  return editor.contains(range.commonAncestorContainer)
    ? range.cloneRange()
    : null;
}

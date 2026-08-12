import {
  useCallback,
  useRef,
  useState,
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
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  Quote,
} from "lucide-react";

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

function clampWidth(percent: number): number {
  return Math.min(100, Math.max(25, Math.round(percent)));
}

/** Move a block image horizontally with its margins, keeping width and rhythm. */
function applyAlign(image: HTMLImageElement, align: Align): void {
  image.style.marginLeft = align === "left" ? "0" : "auto";
  image.style.marginRight = align === "right" ? "0" : "auto";
}

function makeImage(src: string): HTMLImageElement {
  const image = document.createElement("img");
  image.src = src;
  image.alt = "";
  image.className = "blog-image";
  image.draggable = true;
  image.style.width = "100%";
  return image;
}

/**
 * Drop a node in as a block between the editor's top-level children rather than
 * inside a line of text, so an image never lands mid-sentence. The caret gives
 * the block it belongs to; the pointer's height decides above or below it.
 */
function placeBlock(
  editor: HTMLElement,
  node: Node,
  range: Range | null,
  y?: number,
): void {
  if (!range) {
    editor.append(node);
  } else {
    let ref: Node = range.startContainer;
    while (ref.parentNode && ref.parentNode !== editor) ref = ref.parentNode;

    if (ref.parentNode !== editor) {
      editor.append(node);
    } else if (ref instanceof Element && y !== undefined) {
      const rect = ref.getBoundingClientRect();
      if (y > rect.top + rect.height / 2) ref.after(node);
      else ref.before(node);
    } else {
      editor.insertBefore(node, ref);
    }
  }

  // A trailing image would leave the caret nowhere to go; give it a line.
  if (node.nextSibling === null && node.parentNode === editor) {
    const paragraph = document.createElement("p");
    paragraph.innerHTML = "<br>";
    editor.append(paragraph);
  }
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
 * toolbar; images are dropped or picked in, then positioned by hand — dragged
 * to any point in the article, aligned left/centre/right, and resized by the
 * corner handle. The body is plain HTML in and out, so what is stored is what
 * the post page renders.
 *
 * Images are inlined as data URLs while editing; the local authoring endpoint
 * writes them out to real asset files on save, so nothing here needs a server.
 */
export function RichEditor({ value, onChange }: RichEditorProps) {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const draggedRef = useRef<HTMLImageElement | null>(null);
  const [selected, setSelected] = useState<HTMLImageElement | null>(null);
  const [box, setBox] = useState<Box | null>(null);

  const attachEditor = useCallback(
    (node: HTMLDivElement | null) => {
      editorRef.current = node;
      if (node && !seeded.current) {
        node.innerHTML = value;
        seeded.current = true;
      }
    },
    [value],
  );

  const emit = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
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
    if (!image || !editor) {
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

  const insertImageFile = useCallback(
    (file: File, range: Range | null, y?: number) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") return;
        const editor = editorRef.current;
        if (!editor) return;

        const image = makeImage(reader.result);
        placeBlock(editor, image, range ?? currentRange(editor), y);
        emit();
        selectImage(image);
      };
      reader.readAsDataURL(file);
    },
    [emit, selectImage],
  );

  const startResize = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const image = selected;
      const editor = editorRef.current;
      if (!image || !editor) return;

      event.preventDefault();
      const target: HTMLImageElement = image;
      const startX = event.clientX;
      const startWidth = target.getBoundingClientRect().width;
      const columnWidth = editor.clientWidth;

      function onMove(move: PointerEvent) {
        const next = startWidth + (move.clientX - startX);
        target.style.width = `${clampWidth((next / columnWidth) * 100).toString()}%`;
        positionControls(target);
      }

      function onUp() {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        emit();
      }

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [selected, emit, positionControls],
  );

  const setAlign = useCallback(
    (align: Align) => {
      if (!selected) return;
      applyAlign(selected, align);
      positionControls(selected);
      emit();
    },
    [selected, emit, positionControls],
  );

  return (
    <div className="border-lavender/25 bg-indigo-deep/40 flex flex-col overflow-hidden rounded-lg border">
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
          onClick={(event) => {
            const target = event.target;
            selectImage(target instanceof HTMLImageElement ? target : null);
          }}
          onDragStart={(event) => {
            if (event.target instanceof HTMLImageElement) {
              draggedRef.current = event.target;
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", "");
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDragEnd={() => {
            draggedRef.current = null;
          }}
          onDrop={(event) => {
            const imageFile = [...event.dataTransfer.files].find((file) =>
              file.type.startsWith("image/"),
            );
            const dragged = draggedRef.current;
            if (!imageFile && !dragged) return;

            event.preventDefault();
            const range = caretRangeAt(event.clientX, event.clientY);
            const editor = editorRef.current;

            if (imageFile) {
              insertImageFile(imageFile, range, event.clientY);
            } else if (dragged && editor) {
              // Move the existing image to where it was dropped, at block level.
              placeBlock(editor, dragged, range, event.clientY);
              emit();
              selectImage(dragged);
            }
            draggedRef.current = null;
          }}
        />

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
            </div>

            {/* Resize handle at the bottom-right corner. */}
            <button
              type="button"
              aria-label={t("admin.editor.resize")}
              onPointerDown={startResize}
              style={{
                left: `${box.right.toString()}px`,
                top: `${box.bottom.toString()}px`,
              }}
              className="border-ink-deep bg-lavender absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-sm border-2"
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

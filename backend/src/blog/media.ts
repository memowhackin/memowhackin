import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import sharp from "sharp";
import { env } from "../env.js";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** The blog column tops out well under this; 1600 still covers 2x displays. */
const MAX_DIMENSION = 1600;

/*
 * SVG is deliberately absent. An SVG is a document, not an image: served from
 * the marketing origin it can carry script, which makes an upload form a stored
 * XSS vector. The old vite-based authoring plugin accepted image/svg+xml — that
 * is not carried over.
 */
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "gif"]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
});

export interface StoredImage {
  filename: string;
  width: number;
  height: number;
  sizeBytes: number;
  contentType: string;
}

/**
 * Decode, verify, downscale and re-encode to WebP.
 *
 * The re-encode is the security control, not a nicety: nothing of the original
 * file survives it, so EXIF, trailing archives and anything smuggled past the
 * content-type check are all gone. What lands on disk is bytes this process
 * produced from a decoded pixel buffer.
 */
export async function processAndStore(data: Buffer): Promise<StoredImage> {
  const image = sharp(data, {
    failOn: "error",
    // Decompression-bomb guard. A few hundred kilobytes of PNG can declare a
    // 50000x50000 canvas, and decoding it is gigabytes of RAM — a one-request
    // denial of service. 50 megapixels is far beyond any real blog image.
    limitInputPixels: 50_000_000,
    sequentialRead: true,
    // One frame only: an animated source would otherwise be decoded in full
    // before being flattened anyway.
    pages: 1,
  });

  /*
   * Anything sharp cannot decode is a rejected upload, not a server fault. That
   * covers the interesting cases: an SVG (which sharp will not rasterise here),
   * a shell script wearing an image/png content type, and a truncated or
   * deliberately malformed file. Letting these escape as exceptions would turn
   * a hostile upload into a 500 and hide it in the error logs.
   */
  let output: { data: Buffer; info: { width: number; height: number } };
  try {
    const metadata = await image.metadata();

    if (
      metadata.format === undefined ||
      !ALLOWED_FORMATS.has(metadata.format)
    ) {
      throw new UnsupportedImage(metadata.format ?? "unknown");
    }

    output = await image
      .rotate() // bake in EXIF orientation before the tag is discarded
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch (error) {
    if (error instanceof UnsupportedImage) throw error;
    throw new UnsupportedImage("undecodable");
  }

  const filename = `${randomUUID()}.webp`;
  await mkdir(env.UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(env.UPLOAD_DIR, filename), output.data);

  return {
    filename,
    width: output.info.width,
    height: output.info.height,
    sizeBytes: output.data.byteLength,
    contentType: "image/webp",
  };
}

export class UnsupportedImage extends Error {
  constructor(format: string) {
    super(`unsupported image format: ${format}`);
    this.name = "UnsupportedImage";
  }
}

/**
 * Resolve a stored file for serving. Returns undefined for anything that is not
 * a bare filename, so no request can walk out of the upload directory whatever
 * the router matched.
 */
export function mediaPath(filename: string): string | undefined {
  if (filename !== path.basename(filename)) return undefined;
  if (!/^[a-zA-Z0-9-]+\.webp$/.test(filename)) return undefined;
  return path.resolve(env.UPLOAD_DIR, filename);
}

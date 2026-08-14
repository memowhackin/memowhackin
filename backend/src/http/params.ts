import type { Request, Response } from "express";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/*
 * Postgres raises a type error on a malformed uuid, so passing `:id` straight
 * into a query turns `/api/posts/../../etc` into a 500 with a driver message in
 * the logs instead of a clean 404. Validate the shape at the edge.
 *
 * Returns undefined and has already sent the response when the id is invalid.
 */
export function uuidParam(
  req: Request,
  res: Response,
  name: string,
): string | undefined {
  const value = req.params[name];
  if (typeof value !== "string" || !UUID.test(value)) {
    res.status(404).json({ error: "not_found" });
    return undefined;
  }
  return value;
}

const LOCALE = /^[a-z]{2}(-[A-Z]{2})?$/;

/** Locales are a closed shape; anything else falls back to the default. */
export function localeQuery(req: Request): string {
  const raw = req.query.locale;
  if (typeof raw === "string" && LOCALE.test(raw)) return raw;
  return "en";
}

export { UUID };

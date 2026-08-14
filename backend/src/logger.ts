import pino from "pino";
import { isProduction } from "./env.js";

export const logger = pino({
  level: isProduction ? "info" : "debug",
  // Passwords and cookies must never reach a log line, however a handler is
  // written later.
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      "password",
      "*.password",
    ],
    censor: "[redacted]",
  },
});

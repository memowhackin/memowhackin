import "dotenv/config";

import { stdin, stdout } from "node:process";
import { eq } from "drizzle-orm";
import { hashPassword } from "../src/auth/password.js";
import { db, pool } from "../src/db/client.js";
import { adminUsers } from "../src/db/schema.js";

/*
 * The only way an account comes into existence. There is no registration
 * endpoint, so this runs on the server, by hand, once per author.
 *
 * The password is read from a prompt or from stdin, never from an argument:
 * arguments land in shell history and are visible in the process list to every
 * other user on the machine.
 *
 * Interactive:
 *   npm run create-admin
 * Piped, for a container or a provisioning script:
 *   printf 'a@b.test\nName\npassword\npassword\n' | npm run create-admin
 */

/*
 * `docker compose run` without a TTY, and any piped invocation, give a stdin
 * that is not a terminal. Masking keystrokes there is meaningless and the
 * keypress hack below would corrupt the input, so the two cases are handled
 * separately rather than pretending they are the same.
 */
const interactive = stdin.isTTY === true;

let pipedLines: string[] | undefined;

async function readPipedLines(): Promise<string[]> {
  let text = "";
  stdin.setEncoding("utf8");
  for await (const chunk of stdin) text += String(chunk);
  return text.split("\n");
}

async function prompt(question: string, hidden: boolean): Promise<string> {
  if (!interactive) {
    pipedLines ??= await readPipedLines();
    const line = pipedLines.shift();
    if (line === undefined) {
      throw new Error(
        "not enough input: expected email, name, password, password",
      );
    }
    return line.trim();
  }

  return readFromTerminal(question, hidden);
}

/*
 * Reads one line from the terminal, echoing it only when it is not a secret.
 *
 * This owns stdin outright, and readline is not used at all in interactive
 * mode. Three attempts failed before this one, each for its own reason:
 *
 *   - a "data" listener alongside readline stole the bytes readline was waiting
 *     for, so the prompt never drew and the script hung at the password step;
 *   - overriding `_writeToOutput` — the recipe every snippet online gives — is
 *     a no-op on current Node, where that hook moved behind internal symbols,
 *     so the password was printed in clear with no warning;
 *   - keeping readline open only for the visible prompts still lost, because it
 *     restores the terminal to cooked mode between its own questions and the
 *     line discipline then echoed the password itself.
 *
 * One reader, one owner, no private API. Secrets echo nothing at all — not even
 * asterisks, so the length does not leak to anyone looking at the screen, which
 * is what sudo does.
 */
function readFromTerminal(question: string, hidden: boolean): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let value = "";
    const wasRaw = stdin.isRaw;

    /*
     * Raw mode goes on BEFORE the prompt is written. The terminal's own line
     * discipline echoes input until it is disabled, so writing the prompt first
     * leaves a window in which anything typed appears on screen in clear.
     */
    if (stdin.isTTY) stdin.setRawMode(true);
    stdout.write(question);

    const done = (finish: () => void): void => {
      stdin.off("data", onData);
      if (stdin.isTTY) stdin.setRawMode(wasRaw === true);
      stdin.pause();
      stdout.write("\n");
      finish();
    };

    const onData = (chunk: string): void => {
      for (const key of chunk) {
        switch (key) {
          case "\r":
          case "\n":
            done(() => {
              resolve(value.trim());
            });
            return;
          case "\u0003": // Ctrl+C
            done(() => {
              reject(new Error("cancelled"));
            });
            return;
          case "\u007f": // Backspace (DEL)
          case "\b":
            if (value.length > 0) {
              value = value.slice(0, -1);
              // Rub it off the screen, but only if it was shown.
              if (!hidden) stdout.write("\b \b");
            }
            break;
          default:
            // Ignore the remaining control characters; take everything else.
            if (key >= " ") {
              value += key;
              // Raw mode echoes nothing for us, so visible
              // input has to be written back deliberately.
              if (!hidden) stdout.write(key);
            }
        }
      }
    };

    stdin.resume();
    stdin.setEncoding("utf8");
    stdin.on("data", onData);
  });
}

async function main(): Promise<void> {
  const email = (await prompt("Email: ", false)).toLowerCase();
  const name = await prompt("Full name: ", false);
  const password = await prompt("Password: ", true);
  const confirm = await prompt("Confirm password: ", true);

  if (email.length === 0 || name.length === 0) {
    throw new Error("email and name are required");
  }
  if (password !== confirm) {
    throw new Error("passwords do not match");
  }
  if (password.length < 12) {
    throw new Error("password must be at least 12 characters");
  }

  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error(`an account already exists for ${email}`);
  }

  await db.insert(adminUsers).values({
    email,
    name,
    passwordHash: await hashPassword(password),
  });

  stdout.write(`Created admin account for ${email}\n`);
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    stdout.write(`Failed: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Leave the terminal as it was found, even on the error path — a process
    // that exits while stdin is still raw leaves the shell without an echo.
    if (stdin.isTTY) stdin.setRawMode(false);
    stdin.pause();
    await pool.end();
  });

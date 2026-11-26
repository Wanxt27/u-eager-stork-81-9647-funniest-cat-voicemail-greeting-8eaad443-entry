// Funniest Cat Voicemail Greeting — make.fun entry
// u-eager-stork-81-9647-funniest-cat-voicemail-greeting-8eaad443
//
// Writes one voicemail greeting, recorded by a cat, to /output/entry.txt.
// The greeting must be exactly one line of 1-120 characters: Mittens is
// asleep on the keyboard, and your message will not survive her. Node 22,
// standard library only; the output file gets no trailing newline.

import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "/output";
const OUT_PATH = join(OUT_DIR, "entry.txt");
const MAX_CHARS = 120;

// The line, 118 characters: a cat's voicemail in one breath — she answers,
// she is on the keyboard, and she will delete your message with her butt.
const LINE =
  "You've reached Mittens. I'm asleep on your keyboard — leave a message " +
  "after the beep, and I'll delete it with my butt.";

function validateLine(line: string): void {
  if (line.length < 1 || line.length > MAX_CHARS) {
    throw new Error(
      `voicemail line must be 1-${MAX_CHARS} characters, got ${line.length}`,
    );
  }
  if (line.trim().length === 0) {
    throw new Error("voicemail line must not be only whitespace");
  }
  if (line !== line.trim()) {
    throw new Error("voicemail line must not start or end with whitespace");
  }
  for (const ch of ["\n", "\r", "\u2028", "\u2029"]) {
    if (line.includes(ch)) {
      throw new Error("voicemail line must be a single line");
    }
  }
}

function main(): void {
  validateLine(LINE);
  // Create the output directory if needed; never remove it.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_PATH, LINE, "utf8");
  // Read back and confirm the bytes on disk are exactly the line.
  const onDisk = readFileSync(OUT_PATH, "utf8");
  if (onDisk !== LINE) {
    throw new Error("output on disk does not match the voicemail line");
  }
  // The sealed gate reads UTF-8 bytes: confirm the line round-trips through
  // UTF-8 encoding with no change, so no hidden character can sneak in.
  const encoded = new TextEncoder().encode(LINE);
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(encoded);
  if (decoded !== LINE || encoded.byteLength !== Buffer.byteLength(LINE, "utf8")) {
    throw new Error("voicemail line does not round-trip through UTF-8");
  }
  // The file must hold exactly the line: its byte size equals the line's
  // UTF-8 length, which also rules out a trailing newline or extra bytes.
  const { size } = statSync(OUT_PATH);
  if (size !== Buffer.byteLength(LINE, "utf8")) {
    throw new Error("output file size does not match the voicemail line");
  }
  validateLine(onDisk);
  console.log(`wrote ${OUT_PATH} (${LINE.length} characters, one line)`);
}

main();

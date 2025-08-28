import crypto from "crypto";

export function base64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function sha256Base64url(input: string) {
  const hash = crypto.createHash("sha256").update(input, "utf8").digest();
  return base64url(hash);
}

export function randomToken(bytes = 64) {
  return base64url(crypto.randomBytes(bytes));
}

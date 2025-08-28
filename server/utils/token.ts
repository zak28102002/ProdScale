import jwt, { SignOptions } from "jsonwebtoken";
import { users, refreshTokens } from "../../shared/schema";
import { eq, and, isNull } from "drizzle-orm";
import { randomToken, sha256Base64url } from "./crypto";
import { addDays } from "date-fns";
import { nanoid } from "nanoid";
import { db } from "server/db";
import { storage } from "server/storage";

export function signAccessToken(userId: string) {
  const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "";
  const expiresIn = process.env.ACCESS_TOKEN_TTL ?? ("" as any);
  const opts: SignOptions = { expiresIn };
  return jwt.sign({ sub: userId }, JWT_ACCESS_SECRET, opts);
}

export async function mintRefreshToken(
  userId: string,
  familyId?: string,
  deviceId?: string,
) {
  const raw = randomToken(64);
  const tokenHash = sha256Base64url(raw);
  const id = nanoid();
  const fam = familyId || nanoid();
  const tokenExpiry: number = +(process.env.REFRESH_TOKEN_TTL_DAYS ?? "30");
  const expiresAt = addDays(new Date(), tokenExpiry); // Date (matches schema)

  await storage.insertRefreshToken({
    userId,
    tokenHash,
    familyId: fam,
    deviceId,
    expiresAt,
  });

  return { raw, id, familyId: fam, expiresAt };
}

/**
 * Rotate the refresh token:
 * - If token not found → invalid
 * - If revoked/expired → invalid (revoke family on reuse)
 * - Else revoke old and issue new within same family
 */
export async function rotateRefreshToken(presentedRaw: string) {
  const hash = sha256Base64url(presentedRaw);
  const row = await storage.findRefreshTokenByHash(hash);
  if (!row) throw new Error("invalid_refresh");
  if (row.revokedAt) {
    // Reuse → revoke family
    await storage.revokeRefreshTokensByFamily(row.familyId);
    throw new Error("reused_refresh");
  }
  if (row.expiresAt <= new Date()) {
    throw new Error("expired_refresh");
  }

  // mint new within same family
  const { raw: newRaw } = await mintRefreshToken(
    row.userId,
    row.familyId,
    row.deviceId || undefined,
  );
  // revoke old
  await storage.revokeRefreshToken(row.id, /* replacedBy */ undefined);

  const accessToken = signAccessToken(row.userId);
  return { accessToken, refreshToken: newRaw, userId: row.userId };
}

export async function revokeAllUserTokens(userId: string) {
  await storage.revokeAllRefreshTokensForUser(userId);
}

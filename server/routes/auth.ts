// server/routes/auth.ts
import { Router } from "express";
import { z } from "zod";
import { addHours } from "date-fns";
import { authMiddleware } from "../middleware/auth";
import { storage } from "../storage";
import {
  hashPassword,
  validatePassword,
  verifyPassword,
} from "../utils/password";
import { randomToken, sha256Base64url } from "../utils/crypto";
import {
  signAccessToken,
  mintRefreshToken,
  rotateRefreshToken,
  revokeAllUserTokens,
} from "../utils/token";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotSchema,
  resetSchema,
} from "../utils/validate";
import { sendPasswordResetEmail } from "server/utils/mailer";

const APP_URL = (process.env.APP_URL || "").replace(/\/+$/, "");

const router = Router();

function publicUser(u: any) {
  const { passwordHash, password, ...safe } = u;
  return safe;
}

/** GET /reset (HTML page) */
router.get("/reset", (req, res) => {
  const token = String(req.query.token || "");
  if (!token) {
    return res
      .status(400)
      .send("<h2>Missing token</h2><p>Use the link from your email.</p>");
  }

  // Inline minimal styles that resemble your RN auth screens
  const page = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Reset Password • ProdScale</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root { --bg:#fff; --fg:#111; --muted:#6b7280; --border:#e5e7eb; }
  *{ box-sizing:border-box; font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial; }
  body{ margin:0; background:var(--bg); color:var(--fg); }
  .wrap{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
  .card{ width:100%; max-width:480px; border:1px solid var(--border); border-radius:16px; padding:24px; }
  .brand{ display:flex; align-items:center; justify-content:center; flex-direction:column; margin-bottom:12px; }
  .logo{ width:56px; height:56px; border-radius:12px; background:#000; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; }
  h1{ font-size:20px; margin:12px 0 2px; }
  p{ color:var(--muted); margin:8px 0 16px; }
  label{ font-size:14px; font-weight:600; }
  input{ width:100%; height:44px; border:1px solid var(--border); border-radius:10px; padding:0 12px; margin:8px 0 4px; }
  .hint{ font-size:12px; color:var(--muted); margin:6px 0 12px; }
  .error{ font-size:12px; color:#ef4444; margin:6px 0 0; }
  .btn{ width:100%; height:44px; border-radius:12px; background:#000; color:#fff; font-weight:700; border:none; }
  .btn:disabled{ opacity:.5; }
  .success{ border:1px solid #e5e7eb; padding:12px; border-radius:10px; margin-top:12px; background:#f9fafb; }
</style>
</head><body>
<div class="wrap"><div class="card">
  <div class="brand">
    <div class="logo">PS</div>
    <h1>Reset your password</h1>
    <p>Enter a new password for your ProdScale account.</p>
  </div>

  <label>New password</label>
  <input id="pass" type="password" placeholder="••••••••" />
  <div class="hint">Min 6 chars, include 1 uppercase, 1 number, 1 special character.</div>

  <label>Confirm password</label>
  <input id="confirm" type="password" placeholder="••••••••" />

  <div id="err" class="error" style="display:none"></div>
  <button id="btn" class="btn" style="margin-top:12px">Update Password</button>

  <div id="done" class="success" style="display:none">Your password has been updated. You can close this page and sign in.</div>
</div></div>
<script>
  const PASS_RE = /^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{6,}$/;
  const token = ${JSON.stringify(token)};

  const btn = document.getElementById('btn');
  const err = document.getElementById('err');
  const done = document.getElementById('done');
  const pass = document.getElementById('pass');
  const confirm = document.getElementById('confirm');

  function showErr(m){ err.style.display='block'; err.textContent=m; }
  function clearErr(){ err.style.display='none'; err.textContent=''; }

  btn.addEventListener('click', async () => {
    clearErr();
    const p = pass.value.trim();
    const c = confirm.value.trim();
    if (!p) return showErr('Password is required');
    if (!PASS_RE.test(p)) return showErr('Password must include 1 uppercase, 1 number, 1 special character (min 6 chars).');
    if (p !== c) return showErr('Passwords do not match');

    btn.disabled = true;
    try {
      const res = await fetch('/auth/reset', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ token, password: p })
      });
      const j = await res.json().catch(()=>({}));
      if(!res.ok){ throw new Error(j?.error || j?.message || 'Failed'); }
      done.style.display='block';
    } catch(e){
      showErr(e.message || 'Something went wrong');
    } finally {
      btn.disabled = false;
    }
  });
</script>
</body></html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(page);
});

/** POST /auth/register */
router.post("/register", async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);
    if (!validatePassword(body.password)) {
      return res.status(400).json({
        error:
          "Password must include 1 uppercase letter, 1 number and 1 special character (min 6 chars).",
      });
    }

    const existing = await storage.getUserByEmail(body.email);
    if (existing)
      return res.status(400).json({ error: "Email already in use" });

    const passwordHash = await hashPassword(body.password);
    const user = await storage.createUser({
      // InsertUser type excludes id/createdAt/updatedAt
      name: body.name.trim(),
      email: body.email.trim(),
      passwordHash,
      isPro: false,
    } as any);

    await storage.createDefaultActivitiesForUser(user.id);

    const accessToken = signAccessToken(user.id);
    const { raw: refreshToken } = await mintRefreshToken(user.id);

    return res.json({ accessToken, refreshToken, user: publicUser(user) });
  } catch (e: any) {
    console.log("error", e);
    return res.status(500).json({ error: "Invalid input" });

    // if (e instanceof z.ZodError) {
    // 	return res.status(400).json({ error: e.errors[0]?.message || "Invalid input" });
    // }
    // return res.status(500).json({ error: "Internal error" });
  }
});

/** POST /auth/login */
router.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const u = await storage.getUserByEmail(body.email);
    if (!u) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await verifyPassword(body.password, u.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = signAccessToken(u.id);
    const { raw: refreshToken } = await mintRefreshToken(u.id);

    return res.json({ accessToken, refreshToken, user: publicUser(u) });
  } catch (e: any) {
    return res.status(500).json({ error: "Invalid credentials" });
  }
});

/** GET /auth/me */
router.get("/me", authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const u = await storage.getUser(userId);
  if (!u) return res.status(401).json({ error: "Unauthorized" });
  return res.json(publicUser(u));
});

/** POST /auth/refresh */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const rotated = await rotateRefreshToken(refreshToken);
    const u = await storage.getUser(rotated.userId);
    if (!u) return res.status(401).json({ error: "Unauthorized" });
    return res.json({
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
      user: publicUser(u), // optional convenience for client
    });
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
});

/** POST /auth/logout */
router.post("/logout", authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  await revokeAllUserTokens(userId);
  return res.status(204).send();
});

/** POST /auth/forgot */
router.post("/forgot", async (req, res) => {
  try {
    const { email } = forgotSchema.parse(req.body);
    const u = await storage.getUserByEmail(email);

    // We always return 200 to avoid leaking which emails exist.
    // But if a user exists, enforce rate-limits and send an email.

    if (u) {
      const now = new Date();
      const since = new Date(now.getTime() - 60 * 60 * 1000); // last 60m
      const count = await storage.countPasswordResetTokensSince(u.id, since);
      if (count >= 2) {
        // 429 with a retry hint; your RN client can use retryAfterSec if desired
        return res.status(429).json({
          error: "Too many reset requests. Try again later.",
          retryAfterSec: 60 * 30, // optional hint; you can compute exact TTL if you store last time
        });
      }

      // Invalidate previous tokens for this user
      await storage.deletePasswordResetTokensForUser(u.id);

      // Create new token
      const raw = randomToken(48);
      const tokenHash = sha256Base64url(raw);
      const expiresAt = addHours(new Date(), 1);
      await storage.insertPasswordResetToken({
        userId: u.id,
        tokenHash,
        expiresAt,
      });

      // Send email
      const link = `${APP_URL}/reset?token=${encodeURIComponent(raw)}`;
      await sendPasswordResetEmail(u.email, link);
    }

    return res.json({ ok: true });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: e.errors[0]?.message || "Invalid input" });
    }
    return res.status(500).json({ error: "Internal error" });
  }
});

/** POST /auth/reset */
router.post("/reset", async (req, res) => {
  try {
    const { token, password } = resetSchema.parse(req.body);
    if (!validatePassword(password)) {
      return res.status(400).json({
        error:
          "Password must include 1 uppercase letter, 1 number and 1 special character (min 6 chars).",
      });
    }

    const tokenHash = sha256Base64url(token);
    const rt = await storage.findPasswordResetTokenByHash(tokenHash);
    if (!rt || rt.used || rt.expiresAt <= new Date()) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const newHash = await hashPassword(password);
    await storage.updateUserPasswordHash(rt.userId, newHash);
    await storage.markPasswordResetTokenUsed(rt.id);
    await storage.revokeAllRefreshTokensForUser(rt.userId);

    return res.json({ ok: true });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: e.errors[0]?.message || "Invalid input" });
    }
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;

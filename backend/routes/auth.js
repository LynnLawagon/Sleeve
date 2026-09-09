import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  findUserByEmailOrUsername,
  findUserById,
  findUserByVerificationToken,
  createUser,
  setVerificationToken,
  markUserVerified,
} from "../db.js";
import { sendVerificationEmail } from "../utils/mailer.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,20}$/;
const TOKEN_TTL_HOURS = 24;

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

function publicUser(user) {
  return { id: user.id, email: user.email, username: user.username };
}

function newVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);
  return { token, expires };
}

router.post("/signup", async (req, res) => {
  const { email, username, password } = req.body || {};

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (!username || !USERNAME_RE.test(username)) {
    return res.status(400).json({ error: "Username must be 3-20 characters (letters, numbers, . _ -)." });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }
  if ((await findUserByEmailOrUsername(email)) || (await findUserByEmailOrUsername(username))) {
    return res.status(409).json({ error: "That email or username is already registered." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { token, expires } = newVerificationToken();

  const user = await createUser({
    id: crypto.randomUUID(),
    email: email.trim().toLowerCase(),
    username: username.trim(),
    passwordHash,
    verificationToken: token,
    verificationTokenExpires: expires,
  });

  await sendVerificationEmail(user.email, token);

  res.status(201).json({
    message: "Check your inbox for a verification link before signing in.",
  });
});

router.post("/verify", async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: "Missing verification token." });

  const user = await findUserByVerificationToken(token);
  if (!user) {
    return res.status(400).json({ error: "That verification link is invalid or has expired." });
  }

  await markUserVerified(user.id);
  res.json({ token: signToken(user.id), user: publicUser(user) });
});

router.post("/resend-verification", async (req, res) => {
  const { identifier } = req.body || {};
  if (!identifier) return res.status(400).json({ error: "Enter your email or username." });

  const user = await findUserByEmailOrUsername(identifier);
  // Same response whether or not the account exists, so this can't be used
  // to check which emails are registered.
  if (!user || user.email_verified) {
    return res.json({ message: "If that account needs verifying, a new link is on its way." });
  }

  const { token, expires } = newVerificationToken();
  await setVerificationToken(user.id, token, expires);
  await sendVerificationEmail(user.email, token);

  res.json({ message: "If that account needs verifying, a new link is on its way." });
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    return res.status(400).json({ error: "Enter your email/username and password." });
  }

  const user = await findUserByEmailOrUsername(identifier);
  if (!user) {
    return res.status(401).json({ error: "No account matches those details." });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Incorrect password." });
  }

  if (!user.email_verified) {
    return res.status(403).json({ error: "Verify your email before signing in.", needsVerification: true });
  }

  res.json({ token: signToken(user.id), user: publicUser(user) });
});

router.get("/me", async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No session." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(payload.userId);
    if (!user) return res.status(401).json({ error: "No session." });
    res.json({ user: publicUser(user) });
  } catch {
    res.status(401).json({ error: "No session." });
  }
});

export default router;

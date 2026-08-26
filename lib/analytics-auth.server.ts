import { cookies, headers } from "next/headers";
import { getRawDb } from "../db";

const COOKIE_NAME = "nefer_analytics_session";
const SESSION_SECONDS = 60 * 60 * 12;
const LOGIN_WINDOW_SECONDS = 15 * 60;
const MAX_LOGIN_FAILURES = 8;

async function runtimeValue(name: string) {
  const { env } = await import("cloudflare:workers");
  return String(env[name as keyof typeof env] ?? "");
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function verifyAnalyticsPassword(password: string) {
  const stored = await runtimeValue("ANALYTICS_ADMIN_PASSWORD_HASH");
  const [version, roundsText, saltText, expectedText] = stored.split("$");
  if (version !== "v1" || !roundsText || !saltText || !expectedText) return false;
  const rounds = Number(roundsText);
  if (!Number.isInteger(rounds) || rounds < 100_000) return false;
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: base64UrlToBytes(saltText), iterations: rounds },
    keyMaterial,
    256,
  );
  return constantTimeEqual(bytesToBase64Url(new Uint8Array(derived)), expectedText);
}

export async function createAnalyticsSessionCookie() {
  const secret = await runtimeValue("ANALYTICS_SESSION_SECRET");
  if (!secret) throw new Error("Analytics session secret is unavailable.");
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `v1.${expires}`;
  const signature = await hmac(payload, secret);
  return `${COOKIE_NAME}=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearAnalyticsSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function isAnalyticsAdmin() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value ?? "";
  const [version, expiresText, signature] = value.split(".");
  const expires = Number(expiresText);
  if (version !== "v1" || !signature || !Number.isInteger(expires) || expires <= Date.now() / 1000) return false;
  const secret = await runtimeValue("ANALYTICS_SESSION_SECRET");
  if (!secret) return false;
  const expected = await hmac(`${version}.${expiresText}`, secret);
  return constantTimeEqual(signature, expected);
}

async function requestFingerprint(requestHeaders: Headers) {
  const ip = requestHeaders.get("cf-connecting-ip") ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const agent = requestHeaders.get("user-agent") ?? "unknown";
  const salt = await runtimeValue("ANALYTICS_HASH_SALT");
  return hmac(`${ip}|${agent}`, salt || "nefer-atlasi");
}

export async function isLoginRateLimited(requestHeaders: Headers) {
  const db = await getRawDb();
  const fingerprint = await requestFingerprint(requestHeaders);
  const windowStart = Math.floor(Date.now() / 1000 / LOGIN_WINDOW_SECONDS) * LOGIN_WINDOW_SECONDS;
  const row = await db.prepare(
    "SELECT failures FROM analytics_login_attempts WHERE fingerprint_hash = ? AND window_start = ? LIMIT 1",
  ).bind(fingerprint, windowStart).first<{ failures: number }>();
  return Number(row?.failures ?? 0) >= MAX_LOGIN_FAILURES;
}

export async function recordLoginFailure(requestHeaders: Headers) {
  const db = await getRawDb();
  const fingerprint = await requestFingerprint(requestHeaders);
  const windowStart = Math.floor(Date.now() / 1000 / LOGIN_WINDOW_SECONDS) * LOGIN_WINDOW_SECONDS;
  const id = `${windowStart}:${fingerprint}`;
  await db.prepare(`
    INSERT INTO analytics_login_attempts (id, fingerprint_hash, window_start, failures)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET failures = failures + 1, updated_at = CURRENT_TIMESTAMP
  `).bind(id, fingerprint, windowStart).run();
}

export async function clearLoginFailures() {
  const requestHeaders = await headers();
  const fingerprint = await requestFingerprint(requestHeaders);
  const db = await getRawDb();
  await db.prepare("DELETE FROM analytics_login_attempts WHERE fingerprint_hash = ?").bind(fingerprint).run();
}

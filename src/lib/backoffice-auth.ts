const encoder = new TextEncoder();

export const BACKOFFICE_SESSION_COOKIE = "gds_backoffice_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function getSecret(): string | null {
  const secret = process.env.BACKOFFICE_AUTH_SECRET?.trim();
  if (!secret) {
    return null;
  }
  return secret;
}

export function getBackofficePassword(): string | null {
  const password = process.env.BACKOFFICE_PASSWORD?.trim();
  if (!password) {
    return null;
  }
  return password;
}

export function getBackofficeUsername(): string | null {
  const username = process.env.BACKOFFICE_USERNAME?.trim();
  if (!username) {
    return null;
  }
  return username;
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < aBytes.length; i += 1) {
    result |= aBytes[i] ^ bBytes[i];
  }
  return result === 0;
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`${payload}.${secret}`),
  );
  const bytes = new Uint8Array(digest);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createBackofficeSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) {
    return null;
  }
  const expiresAtMs = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = String(expiresAtMs);
  const signature = await signPayload(payload, secret);
  return `${payload}.${signature}`;
}

export async function isBackofficeSessionValid(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }
  const secret = getSecret();
  if (!secret) {
    return false;
  }
  const [expiresAtRaw, signature] = token.split(".");
  if (!expiresAtRaw || !signature) {
    return false;
  }
  const expiresAtMs = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    return false;
  }
  const expectedSignature = await signPayload(expiresAtRaw, secret);
  return timingSafeEqual(signature, expectedSignature);
}

export function hasBackofficeConfig(): boolean {
  return Boolean(getBackofficeUsername() && getBackofficePassword() && getSecret());
}

export function isBackofficeCredentialValid(
  inputUsername: string,
  inputPassword: string,
): boolean {
  const username = getBackofficeUsername();
  const password = getBackofficePassword();
  if (!username || !password) {
    return false;
  }
  return timingSafeEqual(inputUsername, username) && timingSafeEqual(inputPassword, password);
}

export function backofficeCookieMaxAge(): number {
  return SESSION_DURATION_SECONDS;
}

export async function hasValidBackofficeSessionFromRequest(
  request: Request,
): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return false;
  }
  const segments = cookieHeader.split(";").map((segment) => segment.trim());
  const cookiePrefix = `${BACKOFFICE_SESSION_COOKIE}=`;
  const rawToken = segments.find((segment) => segment.startsWith(cookiePrefix));
  if (!rawToken) {
    return false;
  }
  const token = decodeURIComponent(rawToken.slice(cookiePrefix.length));
  return isBackofficeSessionValid(token);
}

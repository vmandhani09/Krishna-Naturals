const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: process.env.GOOGLE_CALLBACK_URL || "",
    response_type: "code",
    scope: [
      "openid",
      "email",
      "profile",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
  });
  return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uri: process.env.GOOGLE_CALLBACK_URL || "",
    grant_type: "authorization_code",
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to exchange code: ${text}`);
  }
  return res.json() as Promise<{ access_token: string; id_token?: string }>;
}

export async function fetchGoogleUser(accessToken: string) {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch userinfo: ${text}`);
  }
  return res.json() as Promise<{ id: string; email: string; name: string; picture?: string }>;
}



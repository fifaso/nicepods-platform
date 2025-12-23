// supabase/functions/_shared/google-auth.ts
import { create } from "https://deno.land/x/djwt@v2.2/mod.ts";

export async function getGoogleAccessToken() {
  const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL")!;
  const privateKeyRaw = Deno.env.get("GOOGLE_PRIVATE_KEY")!;
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  const jwt = await create({ alg: "RS256", typ: "JWT" }, {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  }, privateKey);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`Error Auth Google: ${JSON.stringify(data)}`);
  return data.access_token;
}
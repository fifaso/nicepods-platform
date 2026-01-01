// supabase/functions/_shared/google-auth.ts
// VERSIÓN: 2.0 (Vertex AI Multi-Service Support)

import { create } from "https://deno.land/x/djwt@v2.2/mod.ts";

/**
 * Genera un Access Token de Google Cloud mediante Service Account.
  * El scope 'cloud-platform' permite el acceso a Gemini Multimodal e Imagen 3.
   */
   export async function getGoogleAccessToken(): Promise<string> {
     const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL");
       const privateKeyRaw = Deno.env.get("GOOGLE_PRIVATE_KEY");

         if (!clientEmail || !privateKeyRaw) {
             throw new Error("Falla de Infraestructura: Credenciales de Google Cloud no configuradas.");
               }

                 // Normalizamos los saltos de línea de la llave privada
                   const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

                     // Construcción del JWT para el intercambio de token
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
                                                                                 
                                                                                   if (!response.ok) {
                                                                                       throw new Error(`Error de Autenticación Google: ${JSON.stringify(data)}`);
                                                                                         }

                                                                                           return data.access_token;
                                                                                           }
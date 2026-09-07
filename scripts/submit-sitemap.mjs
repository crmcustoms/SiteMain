#!/usr/bin/env node
// Tells Google to re-fetch sitemap.xml right after a deploy, instead of
// waiting for Googlebot's own schedule (which drifted to 7+ months once —
// see wiki/sitemain.md SEO section for the incident this fixes).
//
// Uses the Search Console API (still supported) rather than the old
// GET /ping?sitemap= endpoint, which Google retired in 2023.
//
// Needs a GCP service account with "Owner"/"Full" access on the
// crmcustoms.com Search Console property. Its JSON key goes into the
// GSC_SERVICE_ACCOUNT_KEY_B64 secret (base64 of the whole key file — same
// pattern already used for SUPABASE_SERVICE_ROLE_KEY in this repo).
//
// Best-effort: a failure here (missing secret, expired grant, API hiccup)
// logs a warning and exits 0, so it never blocks a deploy.

import { createSign } from "node:crypto"

const SITE_URL = "sc-domain:crmcustoms.com"
const SITEMAP_URL = "https://crmcustoms.com/sitemap.xml"
const SCOPE = "https://www.googleapis.com/auth/webmasters"
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function signJwt({ clientEmail, privateKey }) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: "RS256", typ: "JWT" }
  const claims = {
    iss: clientEmail,
    scope: SCOPE,
    aud: TOKEN_ENDPOINT,
    iat: now,
    exp: now + 3600,
  }
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`
  const signature = createSign("RSA-SHA256").update(unsigned).sign(privateKey)
  return `${unsigned}.${base64url(signature)}`
}

async function getAccessToken(serviceAccount) {
  const jwt = signJwt({
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  })

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    throw new Error(`token exchange failed: ${res.status} ${await res.text()}`)
  }
  const { access_token } = await res.json()
  return access_token
}

async function submitSitemap(accessToken) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`
  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    throw new Error(`sitemaps.submit failed: ${res.status} ${await res.text()}`)
  }
}

async function main() {
  const keyB64 = process.env.GSC_SERVICE_ACCOUNT_KEY_B64
  if (!keyB64) {
    console.warn("[submit-sitemap] GSC_SERVICE_ACCOUNT_KEY_B64 not set — skipping (not configured yet)")
    return
  }

  let serviceAccount
  try {
    serviceAccount = JSON.parse(Buffer.from(keyB64, "base64").toString("utf8"))
  } catch (err) {
    console.warn(`[submit-sitemap] could not parse GSC_SERVICE_ACCOUNT_KEY_B64: ${err.message}`)
    return
  }

  try {
    const accessToken = await getAccessToken(serviceAccount)
    await submitSitemap(accessToken)
    console.log(`[submit-sitemap] OK — asked Google to re-fetch ${SITEMAP_URL}`)
  } catch (err) {
    console.warn(`[submit-sitemap] failed (non-fatal): ${err.message}`)
  }
}

main()

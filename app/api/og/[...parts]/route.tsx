import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

// Static instances (Latin + Cyrillic glyphs in one file) generated from Google Fonts'
// variable-font sources via fonttools varLib.instancer — the split per-script woff
// files Google serves to browsers only cover Cyrillic OR Latin per file, which left
// Latin words (e.g. "Excel") rendering in a fallback font when mixed into Ukrainian text.
const unboundedBlack = fs.readFileSync(
  path.join(process.cwd(), "assets/fonts/Unbounded-900-full.ttf"),
)
const unboundedBold = fs.readFileSync(
  path.join(process.cwd(), "assets/fonts/Unbounded-700-full.ttf"),
)
const golosText = fs.readFileSync(
  path.join(process.cwd(), "assets/fonts/GolosText-600-full.ttf"),
)

// Title/tag live in the PATH (/api/og/<title>/<tag>), not the query string
// (?title=&tag=). Netlify's edge CDN ignores query strings for cache-key
// purposes unless told otherwise via a Netlify-Vary header — and their own
// Next.js runtime overwrites any custom Netlify-Vary value with its own
// framework-computed one, so that header can't be relied on here. Every CDN
// varies its cache by path by default, so encoding the params into the path
// sidesteps the whole problem instead of fighting platform-specific headers.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parts: string[] }> },
) {
  const { parts } = await params
  const title = (parts[0] ? decodeURIComponent(parts[0]) : "CRM Customs").slice(0, 140)
  const tag = parts[1] ? decodeURIComponent(parts[1]) : null

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f2ec",
          padding: "64px 72px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "#e8b84b",
            opacity: 0.35,
            display: "flex",
          }}
        />

        <div style={{ display: "flex" }}>
          {tag && (
            <div
              style={{
                display: "flex",
                background: "#e8b84b",
                color: "#1a1a1a",
                fontFamily: "Unbounded",
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "10px 20px",
                borderRadius: 4,
              }}
            >
              {tag}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Unbounded",
            fontWeight: 900,
            fontSize: title.length > 70 ? 52 : 64,
            lineHeight: 1.15,
            letterSpacing: -1,
            color: "#1a1a1a",
            maxWidth: 980,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: "Golos Text",
            fontWeight: 600,
            fontSize: 26,
            color: "#1a1a1a",
          }}
        >
          <span style={{ color: "#e8b84b" }}>CRM</span>CUSTOMS
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Unbounded", data: unboundedBlack, weight: 900, style: "normal" },
        { name: "Unbounded", data: unboundedBold, weight: 700, style: "normal" },
        { name: "Golos Text", data: golosText, weight: 600, style: "normal" },
      ],
      headers: {
        // Non-immutable, moderate window — content is fully determined by the
        // path (which never changes for a given article), but this keeps any
        // future mistake from getting stuck for a long time regardless.
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  )
}

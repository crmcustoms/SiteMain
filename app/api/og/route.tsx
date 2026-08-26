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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = (searchParams.get("title") || "CRM Customs").slice(0, 140)
  const tag = searchParams.get("tag")

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
          CRM<span style={{ color: "#e8b84b" }}>CUSTOMS</span>
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
        // Netlify's CDN ignores query strings for cache-key purposes by default
        // (to protect hit rate against tracking params), so without this every
        // ?title=/?tag= variant collapses onto whichever one was cached first.
        "Netlify-Vary": "query=title|tag",
        // Netlify defaults this route to immutable+1yr with no explicit Cache-Control set.
        // Given the above bug already proved this route can serve wrong content under a
        // given cache key, a shorter, non-immutable window limits how long any future
        // mistake stays stuck rather than locking it in for a year.
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  )
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const host = request.headers.get("host") || ""
  const proto = request.headers.get("x-forwarded-proto") || ""
  const reqId = request.headers.get("x-nf-request-id") || ""

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'redirect-pre',hypothesisId:'H1',location:'middleware.ts:10',message:'middleware_request',data:{pathname,host,proto,reqId},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const response = NextResponse.next()
  response.headers.set("x-debug-mw-path", pathname)
  response.headers.set("x-debug-mw-proto", proto || "unknown")
  return response
}

export const config = {
  matcher: ["/:path*"],
}

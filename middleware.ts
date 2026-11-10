import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (path === "/index.html") {
    return new NextResponse("Not Found", { status: 404 })
  }
  // Removed unfinished landing pages: 410 Gone so Google drops them quickly
  if (/^\/(?:[a-z]{2}\/)?landing\/(?:audit-crm|implementation-crm|support-crm|custom-development|project-management|industry-solutions)\/?$/.test(path)) {
    return new NextResponse("Gone", { status: 410 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/:path*"],
}

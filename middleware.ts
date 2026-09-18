import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/index.html") {
    return new NextResponse("Not Found", { status: 404 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/:path*"],
}

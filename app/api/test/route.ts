import { NextResponse } from "next/server"

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H4',location:'app/api/test/route.ts:4',message:'test_route_blocked_prod',data:{env:process.env.NODE_ENV},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ message: "API працює" })
}

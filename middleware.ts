import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  const publicPaths = ["/login", "/register"]
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isAuthenticated && isPublic) {
    return NextResponse.redirect(new URL("/practice", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

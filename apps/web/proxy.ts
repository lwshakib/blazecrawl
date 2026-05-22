import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "./lib/auth"

/**
 * Navigation proxy logic representing routing boundaries between
 * public pages, authentication interfaces, and private dashboards.
 */
export async function proxyMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if we are authenticated
  const session = await getSession(request.cookies)
  const isAuthenticated = !!session

  const isAuthPage = pathname === "/login"
  const isLandingPage = pathname === "/"

  // Allow Next.js internals, public api routes, and static assets to pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // 1. Redirect unauthenticated users away from protected routes to login
  if (!isAuthenticated && !isLandingPage && !isAuthPage) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Redirect authenticated users away from login to overview
  if (isAuthenticated && isAuthPage) {
    const overviewUrl = new URL("/overview", request.url)
    return NextResponse.redirect(overviewUrl)
  }

  return NextResponse.next()
}

export default proxyMiddleware

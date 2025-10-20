import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/student(.*)",
]);

export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = auth();
  const path = req.nextUrl.pathname;

  // Allow homepage, API routes, post-auth route
  if (path === "/" || path.startsWith("/api") || path.startsWith("/post-auth")) {
    return NextResponse.next();
  }

  // Require authentication for protected routes
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/", req.url)); // redirect to home (modal login)
  }

  // Role-based redirect logic
  if (userId && isProtectedRoute(req)) {
    const role =
      sessionClaims?.metadata?.role ||
      sessionClaims?.publicMetadata?.role ||
      "student";

    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/student", req.url));
    }

    if (path.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"], // exclude static files and assets
};

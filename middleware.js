import { clerkMiddleware, getAuth, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ✅ Define which routes are protected
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/student(.*)",
  "/api/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = getAuth(req);

  // 1️⃣ Protect basic authentication
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // 2️⃣ Role-based control (authorization)
  if (userId && isProtectedRoute(req)) {
    const role = sessionClaims?.metadata?.role || "student";
    const path = req.nextUrl.pathname;

    // If a student tries to access admin pages
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/student", req.url));
    }

    // If an admin tries to access student pages
    if (path.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // 3️⃣ Default allow
  return NextResponse.next();
});

export const config = {
  matcher: [
    // ✅ Apply to all pages except static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

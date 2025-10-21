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

  // 1️⃣ Block unauthenticated access
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // 2️⃣ Role-based protection
  if (userId && isProtectedRoute(req)) {
    const role =
      sessionClaims?.role ||
      sessionClaims?.publicMetadata?.role ||
      sessionClaims?.metadata?.role ||
      "student";

    const path = req.nextUrl.pathname;

    // Block student from admin
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/student", req.url));
    }

    // Block admin from student
    if (path.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // 3️⃣ Allow valid access
  return NextResponse.next();
});

export const config = {
  matcher: [
    // apply to all except static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

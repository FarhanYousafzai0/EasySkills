import { clerkMiddleware, getAuth, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/student(.*)",
  "/api/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = getAuth(req);

  // Protect unauthenticated users
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Role-based routing
  if (userId && isProtectedRoute(req)) {
    // Try both possible Clerk fields
    const role =
      sessionClaims?.metadata?.role ||
      sessionClaims?.publicMetadata?.role ||
      "student";

    const path = req.nextUrl.pathname;
console.log("➡️ Clerk Session Claims:", JSON.stringify(sessionClaims, null, 2));

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
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

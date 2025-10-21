import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/student(.*)",
  "/api/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = auth; // ✅ correct way

  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (userId && isProtectedRoute(req)) {
    const role =
      sessionClaims?.role ||
      sessionClaims?.publicMetadata?.role ||
      sessionClaims?.metadata?.role ||
      "student";

    const path = req.nextUrl.pathname;

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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

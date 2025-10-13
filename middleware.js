import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// ✅ Define protected routes
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/student(.*)",
  "/api/(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    // Protect these routes — redirect unauthenticated users to Clerk sign-in
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

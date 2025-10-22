"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function PostAuth() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    const role = user?.publicMetadata?.role || "student";
    if (role === "admin") router.replace("/admin");
    else router.replace("/student");
  }, [user, isLoaded, router]);

  return (
    <div className="min-h-screen grid place-items-center text-lg">
      Redirecting to your Home…
    </div>
  );
}

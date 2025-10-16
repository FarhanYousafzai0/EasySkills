'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostAuth() {
  const router = useRouter();

  useEffect(() => {
    const syncUser = async () => {
      await fetch("/api/sync-user", { method: "POST" });
      router.push("/");
    };
    syncUser();
  }, [router]);

  return <p className="text-center mt-10">Syncing your account...</p>;
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PostAuth() {
  const router = useRouter();
  const [message, setMessage] = useState("Syncing your account...");

  useEffect(() => {
    const syncUser = async () => {
      try {
        const res = await fetch("/api/sync-user", { method: "POST" });
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Login blocked. Please try again later.");
          return;
        }

        setMessage("Redirecting to your dashboard...");
        router.push(data.role === "admin" ? "/admin" : "/student");
      } catch (err) {
        console.error("Sync error:", err);
        setMessage("Something went wrong.");
      }
    };

    syncUser();
  }, [router]);

  return <p className="text-center mt-10">{message}</p>;
}

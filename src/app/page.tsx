"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

// home redirects based on logged in status
// redirects to sign in page if not logged in
// redirects to dashboard if logged in
export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // only check URL params on client side
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          if (params.get("welcome") === "true") {
            router.push("/dashboard?welcome=true");
            return;
          }
        }
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  return null;
}

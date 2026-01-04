"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

// home redirects based on logged in status
// redirects to sign in page if not logged in
// redirects to dashboard if logged in
export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome");

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (welcome === "true") {
          router.push("/dashboard?welcome=true");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, welcome, router]);

  return null;
}

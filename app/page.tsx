"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_APP_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8080`
    : "http://localhost:8080");

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch(`${API_BASE}/admin/setup/status`);
        if (res.ok) {
          const { self_hosted, needs_setup } = await res.json();
          if (self_hosted && needs_setup) {
            router.replace("/setup");
            return;
          }
        }
      } catch {
        // Backend unreachable — fall through to login
      }
      router.replace("/dashboard");
    }

    checkSetup();
  }, [router]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadProfile } from "@/lib/storage";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const profile = loadProfile();
    if (!profile) {
      router.replace("/onboarding");
      return;
    }
    if (!profile.seenHowItWorks) {
      router.replace("/how-it-works");
      return;
    }
    router.replace("/home");
  }, [router]);

  return <div className="screen-loading" />;
}

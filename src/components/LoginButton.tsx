"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setIsLoading(true);
        void signIn("twitter", { callbackUrl: "/" });
      }}
      disabled={isLoading}
      className="inline-flex min-h-11 items-center justify-center rounded-md bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? "Membuka X..." : "Login with X"}
    </button>
  );
}

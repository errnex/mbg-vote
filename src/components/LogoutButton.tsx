"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setIsLoading(true);
        void signOut({ callbackUrl: "/" });
      }}
      disabled={isLoading}
      className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? "Keluar..." : "Logout"}
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { SessionXUser, VoteChoice } from "@/lib/types";
import { voteChoiceLabel } from "@/lib/types";

type VoteCardProps = {
  user: SessionXUser;
  currentVote: VoteChoice | null;
};

type VoteResponse = {
  message?: string;
  voteChoice?: VoteChoice | null;
};

const defaultProfileImage =
  "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function VoteCard({ user, currentVote }: VoteCardProps) {
  const router = useRouter();
  const [loadingChoice, setLoadingChoice] = useState<VoteChoice | null>(null);
  const [hasVoted, setHasVoted] = useState(Boolean(currentVote));
  const [storedChoice, setStoredChoice] = useState<VoteChoice | null>(
    currentVote
  );
  const [message, setMessage] = useState<string | null>(
    currentVote ? "Kamu sudah voting." : null
  );

  useEffect(() => {
    setHasVoted(Boolean(currentVote));
    setStoredChoice(currentVote);
    setMessage(currentVote ? "Kamu sudah voting." : null);
  }, [currentVote]);

  async function submitVote(voteChoice: VoteChoice) {
    setLoadingChoice(voteChoice);
    setMessage(null);

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ voteChoice })
      });
      const data = (await response.json().catch(() => ({}))) as VoteResponse;

      if (response.ok || response.status === 409) {
        setHasVoted(true);
        setStoredChoice(data.voteChoice ?? voteChoice);
        setMessage(data.message ?? "Kamu sudah voting.");
        window.dispatchEvent(new Event("vote-submitted"));
        router.refresh();
        return;
      }

      setMessage(data.message ?? "Gagal menyimpan vote.");
    } finally {
      setLoadingChoice(null);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Image
            src={user.profileImageUrl ?? defaultProfileImage}
            alt={user.displayName}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-full border border-slate-200 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-950">
              {user.displayName}
            </p>
            <p className="truncate text-sm text-slate-500">@{user.username}</p>
            <p className="mt-1 text-xs text-slate-400">
              Akun dibuat {formatDate(user.xCreatedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Voting publik
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
          Apakah kalian setuju dengan MBG?
        </h1>
      </div>

      <div className="mt-8">
        {hasVoted ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4 text-center">
            <p className="font-semibold text-slate-950">Kamu sudah voting.</p>
            {storedChoice ? (
              <p className="mt-1 text-sm text-slate-600">
                Pilihan kamu: {voteChoiceLabel(storedChoice)}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void submitVote("agree")}
              disabled={Boolean(loadingChoice)}
              className="min-h-12 rounded-md bg-emerald-600 px-5 py-3 text-base font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingChoice === "agree" ? "Menyimpan..." : "Setuju"}
            </button>
            <button
              type="button"
              onClick={() => void submitVote("disagree")}
              disabled={Boolean(loadingChoice)}
              className="min-h-12 rounded-md bg-red-600 px-5 py-3 text-base font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingChoice === "disagree" ? "Menyimpan..." : "Tidak Setuju"}
            </button>
          </div>
        )}

        {message && !hasVoted ? (
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}

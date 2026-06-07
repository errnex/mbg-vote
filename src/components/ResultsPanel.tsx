"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { VotingSnapshot } from "@/lib/types";
import { voteChoiceLabel } from "@/lib/types";

type ResultsPanelProps = {
  initialSnapshot: VotingSnapshot;
};

const defaultProfileImage =
  "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";

function formatPercent(value: number) {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function ResultsPanel({ initialSnapshot }: ResultsPanelProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => new Date());

  const refreshResults = useCallback(async () => {
    const response = await fetch("/api/results", {
      cache: "no-store"
    });

    if (!response.ok) {
      return;
    }

    const nextSnapshot = (await response.json()) as VotingSnapshot;
    setSnapshot(nextSnapshot);
    setLastUpdatedAt(new Date());
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshResults();
    }, 5000);

    const onVoteSubmitted = () => {
      void refreshResults();
    };

    window.addEventListener("vote-submitted", onVoteSubmitted);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("vote-submitted", onVoteSubmitted);
    };
  }, [refreshResults]);

  const { stats, voters } = snapshot;

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Hasil Voting</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update otomatis setiap beberapa detik.
          </p>
        </div>
        <p className="text-xs text-slate-400">
          Terakhir update {formatDateTime(lastUpdatedAt.toISOString())}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">Setuju</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {stats.agree}
          </p>
          <p className="text-sm text-emerald-700">
            {formatPercent(stats.agreePercentage)}
          </p>
        </div>
        <div className="rounded-md border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Tidak Setuju</p>
          <p className="mt-2 text-3xl font-bold text-red-700">
            {stats.disagree}
          </p>
          <p className="text-sm text-red-700">
            {formatPercent(stats.disagreePercentage)}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Total Voter</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stats.total}
          </p>
          <p className="text-sm text-slate-500">akun X unik</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Setuju</span>
            <span className="text-slate-500">
              {formatPercent(stats.agreePercentage)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${stats.agreePercentage}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Tidak Setuju</span>
            <span className="text-slate-500">
              {formatPercent(stats.disagreePercentage)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-red-600 transition-all"
              style={{ width: `${stats.disagreePercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-slate-950">Record Voter</h3>

        {voters.length === 0 ? (
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Belum ada voter.
          </div>
        ) : (
          <>
            <div className="mt-4 hidden overflow-hidden rounded-md border border-slate-200 md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Vote</th>
                    <th className="px-4 py-3 font-semibold">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {voters.map((voter) => (
                    <tr key={voter.xUserId} className="bg-white">
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Image
                            src={voter.profileImageUrl ?? defaultProfileImage}
                            alt={voter.displayName}
                            width={40}
                            height={40}
                            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-950">
                              {voter.displayName}
                            </p>
                            <p className="truncate text-slate-500">
                              @{voter.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            voter.voteChoice === "agree"
                              ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                              : "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                          }
                        >
                          {voteChoiceLabel(voter.voteChoice)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDateTime(voter.votedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-3 md:hidden">
              {voters.map((voter) => (
                <div
                  key={voter.xUserId}
                  className="rounded-md border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={voter.profileImageUrl ?? defaultProfileImage}
                      alt={voter.displayName}
                      width={44}
                      height={44}
                      className="h-11 w-11 shrink-0 rounded-full border border-slate-200 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">
                        {voter.displayName}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        @{voter.username}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span
                      className={
                        voter.voteChoice === "agree"
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                          : "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                      }
                    >
                      {voteChoiceLabel(voter.voteChoice)}
                    </span>
                    <span className="text-right text-xs text-slate-500">
                      {formatDateTime(voter.votedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

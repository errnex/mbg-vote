import { unstable_noStore as noStore } from "next/cache";
import { LoginButton } from "@/components/LoginButton";
import { LogoutButton } from "@/components/LogoutButton";
import { ResultsPanel } from "@/components/ResultsPanel";
import { VoteCard } from "@/components/VoteCard";
import { getVoteByXUserId, getVotingSnapshot } from "@/lib/db";
import { getServerAuthSession } from "@/lib/session";
import type { SessionXUser } from "@/lib/types";
import { isXAccountOldEnough } from "@/lib/x-account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function LoginView() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Voting publik
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Voting MBG</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Login menggunakan akun X untuk memberikan satu vote.
        </p>
        <div className="mt-6">
          <LoginButton />
        </div>
      </section>
    </main>
  );
}

function NotEligibleInline() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          Login ditolak
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">
          Akun X kamu belum memenuhi syarat minimum usia akun 1 bulan.
        </h1>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}

export default async function HomePage() {
  noStore();

  const session = await getServerAuthSession();
  const sessionUser = session?.user;

  if (!sessionUser?.xUserId) {
    return <LoginView />;
  }

  const user: SessionXUser = {
    xUserId: sessionUser.xUserId,
    username: sessionUser.username,
    displayName: sessionUser.displayName,
    profileImageUrl: sessionUser.profileImageUrl,
    xCreatedAt: sessionUser.xCreatedAt
  };

  if (!isXAccountOldEnough(user.xCreatedAt)) {
    return <NotEligibleInline />;
  }

  const [currentVote, snapshot] = await Promise.all([
    getVoteByXUserId(user.xUserId),
    getVotingSnapshot()
  ]);

  return (
    <main className="min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-4 flex justify-end">
          <LogoutButton />
        </div>
        <VoteCard user={user} currentVote={currentVote?.voteChoice ?? null} />
        <ResultsPanel initialSnapshot={snapshot} />
      </div>
    </main>
  );
}

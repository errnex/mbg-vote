import "server-only";

import { Pool, type QueryResultRow } from "pg";
import type {
  SessionXUser,
  VoteChoice,
  VoterRecord,
  VotingSnapshot
} from "@/lib/types";

type GlobalWithPg = typeof globalThis & {
  pgPool?: Pool;
};

const globalForPg = globalThis as GlobalWithPg;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diatur.");
  }

  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_SSL === "false"
          ? false
          : {
              rejectUnauthorized: false
            },
      max: 5
    });
  }

  return globalForPg.pgPool;
}

async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  return getPool().query<T>(text, params);
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export async function upsertUser(user: SessionXUser) {
  await query(
    `
      insert into public.users (
        x_user_id,
        username,
        display_name,
        profile_image_url,
        x_created_at
      )
      values ($1, $2, $3, $4, $5)
      on conflict (x_user_id)
      do update set
        username = excluded.username,
        display_name = excluded.display_name,
        profile_image_url = excluded.profile_image_url,
        x_created_at = excluded.x_created_at
    `,
    [
      user.xUserId,
      user.username,
      user.displayName,
      user.profileImageUrl,
      user.xCreatedAt
    ]
  );
}

type StoredUserRow = {
  x_user_id: string;
  username: string;
  display_name: string;
  profile_image_url: string | null;
  x_created_at: Date | string;
};

export async function getUserByXUserId(xUserId: string) {
  const result = await query<StoredUserRow>(
    `
      select
        x_user_id,
        username,
        display_name,
        profile_image_url,
        x_created_at
      from public.users
      where x_user_id = $1
      limit 1
    `,
    [xUserId]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    xUserId: row.x_user_id,
    username: row.username,
    displayName: row.display_name,
    profileImageUrl: row.profile_image_url,
    xCreatedAt: toIsoString(row.x_created_at)
  };
}

type VoteRow = {
  vote_choice: VoteChoice;
  created_at: Date | string;
};

export async function getVoteByXUserId(xUserId: string) {
  const result = await query<VoteRow>(
    `
      select vote_choice, created_at
      from public.votes
      where x_user_id = $1
      limit 1
    `,
    [xUserId]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    voteChoice: row.vote_choice,
    votedAt: toIsoString(row.created_at)
  };
}

export async function createVote(xUserId: string, voteChoice: VoteChoice) {
  await query(
    `
      insert into public.votes (x_user_id, vote_choice)
      values ($1, $2)
    `,
    [xUserId, voteChoice]
  );
}

type CountRow = {
  vote_choice: VoteChoice;
  count: string;
};

type VoterRow = {
  x_user_id: string;
  username: string;
  display_name: string;
  profile_image_url: string | null;
  vote_choice: VoteChoice;
  voted_at: Date | string;
};

export async function getVotingSnapshot(): Promise<VotingSnapshot> {
  const [countsResult, votersResult] = await Promise.all([
    query<CountRow>(
      `
        select vote_choice, count(*)::text as count
        from public.votes
        group by vote_choice
      `
    ),
    query<VoterRow>(
      `
        select
          users.x_user_id,
          users.username,
          users.display_name,
          users.profile_image_url,
          votes.vote_choice,
          votes.created_at as voted_at
        from public.votes
        inner join public.users on users.x_user_id = votes.x_user_id
        order by votes.created_at desc
      `
    )
  ]);

  const agree =
    Number(
      countsResult.rows.find((row) => row.vote_choice === "agree")?.count ?? 0
    ) || 0;
  const disagree =
    Number(
      countsResult.rows.find((row) => row.vote_choice === "disagree")?.count ??
        0
    ) || 0;
  const total = agree + disagree;

  const voters: VoterRecord[] = votersResult.rows.map((row) => ({
    xUserId: row.x_user_id,
    username: row.username,
    displayName: row.display_name,
    profileImageUrl: row.profile_image_url,
    voteChoice: row.vote_choice,
    votedAt: toIsoString(row.voted_at)
  }));

  return {
    stats: {
      agree,
      disagree,
      total,
      agreePercentage: total === 0 ? 0 : Number(((agree / total) * 100).toFixed(1)),
      disagreePercentage:
        total === 0 ? 0 : Number(((disagree / total) * 100).toFixed(1))
    },
    voters
  };
}

export function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

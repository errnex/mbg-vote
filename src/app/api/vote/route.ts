import { NextResponse } from "next/server";
import {
  createVote,
  getUserByXUserId,
  getVoteByXUserId,
  isUniqueViolation
} from "@/lib/db";
import { getServerAuthSession } from "@/lib/session";
import { isVoteChoice } from "@/lib/types";
import { isXAccountOldEnough } from "@/lib/x-account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  const xUserId = session?.user?.xUserId;

  if (!xUserId) {
    return NextResponse.json(
      {
        message: "Silakan login dengan X terlebih dahulu."
      },
      {
        status: 401
      }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    voteChoice?: unknown;
  } | null;

  if (!isVoteChoice(body?.voteChoice)) {
    return NextResponse.json(
      {
        message: "Pilihan vote tidak valid."
      },
      {
        status: 400
      }
    );
  }

  const dbUser = await getUserByXUserId(xUserId);

  if (!dbUser || !isXAccountOldEnough(dbUser.xCreatedAt)) {
    return NextResponse.json(
      {
        message: "Akun X kamu belum memenuhi syarat minimum usia akun 1 bulan."
      },
      {
        status: 403
      }
    );
  }

  const existingVote = await getVoteByXUserId(xUserId);

  if (existingVote) {
    return NextResponse.json(
      {
        message: "Kamu sudah voting.",
        voteChoice: existingVote.voteChoice
      },
      {
        status: 409
      }
    );
  }

  try {
    await createVote(xUserId, body.voteChoice);

    return NextResponse.json(
      {
        message: "Vote berhasil disimpan.",
        voteChoice: body.voteChoice
      },
      {
        status: 201
      }
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      const vote = await getVoteByXUserId(xUserId);

      return NextResponse.json(
        {
          message: "Kamu sudah voting.",
          voteChoice: vote?.voteChoice ?? null
        },
        {
          status: 409
        }
      );
    }

    console.error(error);

    return NextResponse.json(
      {
        message: "Gagal menyimpan vote."
      },
      {
        status: 500
      }
    );
  }
}

import { NextResponse } from "next/server";
import { getVotingSnapshot } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getVotingSnapshot();

    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Gagal mengambil hasil voting."
      },
      {
        status: 500
      }
    );
  }
}

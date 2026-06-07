export type VoteChoice = "agree" | "disagree";

export type SessionXUser = {
  xUserId: string;
  username: string;
  displayName: string;
  profileImageUrl: string | null;
  xCreatedAt: string;
};

export type VotingStats = {
  agree: number;
  disagree: number;
  total: number;
  agreePercentage: number;
  disagreePercentage: number;
};

export type VoterRecord = {
  xUserId: string;
  username: string;
  displayName: string;
  profileImageUrl: string | null;
  voteChoice: VoteChoice;
  votedAt: string;
};

export type VotingSnapshot = {
  stats: VotingStats;
  voters: VoterRecord[];
};

export function isVoteChoice(value: unknown): value is VoteChoice {
  return value === "agree" || value === "disagree";
}

export function voteChoiceLabel(choice: VoteChoice) {
  return choice === "agree" ? "Setuju" : "Tidak Setuju";
}

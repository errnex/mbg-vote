import type { DefaultSession } from "next-auth";
import type { SessionXUser } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & SessionXUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends SessionXUser {}
}

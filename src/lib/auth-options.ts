import type { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { upsertUser } from "@/lib/db";
import { extractXProfile, isXAccountOldEnough } from "@/lib/x-account";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  providers: [
    TwitterProvider({
      clientId: process.env.X_CLIENT_ID ?? "",
      clientSecret: process.env.X_CLIENT_SECRET ?? "",
      version: "2.0",
      authorization: {
        params: {
          scope: "users.read tweet.read"
        }
      },
      userinfo: {
        url: "https://api.x.com/2/users/me",
        params: {
          "user.fields": "created_at,profile_image_url"
        }
      },
      profile(profile) {
        const xProfile = extractXProfile(profile);

        return {
          id: xProfile?.xUserId ?? "",
          name: xProfile?.displayName ?? "",
          email: null,
          image: xProfile?.profileImageUrl ?? null
        };
      }
    })
  ],
  pages: {
    signIn: "/",
    error: "/"
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "twitter") {
        return false;
      }

      const xProfile = extractXProfile(profile);

      if (!xProfile || !isXAccountOldEnough(xProfile.xCreatedAt)) {
        return "/not-eligible";
      }

      await upsertUser(xProfile);
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "twitter" && profile) {
        const xProfile = extractXProfile(profile);

        if (xProfile) {
          token.xUserId = xProfile.xUserId;
          token.username = xProfile.username;
          token.displayName = xProfile.displayName;
          token.profileImageUrl = xProfile.profileImageUrl;
          token.xCreatedAt = xProfile.xCreatedAt;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.xUserId = token.xUserId;
        session.user.username = token.username;
        session.user.displayName = token.displayName;
        session.user.profileImageUrl = token.profileImageUrl;
        session.user.xCreatedAt = token.xCreatedAt;
      }

      return session;
    }
  }
};

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voting MBG",
  description: "Website voting publik dengan login X/Twitter."
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

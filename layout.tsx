import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SangamGPT | Your Ideas, Our Intelligence",
  description: "Chat, create, learn and explore with SangamGPT AI."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

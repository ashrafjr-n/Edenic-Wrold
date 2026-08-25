import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import { Header } from "@/components/layout/header";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Edenic World",
  description: "Edenic World — a learning site for kids.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fredoka.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}

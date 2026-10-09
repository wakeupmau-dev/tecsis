import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "tecsis",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={rubik.variable}>
      <body>{children}</body>
    </html>
  );
}

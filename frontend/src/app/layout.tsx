import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "tecsis",
  icons: {
    icon: "https://res.cloudinary.com/maulight/image/upload/c_fill,h_64,w_64/f_png/v1792126531/site/favicon",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={rubik.variable}>
      <body>
        <main className="min-h-screen flex justify-center bg-bg-light pt-5 pb-20">
          <div className="w-full max-w-280 flex flex-col gap-y-5 sm:px-5 min-[70rem]:px-0">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

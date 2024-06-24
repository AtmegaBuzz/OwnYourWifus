"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import Side from "./Components/Side";
import Navbar from "./Components/Navbar";
import Spinner from "./Components/Spinner";
import { useAtom } from "jotai";
import { loadingAtom } from "@/atoms/global";


// Font configuration should be at the top
const inter = Inter({ subsets: ["latin"] });

// Single definition of RootLayout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [loading,_] = useAtom(loadingAtom);


  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        {
          loading && <Spinner/>
        }
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
            <Side />
            <Navbar />
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

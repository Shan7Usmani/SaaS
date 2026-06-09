import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/providers/auth-provider"
import { QueryProvider } from "@/providers/query-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata = {
  title: "PLACEMENTOS — AI PLACEMENT COACH",
  description:
    "Take your placement preparation from 'I don't know where to start' to 'I'm interview-ready for top companies.'",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        "dark"
      )}
    >
      <body>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster />

        {/* Global footer name tag — sits below every page's content */}
        <footer className="border-t border-primary/10">
          <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3 sm:px-6">
            <span className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-500 hover:bg-primary/5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="bg-gradient-to-r from-primary via-cyan-300 to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient-shift_3s_ease_infinite] font-semibold tracking-wide">
                Crafted by Shan Usmani
              </span>
              <span className="ml-1 opacity-0 transition-all duration-300 group-hover:opacity-100">✦</span>
            </span>
          </div>
        </footer>
      </body>
    </html>
  )
}

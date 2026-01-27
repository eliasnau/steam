"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { queryClient } from "@/utils/orpc";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { usePathname } from "next/navigation";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const darkPages = ['/games']
  const isDarkPage = darkPages.some(path => pathname.startsWith(path)) || pathname == "/"
  const forcedTheme = isDarkPage ? 'dark' : undefined
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange forcedTheme={forcedTheme}>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>{children}</NuqsAdapter>
        <ReactQueryDevtools />
      </QueryClientProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}

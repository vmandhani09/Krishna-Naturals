"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LocalUserProvider } from "@/components/LocalUserProvider"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if current path is admin route
  const isAdminRoute = pathname.startsWith('/admin')
  
  if (isAdminRoute) {
    // Admin routes: no header/footer, full height
    return <div className="min-h-screen">{children}</div>
  }
  
  // User routes: with header/footer
  return (
    <div className="min-h-screen flex flex-col">
      <LocalUserProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      </LocalUserProvider>
    </div>
  )
}

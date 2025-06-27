
import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { ConditionalLayout } from "@/components/layout/conditional-layout"
import { Toaster } from "react-hot-toast";

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Krishna Naturals - Premium Dry Fruits & Spices",
  description:
    "Premium quality dry fruits, nuts, seeds, and spices sourced from the finest farms. Shop now for nature's goodness.",
  keywords: "dry fruits, nuts, seeds, spices, organic, premium, healthy",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-50 text-stone-900`}>

          <ConditionalLayout>{children}</ConditionalLayout>

   
      </body>
    </html>
  )
}

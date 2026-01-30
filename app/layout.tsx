import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Tempo – Le Loft | Studio Yoga & Pilates Paris Marais",
  description: "Studio de yoga et pilates dans le Marais. Your pace. Your tempo. Cours de Vinyasa, Hatha, Pilates Mat et Reformer.",
  keywords: ["yoga", "pilates", "paris", "marais", "studio", "vinyasa", "reformer"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

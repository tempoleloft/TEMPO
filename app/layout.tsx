import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Tempo – Le Loft | Studio Yoga & Pilates Paris Marais",
  description: "Studio de yoga et pilates dans le Marais. Your pace. Your tempo. Cours de Vinyasa, Hatha, Pilates Mat et Barre au Sol.",
  keywords: ["yoga", "pilates", "paris", "marais", "studio", "vinyasa", "barre au sol"],
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tempo",
  },
}

export const viewport: Viewport = {
  themeColor: "#42101B",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}

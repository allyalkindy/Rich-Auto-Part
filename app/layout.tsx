import type { Metadata } from 'next'
import { Inter, Poppins, Montserrat, Roboto_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({ weight: ['600','700','800'], subsets: ['latin'], variable: '--font-poppins' })
const montserrat = Montserrat({ weight: ['700','800'], subsets: ['latin'], variable: '--font-montserrat' })
const robotoMono = Roboto_Mono({ weight: ['400','500','600','700'], subsets: ['latin'], variable: '--font-roboto-mono' })

export const metadata: Metadata = {
  title: 'Rich Auto Parts - Car Spare Parts Inventory',
  description: 'Complete inventory and sales tracking system for car spare parts shops',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${montserrat.variable} ${robotoMono.variable}`}>
      <body className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

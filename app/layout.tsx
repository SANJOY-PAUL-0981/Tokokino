import {
  Geist,
  Geist_Mono,
  Inter,
  Poppins,
  Playfair_Display,
  Roboto,
  Space_Grotesk,
  Outfit,
  Caveat,
  Fira_Code,
  Lora,
  Nunito,
  Raleway,
  Oswald,
  Dancing_Script,
} from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const fontInter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const fontPoppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-poppins" })
const fontPlayfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const fontRoboto = Roboto({ subsets: ["latin"], variable: "--font-roboto" })
const fontSpaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })
const fontOutfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })
const fontCaveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" })
const fontFiraCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira-code" })
const fontLora = Lora({ subsets: ["latin"], variable: "--font-lora" })
const fontNunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })
const fontRaleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" })
const fontOswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" })
const fontDancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script" })

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
        fontSans.variable,
        fontMono.variable,
        fontInter.variable,
        fontPoppins.variable,
        fontPlayfair.variable,
        fontRoboto.variable,
        fontSpaceGrotesk.variable,
        fontOutfit.variable,
        fontCaveat.variable,
        fontFiraCode.variable,
        fontLora.variable,
        fontNunito.variable,
        fontRaleway.variable,
        fontOswald.variable,
        fontDancingScript.variable,
        "font-sans"
      )}
    >
      <body>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

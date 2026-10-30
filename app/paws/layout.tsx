import { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Serif } from "next/font/google";

import { COPY } from "@/lib/paws/copy";
import { RISO, RISO_CSS_VARIABLES } from "@/lib/paws/riso-inks";
import { cn } from "@/lib/utils";

const fontDisplay = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--pw-font-display",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--pw-font-mono",
});

export const metadata: Metadata = {
  title: COPY.site.title,
  description: COPY.site.description,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: RISO.paper,
  colorScheme: "light",
};

type PawsLayoutProps = {
  children: React.ReactNode;
};

export default function PawsLayout(props: PawsLayoutProps) {
  return (
    <div
      style={RISO_CSS_VARIABLES}
      className={cn(
        "fixed inset-0 z-[100] overflow-hidden antialiased",
        "bg-[var(--pw-paper)] font-[family-name:var(--pw-font-mono)] text-[var(--pw-ink)]",
        fontDisplay.variable,
        fontMono.variable
      )}
    >
      {props.children}
    </div>
  );
}

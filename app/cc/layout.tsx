import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Metadata, Viewport } from "next";

import { CC_ORIGIN } from "@/lib/cc/cc-hosts";
import { cn } from "@/lib/utils";

import "./cc-theme.css";

export const metadata: Metadata = {
  metadataBase: new URL(CC_ORIGIN),
  title: { default: "CC//", template: "%s · CC//" },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#06080c",
  colorScheme: "dark",
};

type CcLayoutProps = {
  children: React.ReactNode;
};

export default function CcLayout(props: CcLayoutProps) {
  return (
    <div
      className={cn(
        "cc-theme fixed inset-0 z-[100] overflow-auto antialiased",
        "font-[family-name:var(--font-geist-mono)] text-[13px]",
        "[--cc-font-display:var(--font-geist-sans)]",
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      {props.children}
    </div>
  );
}

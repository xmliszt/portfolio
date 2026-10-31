import { LAUNDROMAT_ORIGIN, PORTFOLIO_HOSTNAMES } from "@/lib/laundromat/hosts";
import { PAWS_ORIGIN } from "@/lib/paws/paws-hosts";

const PORTFOLIO_ORIGIN = `https://${PORTFOLIO_HOSTNAMES[0]}`;

export const SIBLING_APPS = [
  {
    id: "paws",
    name: "Paws",
    href: PAWS_ORIGIN,
    icon: { light: "/apps/paws-icon.svg", dark: "/apps/paws-icon.svg" },
  },
  {
    id: "laundromat",
    name: "laundro.cafe",
    href: LAUNDROMAT_ORIGIN,
    icon: {
      light: "/apps/laundro-cafe-icon.svg",
      dark: "/apps/laundro-cafe-icon.svg",
    },
  },
  {
    id: "joodle",
    name: "Joodle",
    href: `${PORTFOLIO_ORIGIN}/apps/joodle`,
    icon: {
      light: "https://joodle.liyuxuan.dev/socials/Joodle%20Icon%20Light.jpg",
      dark: "https://joodle.liyuxuan.dev/socials/Joodle%20Icon%20Dark.jpg",
    },
  },
  {
    id: "taboo-ai",
    name: "Taboo AI",
    href: "https://taboo-ai.com",
    icon: { light: "/apps/taboo-ai-icon.png", dark: "/apps/taboo-ai-icon.png" },
  },
  {
    id: "moire",
    name: "Moiré",
    href: "https://www.moire.day",
    icon: { light: "/apps/moire-icon.svg", dark: "/apps/moire-icon.svg" },
  },
] as const;

export type SiblingAppId = (typeof SIBLING_APPS)[number]["id"];

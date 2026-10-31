import { LAUNDROMAT_ORIGIN, PORTFOLIO_HOSTNAMES } from "@/lib/laundromat/hosts";
import { PAWS_ORIGIN } from "@/lib/paws/paws-hosts";

const PORTFOLIO_ORIGIN = `https://${PORTFOLIO_HOSTNAMES[0]}`;

export const SIBLING_APPS = [
  {
    id: "paws",
    name: "Paws",
    href: PAWS_ORIGIN,
    iconSrc: "/apps/paws-icon.svg",
  },
  {
    id: "laundromat",
    name: "laundro.cafe",
    href: LAUNDROMAT_ORIGIN,
    iconSrc: "/apps/laundro-cafe-icon.svg",
  },
  {
    id: "joodle",
    name: "Joodle",
    href: `${PORTFOLIO_ORIGIN}/apps/joodle`,
    iconSrc: "https://joodle.liyuxuan.dev/socials/Joodle%20Icon%20Light.jpg",
  },
  {
    id: "taboo-ai",
    name: "Taboo AI",
    href: "https://taboo-ai.com",
    iconSrc: "/apps/taboo-ai-icon.png",
  },
  {
    id: "moire",
    name: "Moiré",
    href: "https://www.moire.day",
    iconSrc: "/apps/moire-icon.svg",
  },
] as const;

export type SiblingAppId = (typeof SIBLING_APPS)[number]["id"];

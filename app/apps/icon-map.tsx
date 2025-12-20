import {
  ArrowSquareOut,
  ChatCircleDots,
  DiscordLogo,
  Envelope,
  Fan,
  Storefront,
  TwitterLogo,
} from "@phosphor-icons/react/dist/ssr";

import type { IconName } from "./data";

export const ICON_MAP: Record<
  IconName,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Storefront,
  ArrowSquareOut,
  ChatCircleDots,
  DiscordLogo,
  TwitterLogo,
  Envelope,
  TestFlight: Fan,
};

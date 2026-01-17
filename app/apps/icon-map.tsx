import {
  ArrowSquareOut,
  ChatCircleDots,
  Envelope,
  Fan,
  Storefront,
  TwitterLogo,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";

import type { IconName } from "./data";

export const ICON_MAP: Record<
  IconName,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Storefront,
  ArrowSquareOut,
  ChatCircleDots,
  WhatsappLogo,
  TwitterLogo,
  Envelope,
  TestFlight: Fan,
};

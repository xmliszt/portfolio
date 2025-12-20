import {
  ArrowSquareOut,
  ChatCircleDots,
  DiscordLogo,
  Envelope,
  Storefront,
  TwitterLogo,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import type { AppLink, IconName } from "./data";

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
};

type AppLinksProps = {
  title: string;
  links: AppLink[];
  className?: string;
};

function Badge({ type }: { type: AppLink["badge"] }) {
  if (!type) return null;

  const badgeStyles = {
    pending:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    new: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    featured:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };

  const badgeLabels = {
    pending: "Pending",
    new: "New",
    featured: "Featured",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyles[type]}`}
    >
      {badgeLabels[type]}
    </span>
  );
}

export function AppLinks(props: AppLinksProps) {
  const { title, links, className = "" } = props;

  if (!links || links.length === 0) return null;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-1 gap-3">
        {links.map((link, index) => {
          const Icon = ICON_MAP[link.icon];
          const isExternal =
            link.url.startsWith("http") || link.url.startsWith("mailto");
          const linkProps = isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {};

          return (
            <Link
              key={index}
              href={link.url}
              className="hover:bg-muted/50 group flex items-center justify-between gap-4 rounded-lg border p-4 no-underline transition-colors"
              {...linkProps}
            >
              <div className="flex flex-1 items-center gap-4">
                <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                  <Icon size={20} className="text-muted-foreground" />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{link.label}</span>
                    <Badge type={link.badge} />
                  </div>
                  {link.description && (
                    <p className="text-muted-foreground text-sm">
                      {link.description}
                    </p>
                  )}
                </div>
              </div>
              {isExternal && (
                <ArrowSquareOut
                  size={16}
                  className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

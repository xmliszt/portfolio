import { ClaudeAvatar } from "@/app/laundromat/claude-avatar";
import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { PORTFOLIO_HOSTNAMES } from "@/lib/laundromat/hosts";
import { cn } from "@/lib/utils";

/** Link to the maker's portfolio in a new tab: a riso heart and the credit line. */
export function PortfolioLink() {
  const { copy } = usePawsCopy();
  return (
    <a
      href={`https://${PORTFOLIO_HOSTNAMES[0]}`}
      target="_blank"
      rel="noopener"
      className={cn(
        FOCUS_RING_CLASS,
        "group flex h-10 cursor-pointer items-center gap-x-2 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="size-3.5 shrink-0 fill-transparent stroke-current transition-colors group-hover:fill-[var(--pw-pink)] group-focus-visible:fill-[var(--pw-pink)]"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 10C3.5 8.4 1.5 6.7 1.5 4.5 1.5 3.1 2.6 2 3.9 2c.9 0 1.6.5 2.1 1.2C6.5 2.5 7.2 2 8.1 2c1.3 0 2.4 1.1 2.4 2.5 0 2.2-2 3.9-4.5 5.5Z" />
      </svg>
      <span className="min-w-0 flex-1 truncate">
        {copy.room.builtBy.beforeClaude}
        <ClaudeAvatar />
        {copy.room.builtBy.afterClaude}
      </span>
    </a>
  );
}

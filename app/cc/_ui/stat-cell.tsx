import { cn } from "@/lib/utils";

type StatCellProps = {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  tone?: "default" | "accent" | "ok" | "warn" | "chatgpt";
};

const TONE_CLASS = {
  default: "text-foreground",
  accent: "text-primary",
  ok: "text-cc-ok",
  warn: "text-cc-warn",
  chatgpt: "text-cc-chatgpt",
} as const;

export function StatCell(props: StatCellProps) {
  return (
    <div className="bg-card flex min-w-0 flex-col gap-y-1.5 px-[18px] py-4">
      <span className="text-muted-foreground text-[11px] tracking-[0.14em]">
        {props.label}
      </span>
      <span
        className={cn(
          "text-[28px] leading-none font-bold tabular-nums",
          TONE_CLASS[props.tone ?? "default"]
        )}
      >
        {props.value}
      </span>
      {props.note !== undefined && (
        <span className="text-muted-foreground text-[11px]">{props.note}</span>
      )}
    </div>
  );
}

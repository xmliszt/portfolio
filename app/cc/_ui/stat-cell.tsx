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
    <div className="bg-card flex min-w-0 flex-col gap-y-1 px-3 py-2">
      <span className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase">
        {props.label}
      </span>
      <span
        className={cn(
          "text-[20px] leading-6 font-semibold tabular-nums",
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

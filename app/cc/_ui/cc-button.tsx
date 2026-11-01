import { cn } from "@/lib/utils";

type CcButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "warn" | "chatgpt" | "ok";
  size?: "md" | "sm";
};

const VARIANT_CLASS = {
  primary:
    "border-primary bg-primary text-primary-foreground hover:bg-primary/85",
  ghost:
    "border-border bg-transparent text-foreground hover:border-primary hover:text-primary",
  warn: "border-cc-warn bg-cc-warn/10 text-cc-warn hover:bg-cc-warn/20",
  chatgpt:
    "border-cc-chatgpt bg-cc-chatgpt/10 text-cc-chatgpt hover:bg-cc-chatgpt/20",
  ok: "border-cc-ok bg-cc-ok/10 text-cc-ok hover:bg-cc-ok/20",
} as const;

export function CcButton(props: CcButtonProps) {
  const { variant = "ghost", size = "md", className, ...buttonProps } = props;
  return (
    <button
      {...buttonProps}
      className={cn(
        "inline-flex items-center justify-center gap-x-2 border font-bold tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2",
        size === "md"
          ? "min-h-11 px-4 text-[12px]"
          : "min-h-8 px-2.5 text-[11px]",
        VARIANT_CLASS[variant],
        className
      )}
    />
  );
}

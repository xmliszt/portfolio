import { cn } from "@/lib/utils";

export type CcButtonSize = "md" | "sm";

type CcButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "chatgpt" | "ok";
  size?: CcButtonSize;
};

const VARIANT_CLASS = {
  primary:
    "border-primary bg-primary text-primary-foreground hover:bg-primary/85",
  ghost:
    "border-border bg-transparent text-cc-text-2 hover:border-primary hover:text-foreground",
  danger:
    "border-border bg-transparent text-cc-danger hover:border-cc-danger hover:bg-cc-danger/10",
  chatgpt:
    "border-border bg-transparent text-cc-chatgpt hover:border-cc-chatgpt hover:bg-cc-chatgpt/10",
  ok: "border-border bg-transparent text-cc-ok hover:border-cc-ok hover:bg-cc-ok/10",
} as const;

export function CcButton(props: CcButtonProps) {
  const { variant = "ghost", size = "md", className, ...buttonProps } = props;
  return (
    <button
      {...buttonProps}
      className={cn(
        "inline-flex items-center justify-center gap-x-1.5 border font-semibold tracking-[0.04em] whitespace-nowrap transition-colors disabled:opacity-50",
        "focus-visible:outline-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1",
        size === "md" ? "h-7 px-2.5 text-[11px]" : "h-6 px-2 text-[10.5px]",
        VARIANT_CLASS[variant],
        className
      )}
    />
  );
}

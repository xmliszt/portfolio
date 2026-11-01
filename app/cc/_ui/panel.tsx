import { cn } from "@/lib/utils";

type PanelProps = {
  title: string;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  glow?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
};

export function Panel(props: PanelProps) {
  return (
    <section
      aria-label={props.title}
      className={cn(
        "bg-card flex min-w-0 flex-col border",
        props.glow &&
          "border-primary shadow-[0_0_24px_hsl(var(--primary)/0.18)]",
        props.className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b px-[18px] py-3.5">
        <h2 className="font-[family-name:var(--cc-font-display)] text-[15px] font-semibold tracking-[0.12em] uppercase">
          {props.title}
        </h2>
        {props.aside !== undefined && (
          <div className="text-muted-foreground text-[11px]">{props.aside}</div>
        )}
      </div>
      <div className={cn("min-w-0 flex-1", props.bodyClassName)}>
        {props.children}
      </div>
      {props.footer !== undefined && (
        <div className="text-muted-foreground border-t px-[18px] py-3 text-[11px]">
          {props.footer}
        </div>
      )}
    </section>
  );
}

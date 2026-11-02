import { cn } from "@/lib/utils";

type PanelProps = {
  title: string;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
};

export function Panel(props: PanelProps) {
  return (
    <section
      aria-label={props.title}
      className={cn("bg-card flex min-w-0 flex-col border", props.className)}
    >
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b px-3 py-1.5">
        <h2 className="text-[10.5px] font-semibold tracking-[0.06em] uppercase">
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
        <div className="text-muted-foreground border-t px-3 py-2 text-[11px]">
          {props.footer}
        </div>
      )}
    </section>
  );
}

type CollapsibleSectionProps = {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function CollapsibleSection(props: CollapsibleSectionProps) {
  return (
    <details open={props.defaultOpen} className="group flex flex-col">
      <summary className="bg-card hover:bg-cc-panel-2 flex h-8 list-none items-center gap-x-2 border px-3 text-[10.5px] font-semibold tracking-[0.06em] uppercase select-none [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className="text-muted-foreground group-open:rotate-90"
        >
          ▸
        </span>
        {props.title}
        {props.summary !== undefined && (
          <span className="text-muted-foreground font-normal tracking-normal normal-case">
            {props.summary}
          </span>
        )}
      </summary>
      <div className="flex flex-col gap-y-3 pt-3">{props.children}</div>
    </details>
  );
}

import { cn } from "@/lib/utils";

type ToolbarLabelProps = {
  open?: boolean;
  role?: "status";
  children: React.ReactNode;
};

/** Render a toolbar button's label collapsed to zero width, widening and fading in while its `group` button is hovered or focused, or while `open`. */
export function ToolbarLabel(props: ToolbarLabelProps) {
  return (
    <span
      className={cn(
        "grid grid-cols-[0fr] opacity-0",
        "[transition:grid-template-columns_280ms_cubic-bezier(0.23,1,0.32,1)_60ms,opacity_120ms_ease-out]",
        "group-hover:grid-cols-[1fr] group-hover:opacity-100 group-hover:[transition:grid-template-columns_280ms_cubic-bezier(0.23,1,0.32,1),opacity_200ms_ease-out_110ms]",
        "group-focus-visible:grid-cols-[1fr] group-focus-visible:opacity-100",
        "motion-reduce:transition-none",
        props.open && "grid-cols-[1fr] opacity-100"
      )}
    >
      <span className="min-w-0 overflow-hidden whitespace-nowrap">
        <span role={props.role} className="block pl-2 select-text">
          {props.children}
        </span>
      </span>
    </span>
  );
}

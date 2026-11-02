type CcFieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
};

export function CcField(props: CcFieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-y-1">
      <label
        htmlFor={props.htmlFor}
        className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase"
      >
        {props.label}
      </label>
      {props.children}
    </div>
  );
}

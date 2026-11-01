type CcFieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
};

export function CcField(props: CcFieldProps) {
  return (
    <div className="flex flex-col gap-y-1.5">
      <label
        htmlFor={props.htmlFor}
        className="text-muted-foreground text-[11px] tracking-[0.14em]"
      >
        {props.label}
      </label>
      {props.children}
    </div>
  );
}

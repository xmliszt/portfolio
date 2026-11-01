type PageHeaderProps = {
  eyebrow: React.ReactNode;
  title: string;
  aside?: React.ReactNode;
};

export function PageHeader(props: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-4">
      <div className="flex flex-col gap-y-1.5">
        <div className="text-muted-foreground text-[11px] tracking-[0.2em]">
          {props.eyebrow}
        </div>
        <h1 className="font-[family-name:var(--cc-font-display)] text-[34px] leading-tight font-semibold tracking-[0.02em]">
          {props.title}
        </h1>
      </div>
      {props.aside}
    </header>
  );
}

type PageHeaderProps = {
  eyebrow: React.ReactNode;
  title: string;
  aside?: React.ReactNode;
};

export function PageHeader(props: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h1 className="font-[family-name:var(--cc-font-display)] text-[18px] leading-6 font-semibold">
          {props.title}
        </h1>
        <div className="text-muted-foreground text-[10.5px] tracking-[0.06em] uppercase">
          {props.eyebrow}
        </div>
      </div>
      {props.aside}
    </header>
  );
}

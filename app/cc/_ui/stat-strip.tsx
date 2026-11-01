type StatStripProps = {
  label: string;
  children: React.ReactNode;
};

export function StatStrip(props: StatStripProps) {
  return (
    <section
      aria-label={props.label}
      className="bg-border grid grid-cols-2 gap-x-px gap-y-px border sm:grid-cols-3 xl:grid-cols-5"
    >
      {props.children}
    </section>
  );
}

type LegalSectionProps = {
  heading: string;
  children: React.ReactNode;
};

/** Render one headed section of a legal page, styling the paragraphs, lists, links and code inside `children`. */
export function LegalSection(props: LegalSectionProps) {
  return (
    <section className="flex flex-col gap-y-4">
      <h2 className="m-0 font-[family-name:var(--lm-font-display)] text-[20px] leading-7 font-normal text-balance text-[var(--lm-ink-hi)] lowercase">
        {props.heading}
      </h2>
      <div className="flex flex-col gap-y-3 font-[family-name:var(--lm-font-display)] text-[15px] leading-[1.7] text-pretty [&_a]:text-[var(--lm-ink-hi)] [&_a]:underline [&_a]:decoration-[var(--lm-line)] [&_a]:underline-offset-4 [&_a:hover]:decoration-[var(--lm-ink-hi)] [&_code]:font-[family-name:var(--lm-font-mono)] [&_code]:text-[12.5px] [&_code]:text-[var(--lm-ink-hi)] [&_p]:text-[15px] [&_p]:leading-[1.7] [&_strong]:font-normal [&_strong]:text-[var(--lm-ink-hi)] [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-y-1.5 [&_ul]:pl-5 [&_ul]:marker:text-[var(--lm-line)]">
        {props.children}
      </div>
    </section>
  );
}

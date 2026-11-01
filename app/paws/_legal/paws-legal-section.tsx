type PawsLegalSectionProps = {
  heading: string;
  children: React.ReactNode;
};

/** Render one headed section of a Paws legal page, styling the paragraphs, lists, links and code inside `children`. */
export function PawsLegalSection(props: PawsLegalSectionProps) {
  return (
    <section className="flex flex-col gap-y-3 border-t-[1.5px] border-[var(--pw-rule)] pt-5">
      <h2 className="m-0 font-[family-name:var(--pw-font-display)] text-[22px] leading-tight font-normal text-balance">
        {props.heading}
      </h2>
      <div className="flex flex-col gap-y-3 text-[13px] leading-relaxed text-pretty [&_a]:underline [&_a]:decoration-[var(--pw-rule)] [&_a]:decoration-[1.5px] [&_a]:underline-offset-4 [&_a:hover]:decoration-[var(--pw-pink)] [&_code]:bg-[var(--pw-paper-deep)] [&_code]:px-1 [&_strong]:font-medium [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-y-1.5 [&_ul]:pl-5 [&_ul]:marker:text-[var(--pw-pink)]">
        {props.children}
      </div>
    </section>
  );
}

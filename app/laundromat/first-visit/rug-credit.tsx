import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { INSPIRATION_BOOK } from "@/lib/laundromat/inspiration-book";

const LINK_CLASS =
  "pointer-events-auto cursor-pointer fill-[var(--lm-line)] outline-none select-none transition-[fill] duration-200 [-webkit-tap-highlight-color:transparent] hover:fill-[var(--lm-ink)]";

type RugCreditProps = {
  rug: BedroomConfig["rug"];
};

/** Print the book that inspired the laundromat on the rug, in floor units, with its title and author linked. */
export function RugCredit(props: RugCreditProps) {
  const { copy } = useLaundromatCopy();
  const x = props.rug.at.x + props.rug.width / 2;
  const centerY = props.rug.at.y + props.rug.depth / 2;
  return (
    <g
      textAnchor="middle"
      className="stroke-none font-[family-name:var(--lm-font-display)]"
    >
      <text
        x={x}
        y={centerY - 0.47}
        fontSize={0.13}
        className="fill-[var(--lm-detail)]"
      >
        {copy.site.inspiredBy}
      </text>
      <a
        href={INSPIRATION_BOOK.url}
        target="_blank"
        rel="noopener"
        tabIndex={-1}
        className={LINK_CLASS}
      >
        <text x={x} y={centerY - 0.16} fontSize={0.18}>
          {INSPIRATION_BOOK.title}
        </text>
        <text x={x} y={centerY + 0.1} fontSize={0.14}>
          《{INSPIRATION_BOOK.originalTitle}》
        </text>
      </a>
      <a
        href={INSPIRATION_BOOK.authorInstagramUrl}
        target="_blank"
        rel="noopener"
        tabIndex={-1}
        className={LINK_CLASS}
      >
        <text x={x} y={centerY + 0.42} fontSize={0.13}>
          {INSPIRATION_BOOK.author} · {INSPIRATION_BOOK.originalAuthor}
        </text>
      </a>
    </g>
  );
}

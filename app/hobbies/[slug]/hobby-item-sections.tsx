import { BookGrid } from "@/components/ui/book-grid";
import { FilmGrid } from "@/components/ui/film-grid";

import { HobbyItemSection } from "./fetch-hobby-item-sections";

type HobbyItemSectionsProps = {
  sections: HobbyItemSection[];
};

export function HobbyItemSections(props: HobbyItemSectionsProps) {
  return (
    <div className="mt-2 space-y-8">
      {props.sections.map((section) => (
        <section key={section.id}>
          <h2>{section.title}</h2>
          {section.itemKind === "film" ? (
            <FilmGrid
              films={section.items.map((item) => ({
                originalTitle: item.title,
                alternativeTitle: item.subtitle ?? "",
                year: item.year ?? 0,
                posterUrl: item.image_url,
                href: item.external_url,
              }))}
            />
          ) : (
            <BookGrid
              books={section.items.map((item) => ({
                title: item.title,
                author: item.creator ?? "",
                posterUrl: item.image_url,
                href: item.external_url,
              }))}
            />
          )}
        </section>
      ))}
    </div>
  );
}

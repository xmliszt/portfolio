export const CATALOGUE_SOURCES = ["openlibrary", "googlebooks"] as const;

export type CatalogueSource = (typeof CATALOGUE_SOURCES)[number];

export type BookSource = CatalogueSource | "manual";

/** A book as one catalogue describes it, before it is on the shelf. */
export type CatalogueBook = {
  source: CatalogueSource;
  sourceId: string;
  title: string;
  subtitle: string | undefined;
  authors: string;
  year: number | undefined;
  language: string | undefined;
  coverRef: string | undefined;
};

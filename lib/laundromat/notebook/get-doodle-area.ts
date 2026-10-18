import { sceneConfig } from "@/lib/laundromat/scene-config";

/** Return the size of the notebook's drawing space in page pixels and the height of one ruled line, for a notebook of `offlineBook.linesPerPage` lines per page as every notebook has. */
export function getDoodleArea() {
  const { page, doodle, offlineBook } = sceneConfig.notebook;
  const pitchPx =
    (page.height - page.marginTop - page.marginBottom) /
    offlineBook.linesPerPage;
  return {
    widthPx: page.width - page.marginX * 2,
    heightPx: doodle.maxRows * pitchPx,
    pitchPx,
  };
}

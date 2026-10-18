import { sceneConfig } from "@/lib/laundromat/scene-config";

/** Return the size of the notebook's drawing space in page pixels and the height of one ruled line, for a page of `linesPerPage` lines. */
export function getDoodleArea(
  linesPerPage = sceneConfig.notebook.offlineBook.linesPerPage
) {
  const { page, doodle } = sceneConfig.notebook;
  const pitchPx =
    (page.height - page.marginTop - page.marginBottom) / linesPerPage;
  return {
    widthPx: page.width - page.marginX * 2,
    heightPx: doodle.maxRows * pitchPx,
    pitchPx,
  };
}

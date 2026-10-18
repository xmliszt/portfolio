import { fetchAsDataUrl } from "./fetch-as-data-url";

/** Replace the `href` of every same-origin `<image>` in `svg` with the image's bytes as a `data:` URL and remove every other image and any that cannot be fetched, so the drawing can be rasterized on its own. */
export async function embedSvgImages(svg: SVGSVGElement) {
  await Promise.all(
    [...svg.querySelectorAll("image")].map(async (image) => {
      const href = image.getAttribute("href") ?? "";
      if (href.startsWith("data:")) return;
      const isSameOrigin =
        href !== "" && new URL(href, location.href).origin === location.origin;
      const dataUrl = isSameOrigin ? await fetchAsDataUrl(href) : undefined;
      if (dataUrl === undefined) image.remove();
      else image.setAttribute("href", dataUrl);
    })
  );
}

import { fetchAsDataUrl } from "./fetch-as-data-url";

const REMOTE_IMAGE_WIDTH_PX = 640;

function toSameOriginUrl(href: string) {
  const url = new URL(href, location.href);
  if (url.origin === location.origin) return url.href;
  return `/_next/image?url=${encodeURIComponent(url.href)}&w=${REMOTE_IMAGE_WIDTH_PX}&q=75`;
}

/** Replace the `href` of every `<image>` in `svg` with the image's bytes as a `data:` URL, fetching other sites' images through the app's `/_next/image` endpoint, and remove any image that cannot be fetched, so the drawing can be rasterized on its own. */
export async function embedSvgImages(svg: SVGSVGElement) {
  await Promise.all(
    [...svg.querySelectorAll("image")].map(async (image) => {
      const href = image.getAttribute("href") ?? "";
      if (href.startsWith("data:")) return;
      const dataUrl =
        href === "" ? undefined : await fetchAsDataUrl(toSameOriginUrl(href));
      if (dataUrl === undefined) image.remove();
      else image.setAttribute("href", dataUrl);
    })
  );
}

const JPEG_QUALITY = 0.9;

/** Return `image` re-encoded as a JPEG at the same size. */
export async function convertToJpeg(image: Blob) {
  const bitmap = await createImageBitmap(image);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
  bitmap.close();
  const jpeg = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  if (jpeg === null) throw new Error("the print could not be encoded as JPEG");
  return jpeg;
}

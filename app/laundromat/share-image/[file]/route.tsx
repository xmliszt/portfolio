import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getLaundromatCopy } from "@/lib/laundromat/i18n/get-laundromat-copy";
import { loadGoogleFont } from "@/lib/laundromat/share-image/load-google-font";
import type { ShareImageLocale } from "@/lib/laundromat/share-image/share-image-locales";
import { SHARE_IMAGE_LOCALES } from "@/lib/laundromat/share-image/share-image-locales";

export const dynamic = "force-static";
export const dynamicParams = false;

const WORDMARK = "laundro.cafe";
const WORDMARK_KOREAN = "빨래방";

/** Return the Google Fonts families that draw the scripts of `locale` that Gowun Batang and IBM Plex Mono lack. */
function getFallbackFamilies(locale: ShareImageLocale) {
  switch (locale) {
    case "zh-Hans":
      return { serif: "Noto Serif SC", sans: "Noto Sans SC" };
    case "zh-Hant":
      return { serif: "Noto Serif TC", sans: "Noto Sans TC" };
    case "ja":
      return { serif: "Noto Serif JP", sans: "Noto Sans JP" };
    case "ko":
      return { serif: "Noto Serif KR", sans: "Noto Sans KR" };
    case "en":
    case "fr":
    case "de":
    case "es":
    case "pt-BR":
    case "it":
    case "nl":
    case "tr":
    case "ru":
    case "uk":
    case "pl":
    case "id":
    case "vi":
      return { serif: "Noto Serif", sans: "Noto Sans Mono" };
    default: {
      const unhandled: never = locale;
      return unhandled;
    }
  }
}

export function generateStaticParams() {
  return SHARE_IMAGE_LOCALES.map((locale) => ({ file: `${locale}.png` }));
}

type ShareImageRouteProps = {
  params: Promise<{ file: string }>;
};

export async function GET(_request: Request, props: ShareImageRouteProps) {
  const { file } = await props.params;
  const locale = SHARE_IMAGE_LOCALES.find((each) => `${each}.png` === file);
  if (locale === undefined) return new Response(null, { status: 404 });
  const { headline, subline } = getLaundromatCopy(locale).site.shareImage;
  const fallback = getFallbackFamilies(locale);
  const plate = await readFile(
    join(process.cwd(), "public/laundromat/share-image-plate.png")
  );
  const families = [
    { name: "Gowun Batang", text: headline + WORDMARK_KOREAN },
    { name: fallback.serif, text: headline },
    { name: "IBM Plex Mono", text: subline + WORDMARK },
    { name: fallback.sans, text: subline },
  ];
  const fonts = await Promise.all(
    families.map(
      async (family) =>
        ({
          name: family.name,
          data: await loadGoogleFont({
            family: family.name,
            text: family.text,
          }),
          weight: 400,
          style: "normal",
        }) satisfies {
          name: string;
          data: ArrayBuffer;
          weight: 400;
          style: "normal";
        }
    )
  );
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 72px 72px",
          backgroundColor: "#0c0d0e",
          backgroundImage: `url(data:image/png;base64,${plate.toString("base64")})`,
          backgroundSize: "1200px 630px",
          color: "#eceef0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            columnGap: 14,
            fontSize: 22,
          }}
        >
          <span style={{ fontFamily: "IBM Plex Mono" }}>{WORDMARK}</span>
          <span style={{ fontFamily: "Gowun Batang", color: "#7d8286" }}>
            {WORDMARK_KOREAN}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: 22,
            width: 440,
            wordBreak: locale === "ko" ? "keep-all" : "normal",
          }}
        >
          <div
            style={{
              fontFamily: `Gowun Batang, ${fallback.serif}`,
              fontSize: 50,
              lineHeight: 1.2,
              letterSpacing: -0.4,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              fontFamily: `IBM Plex Mono, ${fallback.sans}`,
              fontSize: 18,
              lineHeight: 1.6,
              color: "#a2a7ab",
            }}
          >
            {subline}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );
}

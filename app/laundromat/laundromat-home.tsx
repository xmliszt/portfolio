import { Suspense } from "react";

import { getLaundromatCopy } from "@/lib/laundromat/i18n/get-laundromat-copy";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";

import { LaundromatCopyProvider } from "./i18n/laundromat-copy-provider";
import { LocalWeatherProvider } from "./local-weather/local-weather-provider";
import { SupabaseRoomProvider } from "./realtime/supabase-room-provider";
import { RenderQualityProvider } from "./settings/render-quality-provider";
import { SoundBoardProvider } from "./sound/sound-board-provider";
import { ThemedLaundromat } from "./themes/themed-laundromat";
import { LaundromatUpdateProvider } from "./update/laundromat-update-provider";
import { LaundromatIntro } from "./laundromat-intro";
import { LaundromatJsonLd } from "./laundromat-json-ld";

type LaundromatHomeProps = {
  locale: LaundromatLocale;
};

export function LaundromatHome(props: LaundromatHomeProps) {
  const copy = getLaundromatCopy(props.locale);
  return (
    <div className="size-full">
      <LaundromatJsonLd
        name={copy.site.name}
        description={copy.site.description}
        locale={props.locale}
      />
      <LaundromatCopyProvider locale={props.locale}>
        <Suspense>
          <SoundBoardProvider>
            <RenderQualityProvider>
              <SupabaseRoomProvider>
                <LaundromatUpdateProvider>
                  <LocalWeatherProvider>
                    <ThemedLaundromat />
                  </LocalWeatherProvider>
                </LaundromatUpdateProvider>
              </SupabaseRoomProvider>
            </RenderQualityProvider>
          </SoundBoardProvider>
        </Suspense>
        <LaundromatIntro />
      </LaundromatCopyProvider>
    </div>
  );
}

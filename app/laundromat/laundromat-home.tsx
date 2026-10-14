import { Suspense } from "react";

import { getLaundromatCopy } from "@/lib/laundromat/i18n/get-laundromat-copy";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import { sceneConfig } from "@/lib/laundromat/scene-config";

import { LaundromatCopyProvider } from "./i18n/laundromat-copy-provider";
import { SupabaseRoomProvider } from "./realtime/supabase-room-provider";
import { RenderQualityProvider } from "./settings/render-quality-provider";
import { SoundBoardProvider } from "./sound/sound-board-provider";
import { LaundromatUpdateProvider } from "./update/laundromat-update-provider";
import { LaundromatEntry } from "./laundromat-entry";
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
                  <LaundromatEntry config={sceneConfig} />
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

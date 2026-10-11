import { Suspense } from "react";

import { getLaundromatCopy } from "@/lib/laundromat/i18n/get-laundromat-copy";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import { sceneConfig } from "@/lib/laundromat/scene-config";

import { LaundromatCopyProvider } from "./i18n/laundromat-copy-provider";
import { SupabaseRoomProvider } from "./realtime/supabase-room-provider";
import { SoundBoardProvider } from "./sound/sound-board-provider";
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
        <LaundromatIntro />
        <Suspense>
          <SoundBoardProvider>
            <SupabaseRoomProvider>
              <LaundromatEntry config={sceneConfig} />
            </SupabaseRoomProvider>
          </SoundBoardProvider>
        </Suspense>
      </LaundromatCopyProvider>
    </div>
  );
}

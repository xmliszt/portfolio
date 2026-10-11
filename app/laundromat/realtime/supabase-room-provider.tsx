"use client";

import { useEffect, useState } from "react";

import { sceneConfig } from "@/lib/laundromat/scene-config";

import { createSupabaseRoomSource } from "./create-supabase-room-source";
import type { RoomSource } from "./room-source";
import { RoomSourceContext } from "./room-source-context";

type SupabaseRoomProviderProps = {
  children: React.ReactNode;
};

/** Provide the shared laundromat room over Supabase Realtime, or no room when `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not set. */
export function SupabaseRoomProvider(props: SupabaseRoomProviderProps) {
  const [source, setSource] = useState<RoomSource>();

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return;
    const created = createSupabaseRoomSource({
      url,
      anonKey,
      maxDraftChars: sceneConfig.notebook.maxChars,
    });
    setSource(created);
    return () => created.dispose();
  }, []);

  return (
    <RoomSourceContext.Provider value={source}>
      {props.children}
    </RoomSourceContext.Provider>
  );
}

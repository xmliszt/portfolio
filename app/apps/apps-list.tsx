"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { AppData } from "@/app/apps/data";

import { AppIcon } from "./app-icon";

export function AppsList({ apps }: { apps: AppData[] }) {
  return (
    <div className="flex flex-col gap-4">
      {apps.map((app) => (
        <Link
          key={app.id}
          href={`/apps/${app.id}`}
          className="group bg-card hover:bg-accent border-border/50 relative flex items-center gap-x-6 rounded-3xl border p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <AppIcon
            layoutId={`icon-${app.id}`}
            alt={app.icon.alt}
            lightUrl={app.icon.light}
            darkUrl={app.icon.dark}
            className="size-16 shrink-0 rounded-[39.55px]! md:size-20 md:rounded-[49.44px]!"
          />

          <div className="flex flex-col gap-y-0.5">
            <motion.h2
              layoutId={`title-${app.id}`}
              className="text-foreground m-0 text-xl font-bold tracking-tight"
            >
              {app.name}
            </motion.h2>
            {app.subtitle && (
              <motion.p
                layoutId={`subtitle-${app.id}`}
                className="text-muted-foreground m-0 text-xs font-normal"
              >
                {app.subtitle}
              </motion.p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

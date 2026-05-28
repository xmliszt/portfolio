"use client";

import { useState } from "react";
import { isMobile } from "react-device-detect";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { upperCase } from "lodash";
import { motion } from "motion/react";
import Link from "next/link";

import { AppIcon } from "@/app/apps/app-icon";
import { AppData, AppLink } from "@/app/apps/data";
import { ICON_MAP } from "@/app/apps/icon-map";
import type { LiveAppStoreMedia } from "@/lib/app-store-connect/fetch-media";

import { AppPreviewVideo } from "./app-preview-video";
import {
  AppViewBottomViewMobile,
  AppViewBottomViewWeb,
} from "./app-view-bottom-view";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type PreviewItem =
  | { kind: "video"; url: string; posterUrl: string }
  | { kind: "image"; url: string };

type AppViewProps = {
  app: AppData;
  /** Live media from App Store Connect; when absent, falls back to `app.screenshots`. */
  liveMedia?: LiveAppStoreMedia;
};

export function AppView(props: AppViewProps) {
  const { app, liveMedia } = props;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const previewItems: PreviewItem[] = (() => {
    if (liveMedia && (liveMedia.video || liveMedia.screenshots.length > 0)) {
      const items: PreviewItem[] = [];
      if (liveMedia.video) {
        items.push({
          kind: "video",
          url: liveMedia.video.url,
          posterUrl: liveMedia.video.posterUrl,
        });
      }
      for (const url of liveMedia.screenshots) {
        items.push({ kind: "image", url });
      }
      return items;
    }
    return (app.screenshots ?? []).map<PreviewItem>((url) => ({
      kind: "image",
      url,
    }));
  })();

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-20">
      {/* Header Section */}
      <header className="flex flex-col items-center gap-8 md:flex-row md:items-stretch md:gap-10">
        <AppIcon
          layoutId={`icon-${app.id}`}
          alt={app.icon.alt}
          lightUrl={app.icon.light}
          darkUrl={app.icon.dark}
          className="size-36 shrink-0 md:size-40"
        />

        <div className="flex flex-col items-center gap-4 pt-2 md:items-start">
          <div className="flex flex-1 flex-col gap-y-4">
            <div className="space-y-1 text-center md:text-start">
              <motion.h1
                layoutId={`title-${app.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold tracking-tight md:text-4xl"
              >
                {app.name}
              </motion.h1>
              <motion.p
                layoutId={`subtitle-${app.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-lg font-medium"
              >
                {app.subtitle}
              </motion.p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {(() => {
              const appStoreLink = app.links.appStore;
              const testFlightLink = app.links.testFlight;

              const link = (() => {
                if (appStoreLink && appStoreLink.badge === "available")
                  return appStoreLink;
                return testFlightLink;
              })();

              if (!link) return null;

              return (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex min-w-[100px] items-center justify-center rounded-3xl px-8 py-1.5 text-base font-bold transition-all active:scale-95",
                      link.badge === "reviewing"
                        ? "bg-secondary text-secondary-foreground cursor-not-allowed border text-sm font-normal opacity-70"
                        : "bg-blue-600 text-white shadow-md hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                    )}
                  >
                    {link.badgeLabel}
                  </Link>
                </motion.div>
              );
            })()}
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center gap-x-4">
        {/* Product hunt embed */}
        {app.productHuntEmbed && (
          <div
            className="flex items-center justify-center [&_a]:cursor-pointer!"
            dangerouslySetInnerHTML={{
              __html: app.productHuntEmbed,
            }}
          />
        )}
      </div>

      {/* Preview Section */}
      {previewItems.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Preview</h2>
          {/* Container with fade effect */}
          <div className="relative -mx-4 md:-mx-8">
            <div className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 md:px-8">
              {previewItems.map((item, i) => (
                <motion.div
                  key={item.url}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={cn(
                    "relative aspect-9/19 h-[450px] shrink-0 snap-center overflow-hidden border-[0.5px] border-black/10 shadow-sm md:h-[500px]",
                    "rounded-[12.8%/5.7%]"
                  )}
                >
                  {item.kind === "video" ? (
                    <AppPreviewVideo
                      src={item.url}
                      posterUrl={item.posterUrl}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={`Screenshot ${i + 1}`}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Description Section */}
      <section className="space-y-4">
        <div className="relative">
          <motion.div
            animate={{ height: isDescriptionExpanded ? "auto" : "180px" }}
            initial={false}
            className="overflow-hidden"
          >
            <p className="text-foreground/90 text-base leading-relaxed whitespace-pre-wrap">
              {app.description}
            </p>

            {app.features && (
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-semibold">Key Features</h3>
                <ul className="space-y-3">
                  {app.features.map((feature, i) => {
                    const separatorIndex = feature.indexOf(":");
                    const title =
                      separatorIndex !== -1
                        ? feature.slice(0, separatorIndex)
                        : feature;
                    const desc =
                      separatorIndex !== -1
                        ? feature.slice(separatorIndex + 1)
                        : "";

                    return (
                      <li key={i} className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          {desc ? (
                            <>
                              <span className="text-foreground font-semibold">
                                {title}:
                              </span>
                              <span className="text-muted-foreground">
                                {desc}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">
                              {title}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </motion.div>

          {!isDescriptionExpanded && (
            <div className="from-background absolute bottom-0 left-0 h-32 w-full bg-linear-to-t to-transparent" />
          )}
        </div>

        <button
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          className="flex items-center gap-1 text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {isDescriptionExpanded ? "Show Less" : "Read More"}
        </button>
      </section>

      {/* Links Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Links</h2>

        <div className="grid grid-cols-1 gap-5">
          {app.links.testFlight && (
            <LinkItem
              key={app.links.testFlight.label}
              link={app.links.testFlight}
            />
          )}
          {app.links.appStore && (
            <LinkItem
              key={app.links.appStore.label}
              link={app.links.appStore}
            />
          )}
          {app.links.feedback?.map((link) => (
            <LinkItem key={link.label} link={link} />
          ))}
          {app.links.community?.map((link) => (
            <LinkItem key={link.label} link={link} />
          ))}
        </div>
      </section>

      {/* Legal */}
      {isMobile ? (
        <AppViewBottomViewMobile app={app} />
      ) : (
        <AppViewBottomViewWeb app={app} />
      )}
    </div>
  );
}

function LinkItem({ link }: { link: AppLink }) {
  const Icon = ICON_MAP[link.icon];
  return (
    <Link
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group bg-card hover:bg-accent hover:text-accent-foreground relative flex items-center justify-between rounded-xl border p-4 transition-colors active:scale-[0.99]",
        link.badge === "reviewing"
          ? "pointer-events-none cursor-not-allowed opacity-50 select-none"
          : ""
      )}
      aria-disabled={link.badge === "reviewing"}
    >
      <div className="flex items-center gap-4">
        <div className="bg-muted text-foreground group-hover:bg-background flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
          <Icon size={20} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{link.label}</span>
          {link.description && (
            <span className="text-muted-foreground text-xs">
              {link.description}
            </span>
          )}
        </div>
      </div>
      <ArrowSquareOut
        className="text-muted-foreground/50 group-hover:text-foreground transition-all group-hover:opacity-100"
        size={20}
      />

      {/* Badge */}
      {link.badge && (
        <div className="bg-accent text-accent-foreground absolute top-0 right-0 translate-x-1/4 -translate-y-1/2 rounded-full border px-2 py-1 text-xs font-medium">
          {upperCase(link.badge)}
        </div>
      )}
    </Link>
  );
}

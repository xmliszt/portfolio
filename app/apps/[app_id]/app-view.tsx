"use client";

import { useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import { ICON_MAP } from "@/app/apps/app-links";
import { AppData, AppLink } from "@/app/apps/data";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function AppView({ app }: { app: AppData }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-20">
      {/* Header Section */}
      <header className="flex flex-col items-center gap-8 md:flex-row md:items-stretch md:gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative size-40 shrink-0 overflow-hidden rounded-[35px] border-[0.5px] border-black/10 shadow-lg sm:size-[180px] dark:border-white/10"
          style={{
            // @ts-ignore
            "corner-shape": "squircle",
          }}
        >
          <Image
            src={app.icon.light}
            alt={app.icon.alt}
            fill
            className="object-cover dark:hidden"
            unoptimized
          />
          <Image
            src={app.icon.dark}
            alt={app.icon.alt}
            fill
            className="hidden object-cover dark:block"
            unoptimized
          />
        </motion.div>

        <div className="flex flex-col items-center gap-4 pt-2 md:items-start">
          <div className="flex flex-1 flex-col gap-y-4">
            <div className="space-y-1 text-center md:text-start">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold tracking-tight md:text-5xl"
              >
                {app.name}
              </motion.h1>
              <motion.p
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
            {app.links.appStore?.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex min-w-[100px] items-center justify-center rounded-3xl px-8 py-1.5 text-base font-bold transition-all active:scale-95",
                    link.badge === "pending"
                      ? "bg-secondary text-secondary-foreground cursor-not-allowed opacity-70"
                      : "bg-blue-600 text-white shadow-md hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                  )}
                  onClick={(e) =>
                    link.badge === "pending" && e.preventDefault()
                  }
                >
                  {link.badge === "pending" ? "COMING SOON" : "GET"}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </header>

      {/* Screenshots Section */}
      {app.screenshots && app.screenshots.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Preview</h2>
          {/* Container with fade effect */}
          <div className="relative -mx-4 md:-mx-8">
            <div className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 md:px-8">
              {app.screenshots.map((src, i) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="relative aspect-9/19 h-[450px] shrink-0 snap-center overflow-hidden rounded-4xl border-[0.5px] border-black/10 shadow-sm md:h-[500px]"
                  style={{
                    // @ts-ignore
                    "corner-shape": "squircle",
                  }}
                >
                  <Image
                    src={src}
                    alt={`Screenshot ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </motion.div>
              ))}
            </div>
            {/* Fade gradients */}
            <div className="from-background pointer-events-none absolute top-0 left-0 h-full w-8 bg-linear-to-r to-transparent md:w-16" />
            <div className="from-background pointer-events-none absolute top-0 right-0 h-full w-8 bg-linear-to-l to-transparent md:w-16" />
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

        <div className="grid grid-cols-1 gap-3">
          {app.links.feedback?.map((link) => (
            <LinkItem key={link.label} link={link} />
          ))}
          {app.links.community?.map((link) => (
            <LinkItem key={link.label} link={link} />
          ))}
        </div>
      </section>

      {/* Legal */}
      <section className="pt-4">
        <div className="text-foreground flex flex-wrap gap-x-2 gap-y-2 text-sm">
          <Link
            href={`/apps/${app.id}/privacy-policy`}
            className="hover:underline"
          >
            Privacy Policy
          </Link>

          {/* dot */}
          <span className="text-foreground">•</span>

          <Link
            href={`/apps/${app.id}/terms-of-service`}
            className="hover:underline"
          >
            Terms of Service
          </Link>
        </div>
      </section>
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
      className="group bg-card hover:bg-accent hover:text-accent-foreground flex items-center justify-between rounded-xl border p-4 transition-colors active:scale-[0.99]"
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
    </Link>
  );
}

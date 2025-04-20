"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

type ModalProps = {
  station_id: string;
  children: React.ReactNode;
};

export function Modal({ station_id, children }: ModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.back();
    };

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        router.back();
      }
    };

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-[9999] h-screen w-screen p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 dark:bg-neutral-700/50"
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      />
      {/* Modal content container */}
      <div ref={modalRef} className="absolute inset-4 sm:inset-8">
        <motion.div
          layoutId={`craft_station.container.${station_id}`}
          className="bg-background h-full w-full overflow-auto rounded-lg border p-4 shadow-lg"
        >
          {children}
          {/* Close button */}
          <button
            className={cn(
              "text-foreground absolute top-4 right-4",
              "hover:text-foreground/80 transition-colors"
            )}
            onClick={() => router.push(`/craft`)}
          >
            <X className="size-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

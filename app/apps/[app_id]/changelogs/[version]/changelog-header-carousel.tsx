"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type ChangelogHeaderCarouselProps = {
  images: string[];
  alt: string;
};

export function ChangelogHeaderCarousel(props: ChangelogHeaderCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplay = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  useEffect(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
    function onSelect() {
      if (!api) return;
      setSelectedIndex(api.selectedScrollSnap());
    }
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (props.images.length === 1) {
    const src = props.images[0];
    return (
      <div className="flex w-full items-center justify-center overflow-hidden">
        <Image
          src={src}
          alt={props.alt}
          width={800}
          height={450}
          className="w-full max-w-[324px] rounded-3xl object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-y-3">
      <Carousel
        setApi={setApi}
        className="w-full max-w-[324px]"
        opts={{ loop: true }}
        plugins={[autoplay.current]}
      >
        <CarouselContent>
          {props.images.map((src, index) => (
            <CarouselItem key={src}>
              <Image
                src={src}
                alt={`${props.alt} ${index + 1}`}
                width={800}
                height={450}
                className="w-full rounded-3xl object-cover"
                unoptimized
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex items-center gap-x-1.5">
        {props.images.map((src, index) => (
          <button
            key={src}
            type="button"
            aria-label={`Go to image ${index + 1}`}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === selectedIndex
                ? "bg-foreground w-4"
                : "bg-muted-foreground/40 w-1.5"
            )}
          />
        ))}
      </div>
    </div>
  );
}

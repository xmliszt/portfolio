"use client";

import { useState } from "react";

import { Button } from "./button";

type LoadMoreLinksProps = {
  hrefs: string[];
};

export function LoadMoreLinks(props: LoadMoreLinksProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="flex flex-col items-center justify-stretch space-y-2">
      {showMore && (
        <div className="flex grow flex-col space-y-8 self-stretch [&>iframe]:m-0">
          {props.hrefs.map((href, i) => (
            <iframe
              key={i}
              width="100%"
              style={{
                aspectRatio: "16/9",
              }}
              src={href}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          ))}
        </div>
      )}
      <Button
        onClick={() => setShowMore(!showMore)}
        className="w-40 text-sm"
        variant="outline"
      >
        {showMore ? "Show less" : "Show more"}
      </Button>
    </div>
  );
}

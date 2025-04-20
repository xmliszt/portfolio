"use client"; // Error components must be Client Components

import { useEffect } from "react";

import { Piano } from "@/components/custom/piano/piano";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <article className="prose prose-stone dark:prose-invert relative flex min-h-[50vh] flex-col items-center gap-4 text-center">
      <h1 className="m-0">{`I'm taking a nap...`}</h1>
      <h2 className="m-0">{`我开一会儿小差啊……`}</h2>
      <p className="m-0">Feel free to have some music ~ 随便弹弹钢琴吧~</p>
      <div className="piano:my-8 piano:rotate-0 my-28 w-max translate-[transform_margin] rotate-90 rounded-lg bg-stone-700 p-4 shadow-[inset_0_0_20px_10px_rgba(0,0,0,0.4),0_0_20px_10px_rgba(0,0,0,0.4)] ease-out">
        <Piano />
      </div>
      {error.message && (
        <p className="rounded-lg border px-3 py-1 leading-tight text-red-600 dark:text-red-400">
          <small>
            Error:{" "}
            <code className="font-light text-red-600 dark:text-red-400">
              {error.message}
            </code>
          </small>
        </p>
      )}
      <div className="flex w-full items-center justify-center">
        <Button
          className="mx-auto block"
          variant={"outline"}
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again 再试试
        </Button>
      </div>
    </article>
  );
}

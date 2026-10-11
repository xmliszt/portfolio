import { Suspense } from "react";
import { notFound } from "next/navigation";

import { LabLoader } from "./lab-loader";

export default function LaundromatLabPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <div className="size-full">
      <h1 className="sr-only">laundro.cafe lab</h1>
      <Suspense>
        <LabLoader />
      </Suspense>
    </div>
  );
}

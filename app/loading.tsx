import { BrandLoader } from "@/components/custom/brand-loader/brand-loader";

export default function Loading() {
  return (
    <div className="pointer-events-none fixed inset-0 grid place-items-center">
      <BrandLoader />
    </div>
  );
}

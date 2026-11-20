import { BrandLoader } from "@/components/custom/brand-loader/brand-loader";

export default function LaundromatLoading() {
  return (
    <div className="grid size-full place-items-center">
      <BrandLoader tone="dark" />
    </div>
  );
}

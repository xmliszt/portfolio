import { BrandLoader } from "@/components/custom/brand-loader/brand-loader";

export default function PawsLoading() {
  return (
    <div className="grid size-full place-items-center">
      <BrandLoader tone="light" />
    </div>
  );
}

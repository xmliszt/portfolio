export default function CcAppLoading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex animate-pulse flex-col gap-y-5"
    >
      <div className="flex flex-col gap-y-2">
        <div className="bg-cc-panel-2 h-3 w-40" />
        <div className="bg-cc-panel-2 h-9 w-72" />
      </div>
      <div className="bg-card h-24 border" />
      <div className="flex flex-wrap gap-x-5 gap-y-5">
        <div className="bg-card h-80 flex-[3_1_560px] border" />
        <div className="bg-card h-80 flex-[2_1_320px] border" />
      </div>
    </div>
  );
}

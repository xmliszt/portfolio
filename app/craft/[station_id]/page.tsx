import { notFound } from "next/navigation";

import { CraftStationModalContent } from "@/app/craft/components/craft-station-modal-content";
import { stations } from "@/app/craft/stations";

import { Modal } from "./modal";

type PageParams = Promise<{
  station_id: string;
}>;

export default async function Page({ params }: { params: PageParams }) {
  const { station_id } = await params;
  const station = stations.find((station) => station.id === station_id);
  if (!station) notFound();

  return (
    <Modal station_id={station_id}>
      <CraftStationModalContent station={station} />
    </Modal>
  );
}

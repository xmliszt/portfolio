import { Metadata } from "next";
import { notFound } from "next/navigation";

import { CraftStationModalContent } from "@/app/craft/components/craft-station-modal-content";
import { stations } from "@/app/craft/stations";
import { openGraph } from "@/app/metadata";

import { Modal } from "./modal";

type StationProps = {
  params: Promise<{ station_id: string }>;
};

export async function generateMetadata(props: StationProps): Promise<Metadata> {
  const params = await props.params;
  const station = stations.find((station) => station.id === params.station_id);

  return {
    title: "craft | 作坊",
    alternates: {
      canonical: `https://www.liyuxuan.dev/craft/${params.station_id}`,
    },
    openGraph: station
      ? {
          ...openGraph,
          title: `Li Yuxuan | craft | ${station.title}`,
          description: station.description,
        }
      : openGraph,
  };
}

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

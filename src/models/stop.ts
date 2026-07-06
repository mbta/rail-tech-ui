import { z } from "zod";
import { allStations } from "src/data/stops";
import { LatLng } from "./latLng";

export type StationId = string;
export const StationId = z.string();

export interface Station {
  id: StationId;
  name: string;
  shortName: string;
  latLng: LatLng;
}

export type StationAndId = {
  id: StationId;
  station: Station;
};

export const stationShortName = (stationId: StationId): string => {
  const station: Station | undefined = allStations[stationId];
  return station?.shortName ?? stationId;
};

export const stationFullName = (stationId: StationId): string => {
  const station: Station | undefined = allStations[stationId];
  return station?.name ?? stationId;
};

export const stationLatLng = (stationId: StationId): LatLng => {
  const station: Station | undefined = allStations[stationId];
  if (station === undefined) {
    throw new Error(`Couldn't get latlng for station id ${stationId}.`);
  }
  return station.latLng;
};

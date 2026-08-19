import { z } from "zod";
import { LatLng } from "./latLng";

export type StationId = string;
export const StationId = z.string();

export interface Station {
  id: StationId;
  name: string;
  shortName: string;
  latLng: LatLng;
  spacingRatio: number;
}

export type StationMap = Readonly<Partial<Record<StationId, Station>>>;

export const stationShortName = (
  map: StationMap,
  stationId: StationId,
): string => {
  return map[stationId]?.shortName ?? stationId;
};

export const stationFullName = (
  map: StationMap,
  stationId: StationId,
): string => {
  return map[stationId]?.name ?? stationId;
};

export const stationLatLng = (
  map: StationMap,
  stationId: StationId,
): LatLng => {
  const station = map[stationId];
  if (station === undefined) {
    throw new Error(`Couldn't get latlng for station id ${stationId}.`);
  }
  return station.latLng;
};

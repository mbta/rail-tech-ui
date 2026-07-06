import { Consist, consistEq } from "src/data";
import { DateTime } from "src/util/dateTime";
import { LatLng } from "./latLng";
import { DirectionId, RouteId } from "./route";
import { StationId } from "./stop";
import { TripEnd, isTripRevenue } from "./trainsheet";

export type TrainLocs = TrainLoc[] | null;

export interface TrainLoc {
  consist: Consist;
  routeId: RouteId | null;
  directionId: DirectionId | null;
  ab: ("ab" | "ba" | null)[];
  stationId: StationId | null;
  stopStatus: StopStatus;
  latLng: LatLng | null;
  heading: number | null;
  timestamp: DateTime | null;
  trip: TripEnd | null;
}

export enum StopStatus {
  InTransitTo,
  StoppedAt,
}

export const stopStatusString = (trainLoc: TrainLoc) => {
  const revenue = isTripRevenue(trainLoc.trip);
  // Non-revenue
  if (!revenue) {
    return trainLoc.stopStatus === StopStatus.StoppedAt ? "At" : "Next stop";
  }

  // Revenue
  return trainLoc.stopStatus === StopStatus.StoppedAt
    ? "Boarding at"
    : "Next stop";
};

export const getTrainLoc = (
  trainLocs: TrainLocs,
  consist: Consist,
  mode: "exact" | "unordered",
): TrainLoc | null => {
  if (trainLocs === null) {
    return null;
  } else {
    return (
      trainLocs.find((trainLoc) =>
        consistEq(trainLoc.consist, consist, mode),
      ) ?? null
    );
  }
};

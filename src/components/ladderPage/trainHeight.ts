import { Consist } from "src/data";
import { stationIdsOnSegmentInDirection } from "src/data/stops";
import { proportionBetweenLatLngs } from "src/models/latLng";
import { DirectionId, RouteId, routeIdToSegment } from "src/models/route";
import { StationId, stationLatLng } from "src/models/stop";
import { StopStatus, TrainLoc } from "src/models/trainLocation";
import { TripEnd } from "src/models/trainsheet";
import { filterMap, reverse } from "src/util/array";
import { DateTime, dateTimeCompare } from "src/util/dateTime";
import { avoidOverlaps, End, Start } from "./avoidOverlaps";

const EXCEPTIONS: Map<StationId, [DirectionId | null]> = new Map([
  ["place-matt", [DirectionId.Eastbound]],
  ["place-asmnl", [DirectionId.Westbound]],
]);

export interface TrainWithHeights {
  routeId: RouteId;
  consist: Consist;
  directionId: DirectionId;
  dotPx: number;
  labelPx: number;
  trip: TripEnd | null;
}

/**
 * The closest two train labels are allowed to be on the ladder
 */
const minSpaceBetweenTrainLabels = 44;

interface TrainWithStopsTraveled {
  routeId: RouteId;
  consist: Consist;
  directionId: DirectionId;
  trip: TripEnd | null;
  timestamp: DateTime | null;
  stopsTraveled: number;
}

interface TrainWithDotPx {
  routeId: RouteId;
  consist: Consist;
  directionId: DirectionId;
  trip: TripEnd | null;
  dotPx: number;
}

/**
 * Calculations for where to display each train on the ladder.
 */
export const trainHeights = (
  trainLocs: TrainLoc[],
  zoom: number,
  directionId: DirectionId,
  stationIdsInOrder: StationId[],
): TrainWithHeights[] => {
  const trainsWithStopsTraveled: TrainWithStopsTraveled[] = filterMap(
    trainLocs,
    (trainLoc) => trainWithStopsTraveled(trainLoc, stationIdsInOrder),
  );
  const trainsTopToBottom: TrainWithStopsTraveled[] = sortTrainsTopToBottom(
    trainsWithStopsTraveled,
    directionId,
  );
  const trainsWithDotPx: TrainWithDotPx[] = trainsTopToBottom.map((train) =>
    trainWithDotPx(train, stationIdsInOrder.length, zoom),
  );
  const trainsWithLabelPx: TrainWithHeights[] =
    avoidOverlapsTrains(trainsWithDotPx);
  return trainsWithLabelPx;
};

/**
 * check if this train will show on the ladder view for its route
 */
export const willTrainShowOnRouteLadder = (trainLoc: TrainLoc): boolean => {
  if (trainLoc.directionId === null || trainLoc.routeId === null) return false;
  const segment = routeIdToSegment(trainLoc.routeId);
  const stationIds = stationIdsOnSegmentInDirection(
    segment,
    trainLoc.directionId,
  );
  return stopsTraveledAlongSegment(stationIds, trainLoc) !== null;
};

const trainWithStopsTraveled = (
  trainLoc: TrainLoc,
  stationIdsInOrder: StationId[],
): TrainWithStopsTraveled | null => {
  // don't even check if the route or direction is missing
  if (trainLoc.routeId === null || trainLoc.directionId === null) {
    return null;
  }
  const stopsTraveled: number | null = stopsTraveledAlongSegment(
    stationIdsInOrder,
    trainLoc,
  );
  if (stopsTraveled === null) {
    return null;
  } else {
    return {
      routeId: trainLoc.routeId,
      consist: trainLoc.consist,
      directionId: trainLoc.directionId,
      trip: trainLoc.trip,
      timestamp: trainLoc.timestamp,
      stopsTraveled: stopsTraveled,
    };
  }
};

/**
 * Returns the number of stops a train has travelled along the segment
 * or null if the train is not on the segment.
 *
 * For example, when looking at the B branch, an Eastbound train at South St has travelled 1.0 stops,
 * and when looking at the Subway, an eastbound C train approaching Copley has travelled 1.8 stops.
 *
 * Fails if the train is neither StoppedAt a station in the list nor approaching a station in the list.
 * Fails if the train is approaching the first stop in the list.
 * Fails if the vehiclePosition doesn't have enough information to determine where it is.
 */
export const stopsTraveledAlongSegment = (
  stationIdsInOrder: StationId[],
  trainLoc: TrainLoc,
): number | null => {
  if (trainLoc.stationId === null || trainLoc.routeId === null) return null;
  const stationIndex = stationIdsInOrder.indexOf(trainLoc.stationId);
  if (stationIndex === -1) return null;
  if (
    trainLoc.stopStatus === StopStatus.StoppedAt ||
    EXCEPTIONS.get(trainLoc.stationId)?.includes(trainLoc.directionId)
  ) {
    return stationIndex;
  } else {
    if (trainLoc.latLng === null) return null;
    // if it's approaching the first station, it's not on the ladder
    if (stationIndex === 0) return null;
    // approximate distance between stations by looking at latlngs
    const prevStationIndex = stationIndex - 1;
    const prevStationId: StationId = stationIdsInOrder[prevStationIndex];
    const proportionBetweenPrevAndNext: number = proportionBetweenLatLngs(
      stationLatLng(prevStationId),
      stationLatLng(trainLoc.stationId),
      trainLoc.latLng,
    );
    /* Enforce a minimum distance from the nearest station, to make the difference
     * more clear between "just left a station" and "stopped at a station".
     * This is especially important in the subway, where there's often an AVI
     * right after a staion, and then no updates for a while.
     */
    return prevStationIndex + clamp(proportionBetweenPrevAndNext, 0.2, 0.8);
  }
};

/**
 * adjust x to be at least min and at most max
 */
const clamp = (x: number, min: number, max: number): number =>
  Math.max(Math.min(x, max), min);

/**
 * Sorts so that the train that should be at the top of the screen (the eastmost train)
 */
const sortTrainsTopToBottom = (
  trains: TrainWithStopsTraveled[],
  directionId: DirectionId,
): TrainWithStopsTraveled[] => {
  const sortedBehindToAhead =
    // the one at the start of the list is just starting its trip
    trains.sort(
      (t1, t2) =>
        t1.stopsTraveled - t2.stopsTraveled ||
        // use the timestamp as a tiebreaker.
        // if two trains are at the same station, the one who arrived later should be at the start of the list
        ((t1.timestamp &&
          t2.timestamp &&
          dateTimeCompare(t2.timestamp, t1.timestamp)) ??
          0),
    );
  if (directionId === DirectionId.Westbound) {
    // if westbound, top to bottom is in the same direction as the stations.
    return sortedBehindToAhead;
  } else {
    return reverse(sortedBehindToAhead);
  }
};

const trainWithDotPx = (
  train: TrainWithStopsTraveled,
  stopsOnSegment: number,
  zoom: number,
): TrainWithDotPx => ({
  routeId: train.routeId,
  consist: train.consist,
  directionId: train.directionId,
  trip: train.trip,
  dotPx: stopsTraveledToPixelsFromTop(
    train.stopsTraveled,
    train.directionId,
    stopsOnSegment,
    zoom,
  ),
});

const stopsTraveledToPixelsFromTop = (
  stopsTraveled: number,
  directionId: DirectionId,
  stopsOnSegment: number,
  zoom: number,
): number => {
  if (directionId === DirectionId.Westbound) {
    // westbound. stopsTraveled is already measured top to bottom.
    return stopsTraveled * zoom;
  } else {
    // eastbound. stopsTraveled is measured bottom to top
    const legsOnSegment = stopsOnSegment - 1;
    const stopsFromTop = legsOnSegment - stopsTraveled;
    return stopsFromTop * zoom;
  }
};

/**
 * Wraps AvoidOverlaps and converts between its generic names and the ladder-specific names
 */
const avoidOverlapsTrains = (
  trainsWithDotPx: TrainWithDotPx[],
): TrainWithHeights[] =>
  avoidOverlaps(
    trainsWithDotPx.map(
      (train: TrainWithDotPx): Start<TrainWithDotPx> => ({
        payload: train,
        start: train.dotPx,
      }),
    ),
    minSpaceBetweenTrainLabels,
  ).map(
    (train: End<TrainWithDotPx>): TrainWithHeights => ({
      ...train.payload,
      labelPx: train.end,
    }),
  );
